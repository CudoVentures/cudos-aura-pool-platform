import React, { useRef, useState } from 'react';
import { inject, observer } from 'mobx-react';

import S from '../../../../../core/utilities/Main';
import AutocompleteOption from '../../../../../core/entities/AutocompleteOption';
import ManufacturerEntity from '../../../entities/ManufacturerEntity';
import MinerEntity from '../../../entities/MinerEntity';
import EnergySourceEntity from '../../../entities/EnergySourceEntity';
import AlertStore from '../../../../../core/presentation/stores/AlertStore';
import CreditMiningFarmDetailsPageStore from '../../stores/CreditMiningFarmDetailsPageStore';
import ValidationState from '../../../../../core/presentation/stores/ValidationState';

import Input, { InputType } from '../../../../../core/presentation/components/Input';
import { InputAdornment } from '@mui/material';
import Svg from '../../../../../core/presentation/components/Svg';
import Actions, { ActionsHeight, ActionsLayout } from '../../../../../core/presentation/components/Actions';
import Button from '../../../../../core/presentation/components/Button';
import Autocomplete from '../../../../../core/presentation/components/Autcomplete';
import UploaderComponent from '../../../../../core/presentation/components/UploaderComponent';

import FileUploadIcon from '@mui/icons-material/FileUpload';
import NearMeIcon from '@mui/icons-material/NearMe';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CloseIcon from '@mui/icons-material/Close';
import '../../styles/step-farm-details.css';
import ProjectUtils from '../../../../../core/utilities/ProjectUtils';
import TextWithTooltip from '../../../../../core/presentation/components/TextWithTooltip';
import BigNumber from 'bignumber.js';
import InfoBlueBox from '../../../../../core/presentation/components/InfoBlueBox';

type Props = {
    alertStore?: AlertStore;
    creditMiningFarmDetailsPageStore?: CreditMiningFarmDetailsPageStore;
}

function StepFarmDetails({ alertStore, creditMiningFarmDetailsPageStore }: Props) {
    const miningFarmEntity = creditMiningFarmDetailsPageStore.miningFarmEntity;
    // const imageEntities = creditMiningFarmDetailsPageStore.imageEntities;

    const validationState = useRef(new ValidationState()).current;
    const farmNameValidation = useRef(validationState.addEmptyValidation('Empty name')).current;
    const farmLegalNameValidation = useRef(validationState.addEmptyValidation('Empty name')).current;
    const farmOwnerNameValidation = useRef(validationState.addEmptyValidation('Invalid name')).current;
    const farmOwnerEmailValidation = useRef(validationState.addEmailValidation('Invalid email')).current;
    const farmManufacturersValidation = useRef(validationState.addEmptyValidation('Empty manufacturers')).current;
    const farmMinersValidation = useRef(validationState.addEmptyValidation('Empty miners')).current;
    const farmEnergySourceseValidation = useRef(validationState.addEmptyValidation('Empty energy source')).current;
    const farmLocationValidation = useRef(validationState.addEmptyValidation('Empty address')).current;
    const farmHashrateValidation = useRef(validationState.addEmptyValidation('Empty hashrate')).current;
    const farmMainteannceFeesValidation = useRef(validationState.addEmptyValidation('Empty maintenance fees')).current;
    const resaleFarmRoyaltiesCudosAddressValidation = useRef(validationState.addCudosAddressValidation('Invalid cudos address')).current;
    const farmPayoutAddressValidation = useRef(validationState.addBitcoinAddressValidation('Invalid bitcoin address')).current;
    const farmLeftoversAddressValidation = useRef(validationState.addBitcoinAddressValidation('Invalid bitcoin address')).current;
    const farmMainteannceFeesAddressValidation = useRef(validationState.addBitcoinAddressValidation('Invalid bitcoin address')).current;

    const [hashPowerInTh, setHashPowerInTh] = useState(miningFarmEntity.hashPowerInTh !== S.NOT_EXISTS ? miningFarmEntity.hashPowerInTh : '');
    const [maintenanceFeeInBtc, setMaintenanceFeeInBtc] = useState(miningFarmEntity.maintenanceFeeInBtc !== null ? miningFarmEntity.maintenanceFeeInBtc.toString() : '')

    function onChangeManufacturers(values) {
        miningFarmEntity.manufacturerIds = values.map((autocompleteOption) => autocompleteOption.value);
    }

    function onChangeManufacturerInput(e, value) {
        creditMiningFarmDetailsPageStore.manufacturerInputValue = value;
    }

    function onChangeMiners(values) {
        miningFarmEntity.minerIds = values.map((autocompleteOption) => autocompleteOption.value);
    }

    function onChangeMinerInput(e, value) {
        creditMiningFarmDetailsPageStore.minerInputValue = value;
    }

    function onChangeEnergySources(values) {
        miningFarmEntity.energySourceIds = values.map((autocompleteOption) => autocompleteOption.value);
    }

    function onChangeEnergySourceInput(e, value) {
        creditMiningFarmDetailsPageStore.energySourceInputValue = value;
    }

    function onChangeHashPowerInTh(value) {
        setHashPowerInTh(value);
        miningFarmEntity.hashPowerInTh = value !== '' ? parseFloat(value) : S.NOT_EXISTS;
    }

    function onChangeMaintenanceFees(value) {
        setMaintenanceFeeInBtc(value);
        miningFarmEntity.maintenanceFeeInBtc = value !== '' ? new BigNumber(value) : null;
    }

    function onClickRemoveImage(i: number) {
        miningFarmEntity.farmPhotoUrls.splice(i, 1);
    }

    function onClickNextStep() {
        if (validationState.getIsErrorPresent() === true) {
            validationState.setShowErrors(true);
            return;
        }

        if (miningFarmEntity.hasPhotos() === false) {
            alertStore.show('You must upload at least one photo of your farm');
            return;
        }

        creditMiningFarmDetailsPageStore.setStepReview();
    }

    return (
        <div className = { 'StepMiningFarmDetails FlexColumn' }>
            <div className={'B2 Bold'}>1. Fill in the general farm details</div>
            <Input
                label={'Farm Name'}
                placeholder={'e.g Cool Farm'}
                value={miningFarmEntity.name}
                inputValidation={farmNameValidation}
                onChange={(string) => { miningFarmEntity.name = string }} />
            <Input
                label={'Description (Optional)'}
                multiline = { true }
                value={miningFarmEntity.description}
                onChange={(string) => { miningFarmEntity.description = string }} />
            <Input
                label={'Legal Entity Name'}
                placeholder={'e.g Cool Farm Inc.'}
                value={miningFarmEntity.legalName}
                inputValidation={farmLegalNameValidation}
                onChange={(string) => { miningFarmEntity.legalName = string }} />
            <Input
                label={'Primary Account Owner Full Name'}
                placeholder={'e.g Steve Jones'}
                value={miningFarmEntity.primaryAccountOwnerName}
                inputValidation={farmOwnerNameValidation}
                onChange={(string) => { miningFarmEntity.primaryAccountOwnerName = string }} />
            <Input
                label={'Primary Account Owner Email'}
                placeholder={'examplemail@mail.com'}
                value={miningFarmEntity.primaryAccountOwnerEmail}
                inputValidation={farmOwnerEmailValidation}
                onChange={(string) => { miningFarmEntity.primaryAccountOwnerEmail = string }} />
            <Autocomplete
                label={'Manufacturers'}
                value = { creditMiningFarmDetailsPageStore.getSelectedManufacturers().map((manufacturerEntity) => {
                    return new AutocompleteOption(manufacturerEntity.manufacturerId, manufacturerEntity.name);
                }) }
                multiple
                onChange = { onChangeManufacturers }
                onInputChange = { onChangeManufacturerInput }
                placeholder={'Select manufacturers...'}
                inputValidation={farmManufacturersValidation}
                options = { creditMiningFarmDetailsPageStore.manufacturerEntities.map((manufacturerEntity: ManufacturerEntity) => {
                    return new AutocompleteOption(manufacturerEntity.manufacturerId, manufacturerEntity.name);
                }) }
                noOptionsText = { (
                    <NoOptions
                        storePropertyName = { 'manufacturerInputValue' }
                        onClick = { creditMiningFarmDetailsPageStore.onClickAddManufacturer } />
                ) } />
            <Autocomplete
                label={'Miners'}
                value = { creditMiningFarmDetailsPageStore.getSelectedMiners().map((minerEntity) => {
                    return new AutocompleteOption(minerEntity.minerId, minerEntity.name);
                }) }
                multiple
                onChange = { onChangeMiners }
                onInputChange = { onChangeMinerInput }
                placeholder={'Select miners...'}
                inputValidation={farmMinersValidation}
                options = { creditMiningFarmDetailsPageStore.minerEntities.map((minerEntity: MinerEntity) => {
                    return new AutocompleteOption(minerEntity.minerId, minerEntity.name);
                })}
                noOptionsText = { (
                    <NoOptions
                        storePropertyName = { 'minerInputValue' }
                        onClick = { creditMiningFarmDetailsPageStore.onClickAddMiner } />
                ) } />
            <Autocomplete
                label={'Energy Source'}
                value = { creditMiningFarmDetailsPageStore.getSelectedEnergySources().map((energySourceEntity) => {
                    return new AutocompleteOption(energySourceEntity.energySourceId, energySourceEntity.name);
                }) }
                multiple
                onChange = { onChangeEnergySources}
                onInputChange = { onChangeEnergySourceInput }
                inputValidation={farmEnergySourceseValidation}
                placeholder={'Select energy source...'}
                options = { creditMiningFarmDetailsPageStore.energySourceEntities.map((energySourceEntity: EnergySourceEntity) => {
                    return new AutocompleteOption(energySourceEntity.energySourceId, energySourceEntity.name);
                })}
                noOptionsText = { (
                    <NoOptions
                        storePropertyName = { 'energySourceInputValue' }
                        onClick = { creditMiningFarmDetailsPageStore.onClickAddEnergySource } />
                ) } />
            <div className={'B2 Bold FullLine'}>2. Add farm activity details</div>
            <Input
                label={'Machines Location'}
                placeholder={'e.g Las Brisas, United States'}
                value={miningFarmEntity.machinesLocation}
                onChange={(string) => { miningFarmEntity.machinesLocation = string }}
                inputValidation={farmLocationValidation}
                InputProps={{
                    endAdornment: <InputAdornment position="end" >
                        <Svg svg={NearMeIcon}/>
                    </InputAdornment>,
                }} />
            <div>
                <Input
                    label={'Hashrate'}
                    placeholder={'e.g 102.001 TH'}
                    value={hashPowerInTh}
                    onChange={ onChangeHashPowerInTh }
                    inputType = { InputType.INTEGER }
                    inputValidation={farmHashrateValidation}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end" > TH </InputAdornment>
                        ),
                    }} />
                <div className={'FlexRow HashPowerInfo B2 FullLine'}>
                    <InfoBlueBox text="Insert the Hashrate planned to be offered as NFTs" />
                </div>
            </div>
            <div className={'FlexColumn FeeInputHolder'}>
                <Input
                    label={<TextWithTooltip text={'Maintenance Fees (per month)'} tooltipText={'Maintenance Fees (per month)'} />}
                    placeholder={'Maintenance fees...'}
                    value={maintenanceFeeInBtc}
                    inputType={InputType.REAL}
                    inputValidation={farmMainteannceFeesValidation}
                    onChange={onChangeMaintenanceFees}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end" >BTC</InputAdornment>
                        ),
                    }} />
                <div className={'B3 SemiBold FullLine'}> Maintenance fee calculation formula:</div>
                <div className={'FormulaBox FlexColumn'}>
                    <div>- Maintenance fee amount/current hashing power = Fee per Th/s</div>
                    <div>- Fee per Th/s / Payout period = Daily fee</div>
                    <div>- Daily fee / 24 = Hourly fee</div>
                    <div>- Total user payout hours * Hourly fee = Maintenance fee amount</div>
                </div>
            </div>
            <Input
                label={'Cudos address to receive NFT resale royalties'}
                placeholder={'cudos1...'}
                value={miningFarmEntity.resaleFarmRoyaltiesCudosAddress}
                inputValidation={resaleFarmRoyaltiesCudosAddressValidation}
                onChange={(string) => { miningFarmEntity.resaleFarmRoyaltiesCudosAddress = string }} />
            <Input
                label={'BTC Address to receive awards'}
                placeholder={'bc1qxy...'}
                value={miningFarmEntity.rewardsFromPoolBtcAddress}
                inputValidation={farmPayoutAddressValidation}
                onChange={(string) => { miningFarmEntity.rewardsFromPoolBtcAddress = string }} />
            <Input
                label={'BTC Address to receive awards leftovers'}
                placeholder={'bc1qxy...'}
                value={miningFarmEntity.leftoverRewardsBtcAddress}
                inputValidation={farmLeftoversAddressValidation}
                onChange={(string) => { miningFarmEntity.leftoverRewardsBtcAddress = string }} />
            <Input
                label={'BTC Address to receive maintenance fees'}
                placeholder={'bc1qxy...'}
                value={miningFarmEntity.maintenanceFeePayoutBtcAddress}
                inputValidation={farmMainteannceFeesAddressValidation}
                onChange={(string) => { miningFarmEntity.maintenanceFeePayoutBtcAddress = string }} />
            <div className={'B2 Bold FullLine'}> 3. Upload photos from the farm</div>
            <div className={'Uploader FlexColumn'}>
                <div className={'B3 SemiBold'}>Upload files here</div>
                <div className={'B3 SemiBold'}>File Format: <span className={'Gray'}>.svg, .png, .jpeg</span></div>
                <Actions layout={ActionsLayout.LAYOUT_COLUMN_CENTER} height={ActionsHeight.HEIGHT_48}>
                    <Button>
                        <Svg svg={FileUploadIcon}/>
                        Upload file
                    </Button>
                </Actions>
                <UploaderComponent
                    id = { this }
                    params = { {
                        'maxSize': 73400320, // 70MB
                        'onExceedLimit': () => {
                            this.props.alertStore.show('', 'Максималният размер на файловете е 70MB!');
                        },
                        'multi': true,
                        onReadFileAsBase64: (base64File, responseData, files: any[], i: number) => {
                            // onAddFarmPhoto(base64File);
                            miningFarmEntity.farmPhotoUrls.push(base64File);
                        },
                    } } />
            </div>
            <div className={'UploadedImagesRow FlexRow'}>
                {miningFarmEntity.farmPhotoUrls.length === 0 && (
                    <div className={'NoUploads B3 SemiBold'}>No files uploaded yet.</div>
                )}
                {miningFarmEntity.farmPhotoUrls.length > 0 && (
                    miningFarmEntity.farmPhotoUrls.map((url, i) => {
                        return (
                            <div key={i}
                                style={ ProjectUtils.makeBgImgStyle(url) }
                                className={'PictureBox'} >
                                <Svg svg={CloseIcon} className={'RemovePictureButton Clickable'} onClick={onClickRemoveImage.bind(null, i)}/>
                            </div>
                        )
                    })
                )}
            </div>
            <Actions layout={ActionsLayout.LAYOUT_COLUMN_RIGHT} height={ActionsHeight.HEIGHT_48}>
                <Button
                    onClick={onClickNextStep}>
                    Next Step
                </Button>
            </Actions>
        </div>
    )
}

export default inject((props) => props)(observer(StepFarmDetails));

type NoOptionsProps = {
    creditMiningFarmDetailsPageStore?: CreditMiningFarmDetailsPageStore;
    storePropertyName: string;
    onClick: () => void;
}

function NoOptionsRender({ creditMiningFarmDetailsPageStore, storePropertyName, onClick }: NoOptionsProps) {
    return (
        <div className = { 'Clickable' } onClick = { onClick }>Add new: {creditMiningFarmDetailsPageStore[storePropertyName]}</div>
    )
}

const NoOptions = inject((stores) => stores)(observer(NoOptionsRender));
