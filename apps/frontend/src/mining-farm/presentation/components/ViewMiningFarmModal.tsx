import React from 'react';
import { inject, observer } from 'mobx-react';

import ProjectUtils from '../../../core/utilities/ProjectUtils';
import ViewMiningFarmModalStore from '../stores/ViewMiningFarmModalStore';

import ModalWindow from '../../../core/presentation/components/ModalWindow';
import DataPreviewLayout, { createDataPreview } from '../../../core/presentation/components/DataPreviewLayout';

import '../styles/view-mining-farm-modal.css';
import Input, { InputType } from '../../../core/presentation/components/Input';
import InputAdornment from '@mui/material/InputAdornment/InputAdornment';
import Actions, { ActionsLayout } from '../../../core/presentation/components/Actions';
import Button from '../../../core/presentation/components/Button';

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
                            createDataPreview('Hashrate', miningFarmEntity.formatHashPowerInTh()),
                            createDataPreview('Resale royalties address', miningFarmEntity.cudosResaleNftRoyaltiesPercent),
                            createDataPreview('Pool rewards address', miningFarmEntity.rewardsFromPoolBtcAddress),
                            createDataPreview('Leftover rewards address', miningFarmEntity.leftoverRewardsBtcAddress),
                            createDataPreview('Maintenance fee address', miningFarmEntity.maintenanceFeePayoutBtcAddress),
                            createDataPreview(
                                'Cudos NFT Mint Royalties',
                                <Input
                                    className={'FlexRow RoyaliesInput'}
                                    value = { viewMiningFarmModalStore.editedCudosMintRoyalties }
                                    onChange = { viewMiningFarmModalStore.setEditedCudosMintRoyalties }
                                    inputType = {InputType.REAL}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end" >
                                            %
                                        </InputAdornment>,
                                    }}
                                />,
                            ),
                            createDataPreview(
                                'Cudos NFT Resale Royalties',
                                <Input
                                    className={'FlexRow RoyaliesInput'}
                                    value = { viewMiningFarmModalStore.editedCudosResaleRoyalties }
                                    onChange = { viewMiningFarmModalStore.setEditedCudosResaleRoyalties }
                                    inputType = {InputType.REAL}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end" >
                                            %
                                        </InputAdornment>,
                                    }}
                                />,
                            ),
                        ] } />
                    <div className = { 'ImgsCnt Grid GridColumns3' } >
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
                    <Actions className = { 'ViewMiningFarmsActions' } layout = { ActionsLayout.LAYOUT_COLUMN_CENTER } >
                        <Button
                            disabled = { !viewMiningFarmModalStore.areChangesMade() }
                            onClick = { viewMiningFarmModalStore.saveChanges } >
                            Save Changes
                        </Button>
                    </Actions>
                </>
            ) }

        </ModalWindow>
    )

}

export default inject((stores) => stores)(observer(ViewMiningFarmModal));
