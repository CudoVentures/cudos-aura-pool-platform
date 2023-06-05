import { action, makeObservable, observable, runInAction } from 'mobx';

import ModalStore from '../../../core/presentation/stores/ModalStore';
import GeneralStore from '../../../general/presentation/stores/GeneralStore';
import EnergySourceEntity from '../../entities/EnergySourceEntity';
import ManufacturerEntity from '../../entities/ManufacturerEntity';
import MinerEntity from '../../entities/MinerEntity';
import MiningFarmEntity from '../../entities/MiningFarmEntity';
import MiningFarmRepo from '../repos/MiningFarmRepo';

export default class ViewMiningFarmModalStore extends ModalStore {

    generalStore: GeneralStore;
    miningFarmRepo: MiningFarmRepo;

    manufacturerEntitiesMap: Map < string, ManufacturerEntity >;
    minerEntitiesMap: Map < string, MinerEntity >;
    energySourceEntitiesMap: Map < string, EnergySourceEntity >;

    @observable onSave: () => void;
    @observable miningFarmEntity: MiningFarmEntity;
    @observable editedCudosMintRoyalties: string;
    @observable editedCudosResaleRoyalties: string;
    @observable editedFarmStartTime: Date;

    constructor(generalStore: GeneralStore, miningFarmRepo: MiningFarmRepo) {
        super();

        this.generalStore = generalStore;
        this.miningFarmRepo = miningFarmRepo;

        this.manufacturerEntitiesMap = null;
        this.minerEntitiesMap = null;
        this.energySourceEntitiesMap = null;

        this.miningFarmEntity = null;
        this.editedCudosMintRoyalties = '';
        this.editedCudosResaleRoyalties = '';
        this.editedFarmStartTime = null;

        makeObservable(this);
    }

    getSelectedManufacturersNames(): string {
        return this.miningFarmEntity.manufacturerIds.map((manufacturerId) => {
            return this.manufacturerEntitiesMap.get(manufacturerId).name;
        }).join(', ');
    }

    getSelectedMinersNames(): string {
        return this.miningFarmEntity.minerIds.map((minerId) => {
            return this.minerEntitiesMap.get(minerId).name;
        }).join(', ');
    }

    getSelectedEnergySourcesNames(): string {
        return this.miningFarmEntity.energySourceIds.map((energySourceId) => {
            return this.energySourceEntitiesMap.get(energySourceId).name;
        }).join(', ');
    }

    @action
    async showSignal(miningFarmEntity: MiningFarmEntity, onSave: () => void) {
        this.miningFarmEntity = miningFarmEntity;
        this.onSave = onSave;

        const [manufacturerEntities, minerEntities, energySourceEntities] = await Promise.all([
            this.miningFarmRepo.fetchManufacturers(),
            this.miningFarmRepo.fetchMiners(),
            this.miningFarmRepo.fetchEnergySources(),
            this.generalStore.init(),
        ]);

        const manufacturerEntitiesMap = new Map();
        manufacturerEntities.forEach((manufacturerEntity) => {
            manufacturerEntitiesMap.set(manufacturerEntity.manufacturerId, manufacturerEntity);
        });

        const minerEntitiesMap = new Map();
        minerEntities.forEach((minerEntity) => {
            minerEntitiesMap.set(minerEntity.minerId, minerEntity);
        });

        const energySourceEntitiesMap = new Map();
        energySourceEntities.forEach((energySourceEntity) => {
            energySourceEntitiesMap.set(energySourceEntity.energySourceId, energySourceEntity);
        });

        runInAction(() => {
            this.manufacturerEntitiesMap = manufacturerEntitiesMap;
            this.minerEntitiesMap = minerEntitiesMap;
            this.energySourceEntitiesMap = energySourceEntitiesMap;

            if (miningFarmEntity.isCudosMintNftRoyaltiesPercentSet() === false) {
                miningFarmEntity.cudosMintNftRoyaltiesPercent = this.generalStore.settingsEntity.firstSaleCudosRoyaltiesPercent;
            }

            if (miningFarmEntity.isCudosResaleNftRoyaltiesPercentSet() === false) {
                miningFarmEntity.cudosResaleNftRoyaltiesPercent = this.generalStore.settingsEntity.resaleCudosRoyaltiesPercent;
            }

            this.editedCudosMintRoyalties = miningFarmEntity.cudosMintNftRoyaltiesPercent.toString();
            this.editedCudosResaleRoyalties = miningFarmEntity.cudosResaleNftRoyaltiesPercent.toString();
            this.editedFarmStartTime = miningFarmEntity.hasStartTime() === true ? new Date(miningFarmEntity.farmStartTime) : null;

            this.show();
        });
    }

    hide = action(() => {
        this.miningFarmEntity = null;
        this.onSave = null;

        super.hide();
    })

    async saveChanges() {
        const onSave = this.onSave;

        this.miningFarmEntity.markApproved();
        await this.miningFarmRepo.creditMiningFarm(this.miningFarmEntity);

        this.hide();
        onSave();
    }
}
