import { Type } from 'class-transformer';
import { IsDefined, IsNotEmptyObject, IsObject, ValidateNested } from 'class-validator';
import { MiningFarmJsonValidator } from '../../farm/farm.types';
import { NftJsonValidator } from '../../nft/nft.types';

export class ReqSignalVisitMiningFarm {

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => MiningFarmJsonValidator)
        miningFarmEntity: MiningFarmJsonValidator;

}

export class ReqSignalVisitNft {

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => NftJsonValidator)
        nftEntity: NftJsonValidator;

}
