import { Type } from 'class-transformer';
import { IsDefined, IsNotEmptyObject, IsObject, ValidateNested } from 'class-validator';
import { SettingsJsonValidator } from '../general.types';

export class ReqCreditSettings {

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => SettingsJsonValidator)
        settingsEntity: SettingsJsonValidator;

}
