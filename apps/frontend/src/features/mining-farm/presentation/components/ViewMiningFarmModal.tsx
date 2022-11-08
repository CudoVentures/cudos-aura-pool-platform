import React from 'react';
import { inject, observer } from 'mobx-react';

import ProjectUtils from '../../../../core/utilities/ProjectUtils';
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
                <>
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
                            createDataPreview('Hashrate', miningFarmEntity.formatHashRateInTh()),
                            createDataPreview('Power cost', miningFarmEntity.formatPowerCost()),
                            createDataPreview('Pool fee', miningFarmEntity.formatPoolFee()),
                            createDataPreview('Power consumption per TH', miningFarmEntity.formatPowerConsumptionPerTH()),
                        ] } />
                    <div className = { 'Grid GridColumns3' } >
                        { miningFarmEntity.farmPhotoUrls.map((url, i) => {
                            return (
                                <a
                                    key = { i }
                                    className = { 'MiningFarmPhoto' }
                                    target = { '_blank' }
                                    href = { url }
                                    style = { ProjectUtils.makeBgImgStyle(url) } rel="noreferrer" />
                            )
                        }) }
                    </div>
                </>
            ) }

        </ModalWindow>
    )

}

export default inject((stores) => stores)(observer(ViewMiningFarmModal));
