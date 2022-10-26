import React, { useRef, useState } from 'react';

import '../../styles/step-farm-details.css';
import Input, { InputType } from '../../../../../core/presentation/components/Input';
import { InputAdornment } from '@mui/material';
import Svg from '../../../../../core/presentation/components/Svg';
import Actions, { ActionsHeight, ActionsLayout } from '../../../../../core/presentation/components/Actions';
import Button, { ButtonRadius } from '../../../../../core/presentation/components/Button';
import Autocomplete from '../../../../../core/presentation/components/Autcomplete';
import AutocompleteOption from '../../../../../core/entities/AutocompleteOption';
import ManufacturerEntity from '../../../entities/ManufacturerEntity';
import MinerEntity from '../../../entities/MinerEntity';
import EnergySourceEntity from '../../../entities/EnergySourceEntity';
import NearMeIcon from '@mui/icons-material/NearMe';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { inject, observer } from 'mobx-react';
import UploaderComponent from '../../../../../core/presentation/components/UploaderComponent';
import AlertStore from '../../../../../core/presentation/stores/AlertStore';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ImageEntity, { PictureType } from '../../../../upload-file/entities/ImageEntity';
import CloseIcon from '@mui/icons-material/Close';
import CreditMiningFarmDetailsPageStore from '../../stores/CreditMiningFarmDetailsPageStore';
import ValidationState from '../../../../../core/presentation/stores/ValidationState';
import MiningFarmEntity from '../../../entities/MiningFarmEntity';

type Props = {
    alertStore?: AlertStore;
    creditMiningFarmDetailsPageStore?: CreditMiningFarmDetailsPageStore;
}

function StepFarmDetails({ alertStore, creditMiningFarmDetailsPageStore }: Props) {
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

    const miningFarmEntity = creditMiningFarmDetailsPageStore.miningFarmEntity;
    const imageEntities = creditMiningFarmDetailsPageStore.imageEntities;

    const [selectedManufacturersOptions, setSelectedManufacturersOptions] = useState(miningFarmEntity.manufacturerIds);
    const [selectedMindersOptions, setSelectedMinersOptions] = useState(miningFarmEntity.minerIds);
    const [selectedEnergySourceOptions, setSelectedEnergySourceOptions] = useState(miningFarmEntity.energySourceIds);
    const [hashRateDisplay, setHashRateDisplay] = useState(miningFarmEntity.displayHashRate());

    function onClickRemoveImage(imageEntityToRemove: ImageEntity) {
        const imageEntityIndex = imageEntities.findIndex((imageEntity: ImageEntity) => imageEntity.id === imageEntityToRemove.id);
        imageEntities.splice(imageEntityIndex, 1);
    }

    // based onfilled farm entity properties
    // TODO
    function shouldButtonBeDisabled() {
        return false;
    }

    function onClickNextStep() {
        if (validationState.getIsErrorPresent() === true) {
            validationState.setShowErrors(true);
            return;
        }
        creditMiningFarmDetailsPageStore.setStepReview();
    }

    return (
        <div className = { 'StepMiningFarmDetails FlexColumn' }>
            <div className={'B2 Bold FullLine'}>1. Fill in the general farm details</div>
            <Input
                label={'Farm Name'}
                placeholder={'e.g Cool Farm'}
                value={miningFarmEntity.name}
                inputValidation={farmNameValidation}
                onChange={(string) => { miningFarmEntity.name = string }}
                inputType={InputType.TEXT}
            />
            <Input
                label={'Description'}
                placeholder={'Enter description... (Optional)'}
                value={miningFarmEntity.description}
                onChange={(string) => { miningFarmEntity.description = string }}
                inputType={InputType.TEXT}
            />
            <Input
                label={'Legal Entity Name'}
                placeholder={'e.g Cool Farm Inc.'}
                value={miningFarmEntity.legalName}
                inputValidation={farmLegalNameValidation}
                onChange={(string) => { miningFarmEntity.legalName = string }}
                inputType={InputType.TEXT}
            />
            <Input
                label={'Primary Account Owner Full Name'}
                placeholder={'e.g Steve Jones'}
                value={miningFarmEntity.primaryAccountOwnerName}
                inputValidation={farmOwnerNameValidation}
                onChange={(string) => { miningFarmEntity.primaryAccountOwnerName = string }}
                inputType={InputType.TEXT}
            />
            <Input
                label={'Primary Account Owner Email'}
                placeholder={'examplemail@mail.com'}
                value={miningFarmEntity.primaryAccountOwnerEmail}
                inputValidation={farmOwnerEmailValidation}
                onChange={(string) => { miningFarmEntity.primaryAccountOwnerEmail = string }}
                inputType={InputType.TEXT}
            />
            <Autocomplete
                label={'Manufacturers'}
                value = { selectedManufacturersOptions.map((id) => new AutocompleteOption(id, ManufacturerEntity.getManufacturerName(id))) }
                multiple
                onChange = { (d) => {
                    setSelectedManufacturersOptions(d);
                    miningFarmEntity.manufacturerIds = d.map((option) => option.value);
                }}
                placeholder={'Select manufacturers...'}
                inputValidation={farmManufacturersValidation}
                options = { ManufacturerEntity.getAllManufacturers().map((manufacturer: ManufacturerEntity) => {
                    return new AutocompleteOption(manufacturer.id, manufacturer.name);
                })} />
            <Autocomplete
                label={'Miners'}
                value = { selectedMindersOptions.map((id) => new AutocompleteOption(id, MinerEntity.getMinerName(id))) }
                multiple
                onChange = { (d) => {
                    setSelectedMinersOptions(d);
                    miningFarmEntity.minerIds = d.map((option) => option.value);
                }}
                placeholder={'Select miners...'}
                inputValidation={farmMinersValidation}
                options = { MinerEntity.getAllMiners().map((miner: MinerEntity) => {
                    return new AutocompleteOption(miner.id, miner.name);
                })} />
            <Autocomplete
                label={'Energy Source'}
                value = { selectedEnergySourceOptions.map((id) => new AutocompleteOption(id, EnergySourceEntity.getEnergySourceName(id))) }
                multiple
                onChange = { (d) => {
                    setSelectedEnergySourceOptions(d);
                    miningFarmEntity.energySourceIds = d.map((option) => option.value);
                }}
                inputValidation={farmEnergySourceseValidation}
                placeholder={'Select energy source...'}
                options = { EnergySourceEntity.getAllEnergySources().map((energySource: EnergySourceEntity) => {
                    return new AutocompleteOption(energySource.id, energySource.name);
                })} />
            <div className={'B2 Bold FullLine'}>2. Add farm activity details</div>
            <Input
                label={'Machines Location'}
                placeholder={'e.g Las Brisas, United States'}
                value={miningFarmEntity.machinesLocation}
                onChange={(string) => { miningFarmEntity.machinesLocation = string }}
                inputType={InputType.TEXT}
                inputValidation={farmLocationValidation}
                InputProps={{
                    endAdornment: <InputAdornment position="end" >
                        <Svg svg={NearMeIcon}/>
                    </InputAdornment>,
                }}
            />
            <Input
                label={'Hashrate'}
                placeholder={'e.g 102.001 EH/s'}
                value={hashRateDisplay}
                onChange={(string) => {
                    setHashRateDisplay(string);
                    miningFarmEntity.parseHashRateFromString(string);
                }}
                inputValidation={farmHashrateValidation}
                inputType={InputType.TEXT}
            />
            <div className={'FlexRow HashRateInfo B2 SemiBold FullLine'}>
                <Svg svg={ErrorOutlineIcon}/>
                Insert the Hashrate planned to be offered as NFTs
            </div>
            <div className={'B2 Bold FullLine'}> 3. Upload photos from the farm</div>
            <div className={'Uploader FlexColumn'}>
                <div className={'B3 SemiBold'}>Upload files here</div>
                <div className={'B3 SemiBold'}>File Format: <span className={'Gray'}>.svg, .png, .jpeg</span></div>
                <Actions layout={ActionsLayout.LAYOUT_COLUMN_CENTER} height={ActionsHeight.HEIGHT_48}>
                    <Button
                        radius={ButtonRadius.RADIUS_16}
                    >
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
                            const imageEntity = ImageEntity.new(base64File, PictureType.FARM_PHOTO);
                            imageEntities.push(imageEntity);

                            alertStore.show('success');
                        },
                    } } />
            </div>
            <div className={'UploadedImagesRow FlexRow'}>
                {imageEntities.length === 0 && (
                    <div className={'NoUploads B3 SemiBold'}>No files uploaded yet.</div>
                )}
                {imageEntities.length > 0 && (
                    imageEntities.map((imageEntity) => {
                        return <div key={imageEntity.id}
                            style={{
                                backgroundImage: `url(${imageEntity.base64})`,
                            }}
                            className={'PictureBox'} >
                            <Svg svg={CloseIcon} className={'RemovePictureButton Clickable'} onClick={() => onClickRemoveImage(imageEntity)}/>
                        </div>
                    })
                )}
            </div>
            <Actions layout={ActionsLayout.LAYOUT_COLUMN_RIGHT} height={ActionsHeight.HEIGHT_48}>
                <Button
                    disabled={shouldButtonBeDisabled()}
                    onClick={onClickNextStep}
                    radius={ButtonRadius.RADIUS_16}
                >Next Step</Button>
            </Actions>
        </div>
    )
}

export default inject((props) => props)(observer(StepFarmDetails));
