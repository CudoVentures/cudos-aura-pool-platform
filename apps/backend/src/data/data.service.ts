import Path from 'path';
import Fs from 'fs';
import Crypto from 'crypto';
import { Injectable } from '@nestjs/common';

@Injectable()
export default class DataService {

    static DATA_FOLDER = '';
    static URI_PREFIX = '/data/';
    static BASE64_KEY = 'base64,';

    static prepareDataFolder() {
        const folders = __dirname.split(Path.sep);
        while (folders.length > 0 && folders[folders.length - 1] !== 'dist') {
            folders.pop();
        }

        DataService.DATA_FOLDER = Path.join(folders.join(Path.sep), 'data');
        if (Fs.existsSync(DataService.DATA_FOLDER) === false) {
            Fs.mkdirSync(DataService.DATA_FOLDER);
        }
    }

    async trySaveUri(accountId: number, uri: string): Promise < string > {
        if (DataService.isBase64(uri) === false) {
            return uri;
        }

        return new Promise < string >((resolve, reject) => {
            const fileBuffer = DataService.stripBase64FromUriAsBuffer(uri);
            const sha256 = Crypto.createHash('sha256').update(fileBuffer).digest('hex');
            const fileUri = DataService.makeUri(accountId, sha256);
            const absoluteFilePath = DataService.getAbsoluteFilePathByUri(fileUri);
            Fs.writeFile(absoluteFilePath, fileBuffer, (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(fileUri);
            });
        });
    }

    async tryDeleteUri(uri: string): Promise < void > {
        if (DataService.isDataUri(uri) === false) {
            return;
        }

        await new Promise < void >((resolve, reject) => {
            const absoluteFilePath = DataService.getAbsoluteFilePathByUri(uri);
            Fs.unlink(absoluteFilePath, (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            })
        });
    }

    async cleanUpOldUris(oldUris: string[], newUris: string[]): Promise < void > {
        const newUrisSet = new Set(newUris);

        for (let i = oldUris.length; i-- > 0;) {
            const oldUri = oldUris[i];
            if (newUrisSet.has(oldUri) === false) {
                await this.tryDeleteUri(oldUri);
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

    static isBase64(uri: string): boolean {
        return uri.startsWith('data:') && uri.indexOf(DataService.BASE64_KEY) !== -1;
    }

    static isDataUri(uri: string): boolean {
        if (uri.startsWith(DataService.URI_PREFIX) === false) {
            return false;
        }

        uri = DataService.getFileNameFromUri(uri);

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

    static getAbsoluteFilePathByUri(uri: string) {
        const fileName = DataService.getFileNameFromUri(uri);
        return Path.join(DataService.DATA_FOLDER, '/', fileName);
    }

    static getFileNameFromUri(uri: string): string {
        return uri.substring(DataService.URI_PREFIX.length);
    }

    static stripBase64FromUriAsBuffer(uri: string): Buffer {
        const i = uri.indexOf(DataService.BASE64_KEY) + DataService.BASE64_KEY.length;
        return Buffer.from(uri.substring(i), 'base64');
    }

    static makeUri(accountId: number, sha256: string) {
        const random = Math.round(Math.random() * 1024);
        return `${DataService.URI_PREFIX}${accountId}-${random}-${Date.now()}-${sha256}`;
    }

}
