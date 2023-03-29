import { makeAutoObservable } from 'mobx';
import moment from 'moment';
import S from '../../core/utilities/Main';
import ProjectUtils from '../../core/utilities/ProjectUtils';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayCircleFilledRoundedIcon from '@mui/icons-material/ReplayCircleFilledRounded';

export enum PurchaseTransactionStatus {
    PENDING = '1',
    SUCCESS = '2',
    REFUNDED = '3',
}
export default class PurchaseTransactionEntity {
    txhash: string;
    recipientAddress: string;
    timestamp: number;
    status: PurchaseTransactionStatus;

    constructor() {
        this.txhash = S.Strings.EMPTY;
        this.recipientAddress = S.Strings.EMPTY;
        this.timestamp = 0;
        this.status = PurchaseTransactionStatus.PENDING;

        makeAutoObservable(this);
    }

    isStatusRefunded(): boolean {
        return this.status === PurchaseTransactionStatus.REFUNDED;
    }

    isEthTransaction(): boolean {
        return this.txhash.startsWith('0x');
    }

    getTimeFormatted(): string {
        return moment(new Date(this.timestamp)).format(ProjectUtils.MOMENT_FORMAT_DATE_AND_TIME);
    }

    getStatusSvg() {
        switch (this.status) {
            case PurchaseTransactionStatus.PENDING:
                return InfoIcon;
            case PurchaseTransactionStatus.SUCCESS:
                return CheckCircleIcon;
            case PurchaseTransactionStatus.REFUNDED:
                return ReplayCircleFilledRoundedIcon;
            default:
                return null;
        }
    }

    getStatusString(): string {
        switch (this.status) {
            case PurchaseTransactionStatus.PENDING:
                return 'Pending';
            case PurchaseTransactionStatus.SUCCESS:
                return 'Success';
            case PurchaseTransactionStatus.REFUNDED:
                return 'Refunded';
            default:
                return '';
        }
    }

    static toJson(entity: PurchaseTransactionEntity) {
        if (entity === null) {
            return null;
        }

        return {
            'txhash': entity.txhash,
            'recipientAddress': entity.recipientAddress,
            'timestamp': entity.timestamp,
            'status': entity.status,
        }
    }

    static fromJson(json: any) {
        if (json === null) {
            return null;
        }

        const entity = new PurchaseTransactionEntity();

        entity.txhash = json.txhash ?? entity.txhash;
        entity.recipientAddress = json.recipientAddress ?? entity.recipientAddress;
        entity.timestamp = json.timestamp ?? entity.timestamp;
        entity.status = json.status ?? entity.status;

        return entity;
    }
}
