import React, { useEffect, useRef, useState } from 'react';
import { inject, observer } from 'mobx-react';

import ProjectUtils from '../../../core/utilities/ProjectUtils';
import ViewMiningFarmModalStore from '../stores/ViewMiningFarmModalStore';

import ModalWindow from '../../../core/presentation/components/ModalWindow';
import DataPreviewLayout, { DataRowsGap, DataRowsLayout, createDataPreview } from '../../../core/presentation/components/DataPreviewLayout';

import '../styles/view-mining-farm-modal.css';
import Input, { InputType } from '../../../core/presentation/components/Input';
import InputAdornment from '@mui/material/InputAdornment/InputAdornment';
import Actions, { ActionsLayout } from '../../../core/presentation/components/Actions';
import Button from '../../../core/presentation/components/Button';
import { runInAction } from 'mobx';
import TextWithTooltip from '../../../core/presentation/components/TextWithTooltip';
import ValidationState from '../../../core/presentation/stores/ValidationState';
import AlertStore from '../../../core/presentation/stores/AlertStore';
import S from '../../../core/utilities/Main';
import NewLine from '../../../core/presentation/components/NewLine';
import SingleDatepicker from '../../../core/presentation/components/SingleDatepicker';

type Props = {
    alertStore?: AlertStore;
    viewMiningFarmModalStore?: ViewMiningFarmModalStore;
}

function ViewMiningFarmModal({ alertStore, viewMiningFarmModalStore }: Props) {

    const miningFarmEntity = viewMiningFarmModalStore.miningFarmEntity;

    const validationState = useRef(new ValidationState()).current;
    const farmPayoutAddressValidation = useRef(validationState.addBitcoinAddressValidation('Invalid bitcoin address')).current;
    const mintRoyaltiesValidation = useRef(validationState.addEmptyValidation('Cannot be empty')).current;
    const resaleRoyaltiesValidation = useRef(validationState.addEmptyValidation('Cannot be empty')).current;
    const farmStartTimeValidation = useRef(validationState.addEmptyValidation('Cannot be empty')).current;
    const farmBtcWalletNameValidationNoEmpty = useRef(validationState.addEmptyValidation('Empty name')).current;
    const farmBtcWalletNameValidationNoSpace = useRef(validationState.addNoSpaceValidation('Contains space')).current;
    const farmBtcWalletNameLowercaseAndNumber = useRef(validationState.addLowercaseAndNumbersValidation('Must contains only lowercase letters and numbers')).current;
    const farmSubAccountNameValidationNoEmpty = useRef(validationState.addEmptyValidation('Empty name')).current;
    const farmSubAccountNameValidationNoSpace = useRef(validationState.addNoSpaceValidation('Contains space')).current;
    const farmSubAccountNameLowercaseAndNumber = useRef(validationState.addLowercaseAndNumbersValidation('Must contains only lowercase letters and numbers')).current;
    const notNegativeValidation = useRef(validationState.addNotNegativeValidation('Value must be greater or equal to 0.')).current;

    const [areChangesMade, setAreChangesMade] = useState(false);

    useEffect(() => {
        validationState.setShowErrors(false);
        setAreChangesMade(false);
    }, [viewMiningFarmModalStore.miningFarmEntity]);

    function setEditedCudosMintRoyalties(value) {
        value = ProjectUtils.clampInputValue(value, 0, 10);

        runInAction(() => {
            viewMiningFarmModalStore.editedCudosMintRoyalties = value;
            miningFarmEntity.cudosMintNftRoyaltiesPercent = value !== '' ? parseFloat(value) : S.NOT_EXISTS;
            setAreChangesMade(true);
        });
    }

    function setEditedCudosResaleRoyalties(value) {
        value = ProjectUtils.clampInputValue(value, 0, 10);

        runInAction(() => {
            viewMiningFarmModalStore.editedCudosResaleRoyalties = value;
            miningFarmEntity.cudosResaleNftRoyaltiesPercent = value !== '' ? parseFloat(value) : S.NOT_EXISTS;
            setAreChangesMade(true);
        });
    }

    function onChangeRewardsFromPoolBtcAddress(value) {
        runInAction(() => {
            miningFarmEntity.rewardsFromPoolBtcAddress = value;
            setAreChangesMade(true);
        })
    }

    function onChangeRewardsFromPoolBtcWalletName(value) {
        runInAction(() => {
            miningFarmEntity.rewardsFromPoolBtcWalletName = value;
            setAreChangesMade(true);
        })
    }

    function onChangeSubAccounttName(value) {
        runInAction(() => {
            miningFarmEntity.subAccountName = value;
            setAreChangesMade(true);
        })
    }

    function setEditedFarmStartTime(value: Date) {
        runInAction(() => {
            viewMiningFarmModalStore.editedFarmStartTime = value;
            miningFarmEntity.farmStartTime = value !== null ? value.getTime() : S.NOT_EXISTS;
            setAreChangesMade(true);
        })
    }

    function onSave() {
        if (validationState.getIsErrorPresent() === true) {
            validationState.setShowErrors(true);
            return
        }

        if (miningFarmEntity.areBtcPayoutAddressesUnique() === false) {
            alertStore.show('The three BTC payout address must be unique therefore a single address could not have multiple purposes');
            return;
        }

        viewMiningFarmModalStore.saveChanges();
    }

    return (
        <ModalWindow
            className = { 'ViewMiningFarmModal LargeContent' }
            modalStore = { viewMiningFarmModalStore } >

            { viewMiningFarmModalStore.visible === true && (
                <>
                    <DataPreviewLayout
                        dataRowsLayout={DataRowsLayout.COLUMN}
                        gap={DataRowsGap.GAP_25}
                        dataPreviews = { [
                            createDataPreview('Farm Name', miningFarmEntity.name),
                            createDataPreview('Description', <NewLine text = { miningFarmEntity.description } />),
                            createDataPreview('Legal Entity Name', miningFarmEntity.legalName),
                            createDataPreview('Primary Account Owner Full Name', miningFarmEntity.primaryAccountOwnerName),
                            createDataPreview('Primary Account Owner Email', miningFarmEntity.primaryAccountOwnerEmail),
                            createDataPreview('Manufacturers', viewMiningFarmModalStore.getSelectedManufacturersNames()),
                            createDataPreview('Miners', viewMiningFarmModalStore.getSelectedMinersNames()),
                            createDataPreview('Energy sources', viewMiningFarmModalStore.getSelectedEnergySourcesNames()),
                            createDataPreview('Machines Location', miningFarmEntity.machinesLocation),
                            createDataPreview('Hashrate', miningFarmEntity.formatHashPowerInTh()),
                            createDataPreview('Farm Maintenance Fee', miningFarmEntity.formatMaintenanceFeesInBtc()),
                            createDataPreview('Resale royalties address', miningFarmEntity.resaleFarmRoyaltiesCudosAddress),
                            createDataPreview(
                                // 'Pool rewards Address',
                                <TextWithTooltip text={'Pool rewards Address'} tooltipText={'The BTC address which will receive the BTC from the mining pool.'} />,
                                <Input
                                    // label = {
                                    //     <TextWithTooltip text={'BTC Address to receive awards'} tooltipText={'The BTC address which will collect all sales proceeds from sold NFTs.'} />
                                    // }
                                    stretch={true}
                                    placeholder={'bc1qxy...'}
                                    className={'FlexRow'}
                                    value = { miningFarmEntity.rewardsFromPoolBtcAddress }
                                    inputValidation={farmPayoutAddressValidation}
                                    onChange = { onChangeRewardsFromPoolBtcAddress }
                                />,
                            ),
                            createDataPreview(
                                // 'Pool BTC wallet name',
                                <TextWithTooltip text={'Pool BTC wallet name'} tooltipText={'The BTC address which will receive the BTC from the mining pool.'} />,
                                <Input
                                    // label = {
                                    //     <TextWithTooltip text={'BTC Wallet name on the BTC node'} tooltipText={'The BTC wallet which will collect all sales proceeds from sold NFTs.'} />
                                    // }
                                    placeholder={'walletname123...'}
                                    className={'FlexRow'}
                                    value = { miningFarmEntity.rewardsFromPoolBtcWalletName }
                                    inputValidation={[
                                        farmBtcWalletNameValidationNoEmpty,
                                        farmBtcWalletNameValidationNoSpace,
                                        farmBtcWalletNameLowercaseAndNumber,
                                    ]}
                                    onChange = { onChangeRewardsFromPoolBtcWalletName }
                                />,
                            ),
                            createDataPreview(
                                // 'Sub account name',
                                <TextWithTooltip text={'Sub account name'} tooltipText={'The sub account name, given by Foundry.'} />,
                                <Input
                                    // label = {
                                    //     <TextWithTooltip text={'Sub account name on Foundry'} tooltipText={'The sub account name, given by Foundry.'} />
                                    // }
                                    placeholder={'walletname123...'}
                                    className={'FlexRow'}
                                    value = { miningFarmEntity.subAccountName }
                                    inputValidation={[
                                        farmSubAccountNameValidationNoEmpty,
                                        farmSubAccountNameValidationNoSpace,
                                        farmSubAccountNameLowercaseAndNumber,
                                    ]}
                                    onChange = { onChangeSubAccounttName }
                                />,
                            ),
                            createDataPreview('Leftover rewards address', miningFarmEntity.leftoverRewardsBtcAddress),
                            createDataPreview('Maintenance fee address', miningFarmEntity.maintenanceFeePayoutBtcAddress),
                            createDataPreview(
                                'Cudos NFT Mint Royalties',
                                <Input
                                    className={'FlexRow RoyaliesInput'}
                                    value = { viewMiningFarmModalStore.editedCudosMintRoyalties }
                                    onChange = { setEditedCudosMintRoyalties }
                                    inputType = {InputType.REAL}
                                    decimalLength={2}
                                    inputValidation={[mintRoyaltiesValidation, notNegativeValidation]}
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
                                    onChange = { setEditedCudosResaleRoyalties }
                                    inputType = {InputType.REAL}
                                    decimalLength={2}
                                    inputValidation={[resaleRoyaltiesValidation, notNegativeValidation]}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end" >
                                            %
                                        </InputAdornment>,
                                    }}
                                />,
                            ),
                            createDataPreview(
                                'Farm Start Time',
                                <SingleDatepicker
                                    selected = { viewMiningFarmModalStore.editedFarmStartTime }
                                    onChange = { setEditedFarmStartTime }
                                    inputValidation = { farmStartTimeValidation } />,
                            ),
                        ] } />
                    <div className = { 'ImgsCnt Grid GridColumns4' } >
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
                            disabled = { areChangesMade === false }
                            onClick = { onSave } >
                            Save Changes
                        </Button>
                    </Actions>
                </>
            ) }

        </ModalWindow>
    )

}

export default inject((stores) => stores)(observer(ViewMiningFarmModal));
