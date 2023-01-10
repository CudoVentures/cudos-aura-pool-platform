import axios from '../../../../core/utilities/AxiosWrapper';
import { ReqCreditSettings } from '../dto/Requests';
import { ResCreditSettings, ResFetchSettings } from '../dto/Responses';
import SettingsEntity from '../../entities/SettingsEntity';

export default class GeneralApi {

    async fetchSettings(): Promise < SettingsEntity > {
        const { data } = await axios.get('/api/v1/general/fetchSettings');
        const res = new ResFetchSettings(data);
        return res.settingsEntity;
    }

    async creditSettings(settingsEntity: SettingsEntity): Promise < SettingsEntity > {
        const { data } = await axios.post('/api/v1/general/creditSettings', new ReqCreditSettings(settingsEntity));
        const res = new ResCreditSettings(data);
        return res.settingsEntity;
    }
}
