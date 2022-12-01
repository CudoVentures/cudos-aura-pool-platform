import EnergySourceEntity from '../../entities/EnergySourceEntity';
import ManufacturerEntity from '../../entities/ManufacturerEntity';
import MinerEntity from '../../entities/MinerEntity';
import MiningFarmDetailsEntity from '../../entities/MiningFarmDetailsEntity';
import MiningFarmEntity, { MiningFarmStatus } from '../../entities/MiningFarmEntity';
import MiningFarmFilterModel from '../../utilities/MiningFarmFilterModel';

export default interface MiningFarmRepo {

    setPresentationActionsCallbacks(enableActions: () => void, disableActions: () => void);
    setPresentationAlertCallbacks(showAlert: (msg: string, positiveListener : null | (() => boolean | void), negativeListener: null | (() => boolean | void)) => void);

    fetchAllMiningFarms(status?: MiningFarmStatus): Promise < MiningFarmEntity[] >;
    fetchPopularMiningFarms(status?: MiningFarmStatus): Promise < MiningFarmEntity[] >;
    fetchMiningFarmsByIds(miningFarmIds: string[], status?: MiningFarmStatus): Promise < MiningFarmEntity[] >;
    fetchMiningFarmById(miningFarmId: string, status?: MiningFarmStatus): Promise < MiningFarmEntity >;
    fetchMiningFarmBySessionAccountId(status?: MiningFarmStatus): Promise < MiningFarmEntity >;
    fetchMiningFarmsByFilter(miningFarmFilterModel: MiningFarmFilterModel, status?: MiningFarmStatus): Promise < {miningFarmEntities: MiningFarmEntity[], total: number} >;
    fetchMiningFarmDetailsById(miningFarmId: string): Promise < MiningFarmDetailsEntity >;
    fetchMiningFarmsDetailsByIds(miningFarmIds: string[]): Promise < MiningFarmDetailsEntity[] >;
    creditMiningFarm(miningFarmEntity: MiningFarmEntity): Promise < void >;
    creditMiningFarms(miningFarmEntities: MiningFarmEntity[]): Promise < void >;
    approveMiningFarms(miningFarmEntities: MiningFarmEntity[]): Promise < void >;
    fetchManufacturers(): Promise < ManufacturerEntity[] >;
    fetchMiners(): Promise < MinerEntity[] >;
    fetchEnergySources(): Promise < EnergySourceEntity[] >;
    creditManufacturer(manufacturerEntity: ManufacturerEntity): Promise < void >;
    creditMiner(minerEntity: MinerEntity): Promise < void >;
    creditEnergySource(energySourceEntity: EnergySourceEntity): Promise < void >;
}
