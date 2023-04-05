import { Transform, TransformFnParams, Type } from 'class-transformer';
import { IsArray, IsDefined, IsEnum, IsNotEmpty, IsNotEmptyObject, IsNumber, IsObject, IsPositive, IsString, ValidateNested } from 'class-validator';
import { NftFilterJsonValidation, PurchaseTransactionJsonValidations, PurchaseTransactionsFilterJsonValidation, UpdateNftJsonValidations } from '../nft.types';
import sanitizeHtml from 'sanitize-html';

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
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    @IsNotEmpty()
    @IsEnum(ModuleName)
        module: ModuleName;

    @IsArray()
    @ValidateNested()
    @Type(() => UpdateNftJsonValidations)
        nftDtos: UpdateNftJsonValidations[];

    @IsNumber()
    @IsPositive()
        height: number;
}

export class ReqUpdateNftCudosPrice {
    @IsString()
    @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
    @IsNotEmpty()
        id: string;
}

export class ReqCreditPurchaseTransactionEntities {
    @IsArray()
    @ValidateNested()
    @Type(() => PurchaseTransactionJsonValidations)
        purchaseTransactionEntitiesJson: PurchaseTransactionJsonValidations[];
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
