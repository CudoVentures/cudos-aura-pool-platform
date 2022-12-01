import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Sequelize, Transaction } from 'sequelize';

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
                transaction.rollback();
                return throwError(err);
            }),
        );
    }
}
