import React, { useRef, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { useNavigate } from 'react-router-dom';

import S from '../../../../../core/utilities/Main';
import CreditCollectionStore from '../../stores/CreditCollectionStore';
import ValidationState from '../../../../../core/presentation/stores/ValidationState';
import ProjectUtils from '../../../../../core/utilities/ProjectUtils';
import AlertStore from '../../../../../core/presentation/stores/AlertStore';
import AppRoutes from '../../../../app-routes/entities/AppRoutes';

import Svg, { SvgSize } from '../../../../../core/presentation/components/Svg';
import Actions, { ActionsHeight, ActionsLayout } from '../../../../../core/presentation/components/Actions';
import Button, { ButtonPadding } from '../../../../../core/presentation/components/Button';
import UploaderComponent from '../../../../../core/presentation/components/UploaderComponent';
import Input, { InputType } from '../../../../../core/presentation/components/Input';
import TextWithTooltip from '../../../../../core/presentation/components/TextWithTooltip';
import InfoGrayBox from '../../../../../core/presentation/components/InfoGrayBox';
import Checkbox from '../../../../../core/presentation/components/Checkbox';
import FieldColumnWrapper from '../../../../../core/presentation/components/FieldColumnWrapper';

import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import '../../styles/credit-collection-details-form.css';
import { InputAdornment } from '@mui/material';
import BigNumber from 'bignumber.js';

type Props = {
    alertStore?: AlertStore;
    creditCollectionStore?: CreditCollectionStore;
}

function CreditCollectionDetailsForm({ alertStore, creditCollectionStore }: Props) {
    const navigate = useNavigate();

    const collectionEntity = creditCollectionStore.collectionEntity;
    const validationState = useRef(new ValidationState()).current;
    const validationPerNftState = useRef(new ValidationState()).current;
    const collectionNameValidation = useRef(validationState.addEmptyValidation('Empty name')).current;
    const collectionHashPowerValidation = useRef(validationState.addEmptyValidation('Empty hashing power')).current;
    const collectionRoyaltiesValidation = useRef(validationState.addEmptyValidation('Empty royalties')).current;
    const collectionMainteannceFeesValidation = useRef(validationState.addEmptyValidation('Empty maintenance fees')).current;
    const collectionPayoutAddressValidation = useRef(validationState.addBitcoinAddressValidation('Empty payout address')).current;
    const collectionHashPowerPerNftValidation = useRef(validationPerNftState.addEmptyValidation('Empty hashing power per nft')).current;
    const collectionPricePerNftValidation = useRef(validationPerNftState.addEmptyValidation('Empty price per nft')).current;

    const [hashPowerInEH, setHashPowerInEH] = useState(collectionEntity.hashPowerInEH !== S.NOT_EXISTS ? collectionEntity.hashPowerInEH : '');
    const [maintenanceFeeInBtc, setMaintenanceFeeInBtc] = useState(collectionEntity.maintenanceFeeInBtc !== null ? collectionEntity.maintenanceFeeInBtc.toString() : '')
    const [defaultPricePerNftInCudos, setDefaultPricePerNftInCudos] = useState(collectionEntity.defaultPricePerNftInCudos !== null ? collectionEntity.defaultPricePerNftInCudos.toString() : '');
    const [defaultHashPowerInEHPerNftInEH, setDefaultHashPowerPerNftInEH] = useState(collectionEntity.defaultHashPowerInEHPerNftInEH !== S.NOT_EXISTS ? collectionEntity.defaultPricePerNftInCudos : '');

    function onChangeHashPowerInEH(value) {
        setHashPowerInEH(value);
        collectionEntity.hashPowerInEH = value !== '' ? parseFloat(value) : S.NOT_EXISTS;
    }

    function onChangeRoyalties(value) {
        collectionEntity.royalties = value !== '' ? parseInt(value) : S.NOT_EXISTS;
    }

    function onChangeMaintenanceFees(value) {
        setMaintenanceFeeInBtc(value);
        collectionEntity.maintenanceFeeInBtc = value !== '' ? new BigNumber(value) : null;
    }

    function onChangeDefaultPricePerNftInCudos(value) {
        setDefaultPricePerNftInCudos(value);
        collectionEntity.defaultPricePerNftInCudos = value !== '' ? new BigNumber(value) : null;
    }

    function onChangeDefaultHashPowerPerNftInEH(value) {
        setDefaultHashPowerPerNftInEH(value);
        collectionEntity.defaultHashPowerInEHPerNftInEH = value !== '' ? parseFloat(value) : S.NOT_EXISTS;
    }

    function onChangeAcceptDefaultHashPowerCheckboxValue() {
        creditCollectionStore.defaultHashAndPriceValues ^= 1;
        if (creditCollectionStore.defaultHashAndPriceValues === S.INT_FALSE) {
            onChangeDefaultPricePerNftInCudos('');
            onChangeDefaultHashPowerPerNftInEH('');
        }
    }

    async function onClickFinishEdit() {
        await creditCollectionStore.onClickSave();
        alertStore.show('Your collection has been updated', () => {
            navigate(AppRoutes.CREDIT_MINING_FARM);
        });
    }

    function onClickNextStepButton() {
        if (validationState.getIsErrorPresent() === true) {
            validationState.setShowErrors(true);
            return;
        }

        if (creditCollectionStore.defaultHashAndPriceValues === S.INT_TRUE) {
            if (validationPerNftState.getIsErrorPresent() === true) {
                validationPerNftState.setShowErrors(true);
                return;
            }
        }

        creditCollectionStore.initNewNftEntity();
        creditCollectionStore.moveToStepAddNfts();
    }

    return (
        <div className={'CreditCollectionDetailsForm FlexColumn'}>
            <div className={'H3 Bold'}>Create Collecton</div>
            <div className={'B1'}>Fill in the needed information for the collection</div>
            <div className={'HorizontalSeparator'}></div>
            <div
                style={ ProjectUtils.makeBgImgStyle(collectionEntity.profileImgUrl) }
                className={`MainImagePreview ImagePreview FlexRow ${S.CSS.getClassName(creditCollectionStore.isProfilePictureEmpty(), 'Empty')}`} >
                {creditCollectionStore.isProfilePictureEmpty() === true && (
                    <div className={'EmptyPictureSvg'}>
                        <Svg svg={InsertPhotoIcon} size={SvgSize.CUSTOM}/>
                    </div>
                )}
            </div>
            <div className={'ImageLabel FlexColumn'}>
                <div className={'B2 Bold'}>Main Image</div>
                <div className={'B3 SemiBold'}>File Format: <span className={'Gray'}>.svg, .png, .jpeg, .gif</span></div>
            </div>
            <div className={'B1 SemiBold'}>600 x 400 recommended</div>
            <Actions layout={ActionsLayout.LAYOUT_ROW_LEFT} height={ActionsHeight.HEIGHT_48}>
                <Button>
                    <Svg svg={FileUploadIcon} />
                    Upload file
                    <UploaderComponent
                        id = { this }
                        params = { {
                            'maxSize': 73400320, // 70MB
                            'onExceedLimit': () => {
                                this.props.alertStore.show('', 'Максималният размер на файловете е 70MB!');
                            },
                            'multi': true,
                            onReadFileAsBase64: (base64File, responseData, files: any[], i: number) => {
                                collectionEntity.profileImgUrl = base64File;
                            },
                        } } />
                </Button>
            </Actions>
            <div className={'HorizontalSeparator'}></div>
            <div
                style={ ProjectUtils.makeBgImgStyle(collectionEntity.coverImgUrl) }
                className={`BannerImagePreview ImagePreview FlexRow ${S.CSS.getClassName(creditCollectionStore.isCoverPictureEmpty(), 'Empty')}`} >
                { creditCollectionStore.isCoverPictureEmpty() === true && (
                    <div className={'EmptyPictureSvg'}>
                        <Svg svg={InsertPhotoIcon} size={SvgSize.CUSTOM}/>
                    </div>
                )}
            </div>
            <div className={'ImageLabel FlexColumn'}>
                <div className={'B2 Bold'}>Banner Image</div>
                <div className={'B3 SemiBold'}>File Format: <span className={'Gray'}>.svg, .png, .jpeg, .gif</span></div>
            </div>
            <div className={'B1 SemiBold'}>1400 x 350 recommended</div>
            <Actions layout={ActionsLayout.LAYOUT_ROW_LEFT} height={ActionsHeight.HEIGHT_48}>
                <Button>
                    <Svg svg={FileUploadIcon}/>
                        Upload file
                    <UploaderComponent
                        id = { this }
                        params = { {
                            'maxSize': 73400320, // 70MB
                            'onExceedLimit': () => {
                                this.props.alertStore.show('', 'Максималният размер на файловете е 70MB!');
                            },
                            'multi': true,
                            onReadFileAsBase64: (base64File, responseData, files: any[], i: number) => {
                                collectionEntity.coverImgUrl = base64File;
                            },
                        } } />
                </Button>
            </Actions>
            <div className={'HorizontalSeparator'}></div>
            <Input
                label={'Collection Name'}
                placeholder={'Enter name...'}
                value={collectionEntity.name}
                inputValidation={collectionNameValidation}
                onChange={creditCollectionStore.onChangeCollectionName} />
            <FieldColumnWrapper
                field = {
                    <Input
                        label={'Description (Optional)'}
                        placeholder={'Enter description...'}
                        value={collectionEntity.description}
                        onChange={creditCollectionStore.onChangeCollectionDescription} />
                }
                helperText = { 'Collection description will be same for all NFTs within that collection.' } />
            <Input
                label={'Hashing Power for collection'}
                placeholder={'Enter hashing power...'}
                inputValidation={collectionHashPowerValidation}
                value={hashPowerInEH}
                onChange={onChangeHashPowerInEH}
                inputType = { InputType.REAL }
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end" >EH</InputAdornment>
                    ),
                }} />
            <FieldColumnWrapper
                field = {
                    <Input
                        label={<TextWithTooltip text={'Secondary Sale Royalties'} tooltipText={'Secondary Sale Royalties'} />}
                        placeholder={'Enter royalties...'}
                        value={collectionEntity.royalties !== S.NOT_EXISTS ? collectionEntity.royalties : ''}
                        inputType={InputType.INTEGER}
                        inputValidation={collectionRoyaltiesValidation}
                        onChange={onChangeRoyalties}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end" >%</InputAdornment>
                            ),
                        }} />
                }
                helperText = { 'Suggested: 0%, 1%, 2%, 6%. Maxium: 10%.' } />
            <InfoGrayBox text={'Farm admins receives 80% of first NFT sale proceeds. 10% are Aura Pool Fees and 10% will be held to a Cudo account as escrow. Farm admin is able to change their payout address per collection.'} />
            <FieldColumnWrapper
                field = {
                    <Input
                        label={<TextWithTooltip text={'Maintenance Fees (per month)'} tooltipText={'Maintenance Fees (per month)'} />}
                        placeholder={'Maintenance fees...'}
                        value={maintenanceFeeInBtc}
                        inputType={InputType.REAL}
                        inputValidation={collectionMainteannceFeesValidation}
                        onChange={onChangeMaintenanceFees}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end" >BTC</InputAdornment>
                            ),
                        }} />
                }
                helperText = { 'Maintenance fee calculation formula:' } >
                <div className={'FormulaBox B2 Bold'}>{'[This Collection EH/s] / [Total EH/s] * [Maintenance fee]'}</div>
            </FieldColumnWrapper>
            <Input
                label={<TextWithTooltip text={'Set Payout Address'} tooltipText={'Set Payout Address'} />}
                placeholder={'Enter address...'}
                value={collectionEntity.payoutAddress}
                inputValidation={collectionPayoutAddressValidation}
                onChange={creditCollectionStore.onChangeCollectionPayoutAddress} />
            <Checkbox
                value={creditCollectionStore.defaultHashAndPriceValues}
                onChange={onChangeAcceptDefaultHashPowerCheckboxValue}
                label={'Set default hashing power and nft price values for all items in the collection.'} />
            { creditCollectionStore.defaultHashAndPriceValues === S.INT_TRUE && (
                <>
                    <Input
                        label={<TextWithTooltip text={'Hashing Power per NFT'} tooltipText={'Paid monthly in BTC'} />}
                        placeholder={'Enter hash power...'}
                        value={defaultHashPowerInEHPerNftInEH}
                        inputType = { InputType.REAL }
                        inputValidation={collectionHashPowerPerNftValidation}
                        onChange={onChangeDefaultHashPowerPerNftInEH}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end" >EH</InputAdornment>
                            ),
                        }} />
                    <Input
                        label={'Price per NFT'}
                        placeholder={'Enter price...'}
                        inputType = { InputType.REAL }
                        value={defaultPricePerNftInCudos}
                        inputValidation={collectionPricePerNftValidation}
                        onChange={onChangeDefaultPricePerNftInCudos}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end" >BTC</InputAdornment>
                            ),
                        }} />
                </>
            ) }
            <Actions layout={ActionsLayout.LAYOUT_COLUMN_RIGHT}>
                { creditCollectionStore.isEditMode() === true ? (
                    <Button padding={ButtonPadding.PADDING_48} onClick={onClickFinishEdit}>Save</Button>
                ) : (
                    <Button padding={ButtonPadding.PADDING_48} onClick={onClickNextStepButton}>Next Step</Button>
                ) }
            </Actions>
        </div>
    )
}

export default inject((stores) => stores)(observer(CreditCollectionDetailsForm));
