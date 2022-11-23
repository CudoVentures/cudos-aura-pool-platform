import { Model } from 'sequelize';
import { VisitorRepoColumn } from '../visitor.repo';

export class SqlFetchCounts {

    refId: string;
    count: number;

    constructor(sqlRow: Model) {
        this.refId = sqlRow.getDataValue(VisitorRepoColumn.REF_ID);
        this.count = parseInt(sqlRow.getDataValue('count'));
    }

}
