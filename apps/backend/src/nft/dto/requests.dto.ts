import { Type } from 'class-transformer';
import { IsArray, IsDefined, IsEnum, IsNotEmpty, IsNotEmptyObject, IsNumber, IsObject, IsString, ValidateNested } from 'class-validator';
import PurchaseTransactionsFilterModel from '../../../../frontend/src/nft/entities/PurchaseTransactionsFilterModel';
import { NftFilterJsonValidation, PurchaseTransactionJsonValidations, PurchaseTransactionsFilterJsonValidation, UpdateNftJsonValidations } from '../nft.types';

export class ReqNftsByFilter {
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => NftFilterJsonValidation)
        nftFilterJson: NftFilterJsonValidation;
}

export enum ModuleName {
    MARKETPLACE = 'marketplace',
    NFT = 'nft'
}

export class ReqUpdateNftChainData {
    @IsString()
    @IsNotEmpty()
    @IsEnum(ModuleName)
        module: ModuleName;

    @IsArray()
    @ValidateNested()
    @Type(() => UpdateNftJsonValidations)
        nftDtos: UpdateNftJsonValidations[];

    @IsNumber()
        height: number;
}

export class ReqUpdateNftCudosPrice {
    @IsString()
    @IsNotEmpty()
        id: string;
}

export class ReqCreditPurchaseTransactionEntities {
    @IsArray()
    @ValidateNested()
    @Type(() => PurchaseTransactionJsonValidations)
        purcahseTransactionEntitiesJson: PurchaseTransactionJsonValidations[];
}

export class ReqFetchPurchaseTransactions {
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => PurchaseTransactionsFilterJsonValidation)
        purchaseTransactionsFilterJson: PurchaseTransactionsFilterJsonValidation;

    @IsArray()
    @ValidateNested()
    @Type(() => PurchaseTransactionJsonValidations)
        sessionStoragePurchaseTransactionEntitiesJson: PurchaseTransactionJsonValidations[];
}
