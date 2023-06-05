import Path from 'path';
import Fs from 'fs';
import Crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bucket, Storage } from '@google-cloud/storage';

@Injectable()
export default class DataService {

    static LOCAL_URI_PREFIX = '/data/';
    static BASE64_KEY = 'base64,';

    dataFolder = '';
    absolutePathToGcloudConfig = '';
    gCloudUriPrefix = 'https://storage.googleapis.com/'

    storage: Storage;
    bucketName: string;
    bucket: Bucket;

    constructor(private configService: ConfigService) {
        this.dataFolder = DataService.getDataFolderAbsolutePath();
        this.absolutePathToGcloudConfig = Path.join(DataService.getGcloudConfigFolderAbsolutePath(), 'gcloud.json');

        try {
            const gcloudProjectId = this.configService.getOrThrow < string >('APP_GCLOUD_PROJECT_ID');
            this.bucketName = this.configService.getOrThrow < string >('APP_GCLOUD_BUCKET_NAME');
            this.gCloudUriPrefix = `https://storage.googleapis.com/${this.bucketName}/`;

            if (Fs.existsSync(this.absolutePathToGcloudConfig) === false) {
                throw new Error('gCloud config is missing');
            }
            this.storage = new Storage({
                projectId: gcloudProjectId,
                keyFilename: this.absolutePathToGcloudConfig,
            })
            this.bucket = this.storage.bucket(this.bucketName);
        } catch (ex) {
            this.storage = null;
        }
    }

    private static getDistFolderAbsolutePath(): string {
        const folders = __dirname.split(Path.sep);
        while (folders.length > 0 && folders[folders.length - 1] !== 'dist') {
            folders.pop();
        }

        return Path.join(folders.join(Path.sep));
    }

    private static getDataFolderAbsolutePath(): string {
        const distFolderAbsolutePath = DataService.getDistFolderAbsolutePath();
        return Path.join(distFolderAbsolutePath, 'data');
    }

    private static getGcloudConfigFolderAbsolutePath(): string {
        const distFolderAbsolutePath = DataService.getDistFolderAbsolutePath();
        const gcloudConfigAbsolutePath = Path.join(distFolderAbsolutePath, 'config');
        if (Fs.existsSync(gcloudConfigAbsolutePath) === true) {
            return gcloudConfigAbsolutePath;
        }

        return Path.join(distFolderAbsolutePath, '..', 'config');
    }

    prepareDataFolder() {
        if (this.storage !== null) {
            return;
        }

        if (Fs.existsSync(this.dataFolder) === false) {
            Fs.mkdirSync(this.dataFolder);
        }
    }

    async trySaveUri(accountId: number, uri: string): Promise < string > {
        if (DataService.isBase64(uri) === false) {
            return uri;
        }

        return new Promise < string >((resolve, reject) => {
            const fileBuffer = DataService.stripBase64FromUriAsBuffer(uri);
            const sha256 = Crypto.createHash('sha256').update(fileBuffer).digest('hex');
            if (this.storage !== null) {
                const fileUri = this.makeGcloudUri(accountId, sha256);
                const fileName = this.getFileNameFromGcloudUri(fileUri);
                this.bucket.file(fileName).save(fileBuffer, (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(fileUri);
                });
            } else {
                const fileUri = DataService.makeLocalUri(accountId, sha256);
                const absoluteFilePath = this.getAbsoluteFilePathByLocalUri(fileUri);
                Fs.writeFile(absoluteFilePath, fileBuffer, (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(fileUri);
                });
            }
        });
    }

    async tryDeleteUri(uri: string): Promise < void > {
        if (this.isDataUri(uri) === false) {
            return;
        }

        await new Promise < void >((resolve, reject) => {
            if (this.isGcloudDataUri(uri) === true) {
                if (this.storage !== null) {
                    this.bucket.file(this.getFileNameFromGcloudUri(uri)).delete((err) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        resolve();
                    });
                } else {
                    reject(new Error('Trying ot delete a gCloud storage file but there is no configured gCloud Service'));
                }
            } else if (DataService.isLocalDataUri(uri) === true) {
                const absoluteFilePath = this.getAbsoluteFilePathByLocalUri(uri);
                Fs.unlink(absoluteFilePath, (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve();
                });
            } else {
                reject(new Error(`Trying to delete unknow data uri ${uri}`));
            }
        });
    }

    async cleanUpOldUris(oldUris: string[], newUris: string[]): Promise < void > {
        const newUrisSet = new Set(newUris);

        for (let i = oldUris.length; i-- > 0;) {
            const oldUri = oldUris[i];
            if (newUrisSet.has(oldUri) === false) {
                try {
                    await this.tryDeleteUri(oldUri);
                } catch (ex) {
                    console.log('unable to delete uri', oldUri);
                    console.log(ex);
                }
            }
        }
    }

    async cleanUpNewUris(oldUris: string[], newUris: string[]): Promise < void > {
        const oldUrisSet = new Set(oldUris);

        for (let i = newUris.length; i-- > 0;) {
            const newUri = newUris[i];
            if (oldUrisSet.has(newUri) === false) {
                await this.tryDeleteUri(newUri);
            }
        }
    }

    isUrlUploadedImage(uri: string) {
        if (this.isGcloudDataUri(uri) === true) {
            return false;
        }
        if (DataService.isBase64(uri) === true) {
            return false;
        }
        if (DataService.isLocalDataUri(uri) === true) {
            return false;
        }
        if (uri.startsWith('http://') === true || uri.startsWith('https://') === true) {
            return true;
        }
        return false;
    }

    private static isBase64(uri: string): boolean {
        return uri.startsWith('data:') && uri.indexOf(DataService.BASE64_KEY) !== -1;
    }

    private static isLocalDataUri(uri: string): boolean {
        return uri.startsWith(DataService.LOCAL_URI_PREFIX) === true;
    }

    private isGcloudDataUri(uri: string): boolean {
        return uri.startsWith(this.gCloudUriPrefix) === true;
    }

    private isDataUri(uri: string): boolean {
        if (DataService.isLocalDataUri(uri)) {
            uri = DataService.getFileNameFromLocalUri(uri);
        } else if (this.isGcloudDataUri(uri) === true) {
            uri = this.getFileNameFromGcloudUri(uri);
        } else {
            return false;
        }

        const components = uri.split('-');
        if (components.length !== 4) {
            return false;
        }

        for (let i = 2; i-- > 0;) {
            if (Number.isNaN(components[i]) === true) {
                return false;
            }
        }

        return true;
    }

    private static stripBase64FromUriAsBuffer(uri: string): Buffer {
        const i = uri.indexOf(DataService.BASE64_KEY) + DataService.BASE64_KEY.length;
        return Buffer.from(uri.substring(i), 'base64');
    }

    private static generateFileName(accountId: number, sha256: string): string {
        const random = Math.round(Math.random() * 1024);
        return `${accountId}-${random}-${Date.now()}-${sha256}`;
    }

    private getAbsoluteFilePathByLocalUri(uri: string) {
        const fileName = DataService.getFileNameFromLocalUri(uri);
        return Path.join(this.dataFolder, '/', fileName);
    }

    private static getFileNameFromLocalUri(uri: string): string {
        return uri.substring(DataService.LOCAL_URI_PREFIX.length);
    }

    private getFileNameFromGcloudUri(uri: string): string {
        return uri.substring(this.gCloudUriPrefix.length);
    }

    private static makeLocalUri(accountId: number, sha256: string) {
        return `${DataService.LOCAL_URI_PREFIX}${DataService.generateFileName(accountId, sha256)}`;
    }

    private makeGcloudUri(accountId: number, sha256: string) {
        return `${this.gCloudUriPrefix}${DataService.generateFileName(accountId, sha256)}`;
    }

}
