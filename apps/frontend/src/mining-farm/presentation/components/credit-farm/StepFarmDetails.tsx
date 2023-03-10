import React, { useRef, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { action, runInAction } from 'mobx';
import BigNumber from 'bignumber.js';

import S from '../../../../core/utilities/Main';
import ProjectUtils from '../../../../core/utilities/ProjectUtils';
import AutocompleteOption from '../../../../core/entities/AutocompleteOption';
import ManufacturerEntity from '../../../entities/ManufacturerEntity';
import MinerEntity from '../../../entities/MinerEntity';
import EnergySourceEntity from '../../../entities/EnergySourceEntity';
import AlertStore from '../../../../core/presentation/stores/AlertStore';
import CreditMiningFarmDetailsPageStore from '../../stores/CreditMiningFarmDetailsPageStore';
import ValidationState from '../../../../core/presentation/stores/ValidationState';

import Input, { InputType } from '../../../../core/presentation/components/Input';
import InputAdornment from '@mui/material/InputAdornment/InputAdornment';
import Svg, { SvgSize } from '../../../../core/presentation/components/Svg';
import Actions, { ActionsHeight, ActionsLayout } from '../../../../core/presentation/components/Actions';
import Button from '../../../../core/presentation/components/Button';
import Autocomplete from '../../../../core/presentation/components/Autcomplete';
import UploaderComponent from '../../../../core/presentation/components/UploaderComponent';
import TextWithTooltip from '../../../../core/presentation/components/TextWithTooltip';
import InfoBlueBox from '../../../../core/presentation/components/InfoBlueBox';
import StyledContainer, { ContainerWidth } from '../../../../core/presentation/components/StyledContainer';
import ColumnLayout from '../../../../core/presentation/components/ColumnLayout';

import FileUploadIcon from '@mui/icons-material/FileUpload';
import NearMeIcon from '@mui/icons-material/NearMe';
import CloseIcon from '@mui/icons-material/Close';
import '../../styles/step-farm-details.css';

type Props = {
    alertStore?: AlertStore;
    creditMiningFarmDetailsPageStore?: CreditMiningFarmDetailsPageStore;
    header: React.ReactNode;
}

function StepFarmDetails({ alertStore, creditMiningFarmDetailsPageStore, header }: Props) {
    const miningFarmEntity = creditMiningFarmDetailsPageStore.miningFarmEntity;

    const validationState = useRef(new ValidationState()).current;
    const farmNameValidation = useRef(validationState.addEmptyValidation('Empty name')).current;
    const farmLegalNameValidationNoEmpty = useRef(validationState.addEmptyValidation('Empty name')).current;
    const farmLegalNameValidationNoSpace = useRef(validationState.addNoSpaceValidation('Contains space')).current;
    const farmOwnerNameValidation = useRef(validationState.addEmptyValidation('Invalid name')).current;
    const farmOwnerEmailValidation = useRef(validationState.addEmailValidation('Invalid email')).current;
    const farmManufacturersValidation = useRef(validationState.addEmptyValidation('Empty manufacturers')).current;
    const farmMinersValidation = useRef(validationState.addEmptyValidation('Empty miners')).current;
    const farmEnergySourceseValidation = useRef(validationState.addEmptyValidation('Empty energy source')).current;
    const farmLocationValidation = useRef(validationState.addEmptyValidation('Empty address')).current;
    const farmHashrateValidation = useRef(validationState.addEmptyValidation('Empty hashrate')).current;
    const farmMainteannceFeesValidation = useRef(validationState.addEmptyValidation('Empty maintenance fee')).current;
    const resaleFarmRoyaltiesCudosAddressValidation = useRef(validationState.addCudosAddressValidation('Invalid cudos address')).current;
    // const farmPayoutAddressValidation = useRef(validationState.addBitcoinAddressValidation('Invalid bitcoin address')).current;
    const farmLeftoversAddressValidation = useRef(validationState.addBitcoinAddressValidation('Invalid bitcoin address')).current;
    const farmMainteannceFeesAddressValidation = useRef(validationState.addBitcoinAddressValidation('Invalid bitcoin address')).current;

    const [hashPowerInTh, setHashPowerInTh] = useState(miningFarmEntity.hashPowerInTh !== S.NOT_EXISTS ? miningFarmEntity.hashPowerInTh : '');
    const [maintenanceFeeInBtc, setMaintenanceFeeInBtc] = useState(miningFarmEntity.maintenanceFeeInBtc !== null ? miningFarmEntity.maintenanceFeeInBtc.toString(10) : '')

    function onChangeManufacturers(values) {
        runInAction(() => {
            miningFarmEntity.manufacturerIds = values.map((autocompleteOption) => autocompleteOption.value);
        });
    }

    function onChangeManufacturerInput(e, value) {
        runInAction(() => {
            creditMiningFarmDetailsPageStore.manufacturerInputValue = value;
        });
    }

    function onChangeMiners(values) {
        runInAction(() => {
            miningFarmEntity.minerIds = values.map((autocompleteOption) => autocompleteOption.value);
        });
    }

    function onChangeMinerInput(e, value) {
        runInAction(() => {
            creditMiningFarmDetailsPageStore.minerInputValue = value;
        });
    }

    function onChangeEnergySources(values) {
        runInAction(() => {
            miningFarmEntity.energySourceIds = values.map((autocompleteOption) => autocompleteOption.value);
        });
    }

    function onChangeEnergySourceInput(e, value) {
        runInAction(() => {
            creditMiningFarmDetailsPageStore.energySourceInputValue = value;
        });
    }

    function onChangeHashPowerInTh(value) {
        runInAction(() => {
            setHashPowerInTh(value);
            miningFarmEntity.hashPowerInTh = value !== '' ? parseFloat(value) : S.NOT_EXISTS;
        });
    }

    function onChangeMaintenanceFees(value) {
        runInAction(() => {
            setMaintenanceFeeInBtc(value);
            miningFarmEntity.maintenanceFeeInBtc = value !== '' ? new BigNumber(value) : null;
        });
    }

    function onClickRemoveImage(i: number) {
        runInAction(() => {
            miningFarmEntity.farmPhotoUrls.splice(i, 1);
        });
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

        if (miningFarmEntity.areFarmOwnerBtcPayoutAddressUnique() === false) {
            alertStore.show('The two BTC payout address must be unique therefore a single address could not have multiple purposes');
            return;
        }

        creditMiningFarmDetailsPageStore.setStepReview();
    }

    return (
        <ColumnLayout className = { 'StepMiningFarmDetails FlexColumn' }>

            <StyledContainer containerWidth = { ContainerWidth.SMALL } >
                <ColumnLayout>
                    { header }
                    <div className={'H3 Bold'}>1. Fill in the general farm details</div>
                    <Input
                        label={'Farm Name'}
                        placeholder={'e.g Cool Farm'}
                        value={miningFarmEntity.name}
                        inputValidation={farmNameValidation}
                        onChange={action((string) => { miningFarmEntity.name = string })} />
                    <Input
                        label={'Description (Optional)'}
                        multiline = { true }
                        value={miningFarmEntity.description}
                        onChange={action((string) => { miningFarmEntity.description = string })} />
                    <Input
                        label={'Legal Entity Name'}
                        placeholder={'e.g Cool Farm Inc.'}
                        value={miningFarmEntity.legalName}
                        inputValidation={[farmLegalNameValidationNoEmpty, farmLegalNameValidationNoSpace]}
                        onChange={action((string) => { miningFarmEntity.legalName = string })} />
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
                    <Input
                        label={'Primary Account Owner Full Name'}
                        placeholder={'e.g Steve Jones'}
                        value={miningFarmEntity.primaryAccountOwnerName}
                        inputValidation={farmOwnerNameValidation}
                        onChange={action((string) => { miningFarmEntity.primaryAccountOwnerName = string })} />
                    <Input
                        label = {
                            <TextWithTooltip text={'Primary Account Owner Email'} tooltipText={'You can’t change primary account owner email'} />
                        }
                        placeholder={'examplemail@mail.com'}
                        value={miningFarmEntity.primaryAccountOwnerEmail}
                        gray = { true }
                        inputValidation={farmOwnerEmailValidation} />
                </ColumnLayout>
            </StyledContainer>

            <StyledContainer containerWidth = { ContainerWidth.SMALL } >
                <ColumnLayout>
                    <div className={'H3 Bold FullLine'}>2. Add farm activity details</div>
                    <Input
                        label={'Machines Location'}
                        placeholder={'e.g Las Brisas, United States'}
                        value={miningFarmEntity.machinesLocation}
                        onChange={action((string) => { miningFarmEntity.machinesLocation = string })}
                        inputValidation={farmLocationValidation}
                        InputProps={{
                            endAdornment: <InputAdornment position="end" >
                                <Svg svg={NearMeIcon}/>
                            </InputAdornment>,
                        }} />
                    <div>
                        <Input
                            label={'Hashrate'}
                            placeholder={'e.g 102.001 TH/s'}
                            value={hashPowerInTh}
                            onChange={ onChangeHashPowerInTh }
                            inputType = { InputType.INTEGER }
                            inputValidation={farmHashrateValidation}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end" > TH/s </InputAdornment>
                                ),
                            }} />
                        <div className={'FlexRow HashPowerInfo B2 FullLine'}>
                            <InfoBlueBox text="Insert the Hashrate planned to be offered as NFTs" />
                        </div>
                    </div>
                    <div className={'FlexColumn FeeInputHolder'}>
                        <Input
                            label={ 'Maintenance Fee (per month)' }
                            placeholder={'Maintenance Fee...'}
                            value={maintenanceFeeInBtc}
                            inputType={InputType.REAL}
                            decimalLength = { 7 }
                            inputValidation={farmMainteannceFeesValidation}
                            onChange={onChangeMaintenanceFees}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end" >BTC</InputAdornment>
                                ),
                            }} />
                        <div className={'B3 SemiBold FullLine'}> Maintenance fee calculation formula:</div>
                        <div className={'FormulaBox B3 Bold'}>
                            •&nbsp;&nbsp;Maintenance fee amount/current hashing power = fee per Th/s<br />
                            •&nbsp;&nbsp;Fee per Th/s / Payout period = Daily fee<br />
                            •&nbsp;&nbsp;Daily fee / 24 = Hourly fee<br />
                            •&nbsp;&nbsp;Total user payout hours * hourly fee = Maintenance fee amount
                        </div>
                    </div>
                    <Input
                        label = {
                            <TextWithTooltip text={'Cudos address to receive NFT resale royalties'} tooltipText={'The CUDOS address, which will collect royalties upon resale of an NFT from your farm. This royalty amount can be adjusted in the "Update Farm Details" screen.'} />
                        }
                        placeholder={'cudos1...'}
                        value={miningFarmEntity.resaleFarmRoyaltiesCudosAddress}
                        inputValidation={resaleFarmRoyaltiesCudosAddressValidation}
                        onChange={action((string) => { miningFarmEntity.resaleFarmRoyaltiesCudosAddress = string })} />
                    {/* <Input
                        label = {
                            <TextWithTooltip text={'BTC Address to receive awards'} tooltipText={'The BTC address which will collect all sales proceeds from sold NFTs.'} />
                        }
                        placeholder={'bc1qxy...'}
                        value={miningFarmEntity.rewardsFromPoolBtcAddress}
                        inputValidation={farmPayoutAddressValidation}
                        onChange={action((string) => { miningFarmEntity.rewardsFromPoolBtcAddress = string })} /> */}
                    <Input
                        label = {
                            <TextWithTooltip text={'BTC Address to receive awards leftovers'} tooltipText={'The BTC address which will collect BTC payouts, generated from Farm\'s unsold NFTs on Aura Pool.'} />
                        }
                        placeholder={'bc1qxy...'}
                        value={miningFarmEntity.leftoverRewardsBtcAddress}
                        inputValidation={farmLeftoversAddressValidation}
                        onChange={action((string) => { miningFarmEntity.leftoverRewardsBtcAddress = string })} />
                    <Input
                        label = {
                            <TextWithTooltip text={'BTC Address to receive maintenance fee'} tooltipText={'Farm BTC address which will collect all maintenance fee.'} />
                        }
                        placeholder={'bc1qxy...'}
                        value={miningFarmEntity.maintenanceFeePayoutBtcAddress}
                        inputValidation={farmMainteannceFeesAddressValidation}
                        onChange={action((string) => { miningFarmEntity.maintenanceFeePayoutBtcAddress = string })} />
                </ColumnLayout>
            </StyledContainer>

            <StyledContainer containerWidth = { ContainerWidth.SMALL } >
                <ColumnLayout>
                    <div className={'H3 Bold FullLine'}> 3. Upload photos from the farm</div>
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
                                'fileExt': '.svg, .jpg, .jpeg, .png',
                                'onExceedLimit': () => {
                                    alertStore.show('Max file size is 70MB!');
                                },
                                'multi': true,
                                onReadFileAsBase64: action((base64File, responseData, files: any[], i: number) => {
                                    // onAddFarmPhoto(base64File);
                                    miningFarmEntity.farmPhotoUrls.push(base64File);
                                }),
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
                                        <Svg svg={CloseIcon} className={'RemovePictureButton Clickable'} onClick={onClickRemoveImage.bind(null, i)} size = { SvgSize.CUSTOM }/>
                                    </div>
                                )
                            })
                        )}
                    </div>
                    <Actions className = { 'NextStepActions' } layout={ActionsLayout.LAYOUT_COLUMN_RIGHT} height={ActionsHeight.HEIGHT_48}>
                        <Button onClick={onClickNextStep}> Next Step </Button>
                    </Actions>
                </ColumnLayout>
            </StyledContainer>

        </ColumnLayout>
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
