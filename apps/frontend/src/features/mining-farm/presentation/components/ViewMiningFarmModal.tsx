import React from 'react';
import { inject, observer } from 'mobx-react';

import ViewMiningFarmModalStore from '../stores/ViewMiningFarmModalStore';

import ModalWindow from '../../../../core/presentation/components/ModalWindow';
import DataPreviewLayout, { createDataPreview } from '../../../../core/presentation/components/DataPreviewLayout';

import '../styles/view-mining-farm-modal.css';

type Props = {
    viewMiningFarmModalStore?: ViewMiningFarmModalStore;
}

function ViewMiningFarmModal({ viewMiningFarmModalStore }: Props) {

    const miningFarmEntity = viewMiningFarmModalStore.miningFarmEntity;

    return (
        <ModalWindow
            className = { 'ViewMiningFarmModal' }
            modalStore = { viewMiningFarmModalStore } >

            { viewMiningFarmModalStore.visible === true && (
                <DataPreviewLayout
                    dataPreviews = { [
                        createDataPreview('Farm Name', miningFarmEntity.name),
                        createDataPreview('Description', miningFarmEntity.description),
                        createDataPreview('Legal Entity Name', miningFarmEntity.legalName),
                        createDataPreview('Primary Account Owner Full Name', miningFarmEntity.primaryAccountOwnerName),
                        createDataPreview('Primary Account Owner Email', miningFarmEntity.primaryAccountOwnerEmail),
                        createDataPreview('Manufacturers', viewMiningFarmModalStore.getSelectedManufacturersNames()),
                        createDataPreview('Miners', viewMiningFarmModalStore.getSelectedMinersNames()),
                        createDataPreview('Energy sources', viewMiningFarmModalStore.getSelectedEnergySourcesNames()),
                        createDataPreview('Machines Location', miningFarmEntity.machinesLocation),
                        createDataPreview('Hashrate', miningFarmEntity.hashrate),
                        createDataPreview('Power cost', miningFarmEntity.powerCost),
                        createDataPreview('Pool fee', miningFarmEntity.poolFee),
                        createDataPreview('Power consumption per TH', miningFarmEntity.powerConsumptionPerTh),
                    ] } />
            ) }

        </ModalWindow>
    )

}

export default inject((stores) => stores)(observer(ViewMiningFarmModal));
