import { action, makeObservable, observable, runInAction } from 'mobx';

import ModalStore from '../../../../core/presentation/stores/ModalStore';
import S from '../../../../core/utilities/Main';
import EnergySourceEntity from '../../entities/EnergySourceEntity';
import ManufacturerEntity from '../../entities/ManufacturerEntity';
import MinerEntity from '../../entities/MinerEntity';
import MiningFarmEntity from '../../entities/MiningFarmEntity';
import MiningFarmRepo from '../repos/MiningFarmRepo';

export default class ViewMiningFarmModalStore extends ModalStore {

    miningFarmRepo: MiningFarmRepo;

    manufacturerEntitiesMap: Map < string, ManufacturerEntity >;
    minerEntitiesMap: Map < string, MinerEntity >;
    energySourceEntitiesMap: Map < string, EnergySourceEntity >;

    @observable miningFarmEntity: MiningFarmEntity;
    @observable editedCudosMintRoyalties: number;
    @observable editedCudosResaleRoyalties: number;

    constructor(miningFarmRepo: MiningFarmRepo) {
        super();

        this.miningFarmRepo = miningFarmRepo;

        this.manufacturerEntitiesMap = null;
        this.minerEntitiesMap = null;
        this.energySourceEntitiesMap = null;

        this.miningFarmEntity = null;
        this.editedCudosMintRoyalties = S.NOT_EXISTS;
        this.editedCudosResaleRoyalties = S.NOT_EXISTS;

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
    async showSignal(miningFarmEntity: MiningFarmEntity) {
        this.miningFarmEntity = miningFarmEntity;

        const manufacturerEntities = await this.miningFarmRepo.fetchManufacturers();
        const manufacturerEntitiesMap = new Map();
        manufacturerEntities.forEach((manufacturerEntity) => {
            manufacturerEntitiesMap.set(manufacturerEntity.manufacturerId, manufacturerEntity);
        });

        const minerEntities = await this.miningFarmRepo.fetchMiners();
        const minerEntitiesMap = new Map();
        minerEntities.forEach((minerEntity) => {
            minerEntitiesMap.set(minerEntity.minerId, minerEntity);
        });

        const energySourceEntities = await this.miningFarmRepo.fetchEnergySources();
        const energySourceEntitiesMap = new Map();
        energySourceEntities.forEach((energySourceEntity) => {
            energySourceEntitiesMap.set(energySourceEntity.energySourceId, energySourceEntity);
        });

        runInAction(() => {
            this.manufacturerEntitiesMap = manufacturerEntitiesMap;
            this.minerEntitiesMap = minerEntitiesMap;
            this.energySourceEntitiesMap = energySourceEntitiesMap;

            this.editedCudosMintRoyalties = miningFarmEntity.cudosMintNftRoyaltiesPercent;
            this.editedCudosResaleRoyalties = miningFarmEntity.cudosResaleNftRoyaltiesPercent;

            this.show();
        });

    }

    hide = action(() => {
        this.miningFarmEntity = null;

        super.hide();
    })

    setEditedCudosMintRoyalties = action((value) => {
        this.editedCudosMintRoyalties = Number(value);
    })

    setEditedCudosResaleRoyalties = action((value) => {
        this.editedCudosResaleRoyalties = Number(value);
    })

    areChangesMade(): boolean {
        return this.editedCudosMintRoyalties !== this.miningFarmEntity.cudosMintNftRoyaltiesPercent
            || this.editedCudosResaleRoyalties !== this.miningFarmEntity.cudosResaleNftRoyaltiesPercent;
    }

    saveChanges = async () => {
        this.miningFarmEntity.cudosMintNftRoyaltiesPercent = this.editedCudosMintRoyalties;
        this.miningFarmEntity.cudosResaleNftRoyaltiesPercent = this.editedCudosResaleRoyalties;
        await this.miningFarmRepo.creditMiningFarm(this.miningFarmEntity);
        this.hide();
    }
}
