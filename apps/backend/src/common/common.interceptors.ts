import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Sequelize, Transaction } from 'sequelize';

import { Response as ExpressResponse } from 'express';
import { AccountLockedException, WrongUserOrPasswordException } from './errors/errors';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {

    constructor(
        @InjectConnection()
        private readonly sequelizeInstance: Sequelize,
    ) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise < Observable < any > > {
        const httpContext = context.switchToHttp();
        const req = httpContext.getRequest();

        const transaction: Transaction = await this.sequelizeInstance.transaction();
        req.transaction = transaction;
        return next.handle().pipe(
            tap(() => {
                transaction.commit();
            }),
            catchError((err) => {
                if (err instanceof AccountLockedException || err instanceof WrongUserOrPasswordException) {
                    transaction.commit();
                } else {
                    transaction.rollback();
                }
                return throwError(() => err);
            }),
        );
    }
}

@Injectable()
export class ResponseAddHeadersInterceptor implements NestInterceptor {
    intercept(context:ExecutionContext, next:CallHandler): Observable<any> {

        const ResponseObj:ExpressResponse = context.switchToHttp().getResponse();

        ResponseObj.setHeader('Content-Security-Policy', 'script-src \'self\'; frame-ancestors \'none\'');
        ResponseObj.setHeader('X-Frame-Option', 'DENY');

        return next.handle();
    }
}
