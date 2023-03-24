import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { createFileLogger } from './utils/logger';
import { Logger } from 'winston';
import { ConfigService } from '@nestjs/config';
import { CONFIG_SERVICE_ROOT_PATH_KEY } from '../common/utils';
import { RequestWithLogger } from '../common/commont.types';
import { v4 as uuid } from 'uuid';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {

    rootPath: string;
    requestsLogger: Logger;

    constructor(private configService: ConfigService) {
        this.rootPath = this.configService.get < string >(CONFIG_SERVICE_ROOT_PATH_KEY);
        this.requestsLogger = createFileLogger(`${this.rootPath}/logs/requestsLogger.log`);
    }

    use(req: RequestWithLogger, res: Response, next: NextFunction) {
        const requestId = uuid();
        req.logger = createFileLogger(`${this.rootPath}/logs/logger.log`, requestId);

        const start = Date.now();
        this.requestsLogger.info(`Starting request ${req.method} ${req.originalUrl} ${JSON.stringify(req.body)}`, {
            label: requestId,
        });
        res.on('finish', () => {
            const duration = Date.now() - start;
            this.requestsLogger.info(`Ending request ${req.originalUrl} ${res.statusCode} ${duration}ms`, {
                label: requestId,
            });
        });
        next();
    }

}
