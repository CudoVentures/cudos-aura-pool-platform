import { Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { createFileLogger } from './utils/logger';
import { ConfigService } from '@nestjs/config';
import { CONFIG_SERVICE_ROOT_PATH_KEY } from '../common/utils';

@Injectable()
export class LoggerService {

    rootPath: string;
    commonLogger: Logger;

    constructor(private configService: ConfigService) {
        this.rootPath = this.configService.get < string >(CONFIG_SERVICE_ROOT_PATH_KEY);
        this.commonLogger = createFileLogger(`${this.rootPath}/logs/commonLogger.log`);
    }

    info(msg: string) {
        this.commonLogger.info(msg);
    }

}
