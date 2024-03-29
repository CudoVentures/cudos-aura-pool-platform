import React, { useRef, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { useNavigate } from 'react-router-dom';

import S from '../../../../core/utilities/Main';
import CreditCollectionStore from '../../stores/CreditCollectionStore';
import ValidationState from '../../../../core/presentation/stores/ValidationState';
import ProjectUtils from '../../../../core/utilities/ProjectUtils';
import AlertStore from '../../../../core/presentation/stores/AlertStore';
import AppRoutes from '../../../../app-routes/entities/AppRoutes';

import InputAdornment from '@mui/material/InputAdornment/InputAdornment';
import Svg from '../../../../core/presentation/components/Svg';
import Actions, { ActionsHeight, ActionsLayout } from '../../../../core/presentation/components/Actions';
import Button, { ButtonPadding } from '../../../../core/presentation/components/Button';
import UploaderComponent from '../../../../core/presentation/components/UploaderComponent';
import Input, { InputType } from '../../../../core/presentation/components/Input';
import TextWithTooltip from '../../../../core/presentation/components/TextWithTooltip';
import Checkbox from '../../../../core/presentation/components/Checkbox';
import FieldColumnWrapper from '../../../../core/presentation/components/FieldColumnWrapper';

import FileUploadIcon from '@mui/icons-material/FileUpload';
import '../../styles/credit-collection-details-form.css';
import { runInAction } from 'mobx';

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
    // const collectionMainteannceFeesValidation = useRef(validationState.addEmptyValidation('Empty Maintenance Fee')).current;
    // const collectionPayoutAddressValidation = useRef(validationState.addBitcoinAddressValidation('Empty payout address')).current;
    const collectionArtistNameValidation = useRef(validationPerNftState.addEmptyValidation('Empty name')).current;
    const collectionHashPowerPerNftValidation = useRef(validationPerNftState.addEmptyValidation('Empty hashing power per nft')).current;
    const collectionPricePerNftValidation = useRef(validationPerNftState.addEmptyValidation('Empty price per nft')).current;
    const notNegativeValidation = useRef(validationState.addNotNegativeValidation('Value must be greater than or equal to 0.')).current;
    const [hashPowerInTh, setHashPowerInTh] = useState(collectionEntity.hashPowerInTh !== S.NOT_EXISTS ? collectionEntity.hashPowerInTh : '');
    // const [maintenanceFeeInBtc, setMaintenanceFeeInBtc] = useState(collectionEntity.maintenanceFeeInBtc !== null ? collectionEntity.maintenanceFeeInBtc.toString(10) : '')
    const [defaultPricePerNftInUsd, setDefaultPricePerNftInUsd] = useState(collectionEntity.defaultPricePerNftInUsd !== S.NOT_EXISTS ? collectionEntity.defaultPricePerNftInUsd.toString() : '');
    const [defaultArtistNamePerNft, setDefaultArtistNamePerNft] = useState(collectionEntity.defaultArtistName);
    const [defaultHashPowerPerNftInTh, setDefaultHashPowerPerNftInTh] = useState(collectionEntity.defaultHashPowerPerNftInTh !== S.NOT_EXISTS ? collectionEntity.defaultHashPowerPerNftInTh : '');
    const [secondarySaleRoyalties, setSecondarySaleRoyalties] = useState(collectionEntity.royalties !== S.NOT_EXISTS ? collectionEntity.royalties.toString() : '');

    function onChangeHashPowerInTh(value) {
        runInAction(() => {
            setHashPowerInTh(value);
            collectionEntity.hashPowerInTh = value !== '' ? parseFloat(value) : S.NOT_EXISTS;
        })
    }

    function onChangeRoyalties(value) {
        runInAction(() => {
            setSecondarySaleRoyalties(value);
            if (value === '') {
                collectionEntity.royalties = S.NOT_EXISTS;
                return;
            }

            collectionEntity.royalties = parseFloat(value);
            if (collectionEntity.royalties < 0) {
                collectionEntity.royalties = 0;
                setSecondarySaleRoyalties('0');
            }
            if (collectionEntity.royalties > 10) {
                collectionEntity.royalties = 10;
                setSecondarySaleRoyalties('10');
            }
        })
    }

    // function onChangeMaintenanceFees(value) {
    //     setMaintenanceFeeInBtc(value);
    //     collectionEntity.maintenanceFeeInBtc = value !== '' ? new BigNumber(value) : null;
    // }

    function onChangeDefaultPricePerNftInUsd(value) {
        runInAction(() => {
            setDefaultPricePerNftInUsd(value);
            collectionEntity.defaultPricePerNftInUsd = value !== '' ? Number(value) : S.NOT_EXISTS;
        });
    }

    function onChangeDefaultHashPowerPerNftInTh(value) {
        runInAction(() => {
            setDefaultHashPowerPerNftInTh(value);
            collectionEntity.defaultHashPowerPerNftInTh = value !== '' ? parseFloat(value) : S.NOT_EXISTS;
        });
    }

    function onChangeDefaultArtistNamePerNft(value) {
        runInAction(() => {
            setDefaultArtistNamePerNft(value);
            collectionEntity.defaultArtistName = value;
        });
    }

    function onChangeAcceptDefaultHashPowerCheckboxValue() {
        runInAction(() => {
            creditCollectionStore.defaultHashAndPriceValues ^= 1;
            if (creditCollectionStore.defaultHashAndPriceValues === S.INT_FALSE) {
                onChangeDefaultPricePerNftInUsd('');
                onChangeDefaultHashPowerPerNftInTh('');
                onChangeDefaultArtistNamePerNft('');
            }
        });
    }

    async function onClickSave() {
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

        if (collectionEntity.hasImages() === false) {
            alertStore.show('You must upload both images of your collection');
            return;
        }

        if (creditCollectionStore.miningFarmRemainingHashPower < collectionEntity.hashPowerInTh) {
            collectionHashPowerValidation.isError = collectionHashPowerValidation.showError = true;
            alertStore.show('Your collection\'s hash power exceed available hash power in the farm');
            return;
        }

        if (creditCollectionStore.isEditMode() === true) {
            await creditCollectionStore.onClickSendForApproval();
            alertStore.show('Your collection has been updated', () => {
                navigate(AppRoutes.CREDIT_MINING_FARM);
            });
        } else {
            creditCollectionStore.moveToStepAddNfts();
        }
    }

    return (
        <div className={'CreditCollectionDetailsForm FlexColumn'}>
            <div className = { 'CreditCollectionDetailsFormHeader' }>
                <div className={'H2 ExtraBold ColorNeutral100'}>Create Collection</div>
                <div className={'B1 ColorNeutral060'}>Fill in the needed information for the collection</div>
            </div>
            <div className={'HorizontalSeparator'}></div>
            <div
                style={ ProjectUtils.makeBgImgStyle(collectionEntity.profileImgUrl) }
                className={`MainImagePreview ImgCoverNode FlexSingleCenter ImagePreview FlexRow ${S.CSS.getClassName(creditCollectionStore.isProfilePictureEmpty(), 'Empty')}`} >
                {creditCollectionStore.isProfilePictureEmpty() === true && (
                    <img src={'/assets/img/no-image.png'} />
                )}
            </div>
            <div className={'ImageLabel FlexColumn'}>
                <div className={'B2 Bold'}>Main Image</div>
                <div className={'B3 SemiBold ColorNeutral060'}>File Format: <span className={'ColorNeutral070'}>.svg, .png, .jpeg, .gif</span></div>
            </div>
            <div className={'B1 SemiBold'}>600 x 400 recommended</div>
            <Actions layout={ActionsLayout.LAYOUT_ROW_LEFT} height={ActionsHeight.HEIGHT_48}>
                <Button>
                    <Svg svg={FileUploadIcon} />
                    Upload file
                    <UploaderComponent
                        id = { this }
                        params = { {
                            'maxSize': 2 * (1 << 20), // 2MB
                            'position': 'static',
                            'fileExt': '.svg, .gif, .jpg, .jpeg, .png',
                            'onExceedLimit': () => {
                                alertStore.show('Max file size is 2MB!');
                            },
                            'multi': true,
                            onReadFileAsBase64: (base64File, responseData, files: any[], i: number) => {
                                runInAction(() => {
                                    collectionEntity.profileImgUrl = base64File;
                                });
                            },
                        } } />
                </Button>
            </Actions>
            <div className={'HorizontalSeparator'}></div>
            <div
                style={ ProjectUtils.makeBgImgStyle(collectionEntity.coverImgUrl) }
                className={`BannerImagePreview ImgCoverNode FlexSingleCenter ${S.CSS.getClassName(creditCollectionStore.isCoverPictureEmpty(), 'Empty')}`} >
                { creditCollectionStore.isCoverPictureEmpty() === true && (
                    <img src={'/assets/img/no-image.png'} />
                )}
            </div>
            <div className={'ImageLabel FlexColumn'}>
                <div className={'B2 Bold'}>Banner Image</div>
                <div className={'B3 SemiBold ColorNeutral060'}>File Format: <span className={'ColorNeutral070'}>.svg, .png, .jpeg, .gif</span></div>
            </div>
            <div className={'B1 SemiBold'}>1400 x 350 recommended</div>
            <Actions layout={ActionsLayout.LAYOUT_ROW_LEFT} height={ActionsHeight.HEIGHT_48}>
                <Button>
                    <Svg svg={FileUploadIcon}/>
                        Upload file
                    <UploaderComponent
                        id = { this }
                        params = { {
                            'maxSize': 2 * (1 << 20), // 2MB
                            'position': 'static',
                            'fileExt': '.svg, .gif, .jpg, .jpeg, .png',
                            'onExceedLimit': () => {
                                alertStore.show('Max file size is 2MB!');
                            },
                            'multi': true,
                            onReadFileAsBase64: (base64File, responseData, files: any[], i: number) => {
                                runInAction(() => {
                                    collectionEntity.coverImgUrl = base64File;
                                });
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
                        multiline = { true }
                        value={collectionEntity.description}
                        onChange={creditCollectionStore.onChangeCollectionDescription} />
                }
                helperText = { 'Collection description will be same for all NFTs within that collection.' } />
            <FieldColumnWrapper
                field = {
                    <Input
                        label={'Hashing Power for collection'}
                        placeholder={'Enter hashing power...'}
                        inputValidation={[collectionHashPowerValidation, notNegativeValidation]}
                        value={hashPowerInTh}
                        onChange={onChangeHashPowerInTh}
                        inputType = { InputType.REAL }
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end" >TH/s</InputAdornment>
                            ),
                        }} />
                }
                helperText = { `Available TH/s: ${creditCollectionStore.formatMiningFarmRemainingHashPower()}` } />
            <FieldColumnWrapper
                field = {
                    <Input
                        label={<TextWithTooltip text={'Secondary NFT Sale Platform Fee'} tooltipText={'Fees charged on secondary sales of the NFTs.'} />}
                        placeholder={'Enter royalties...'}
                        value={secondarySaleRoyalties}
                        inputType={InputType.POSITIVE_REAL}
                        inputValidation={[collectionRoyaltiesValidation, notNegativeValidation]}
                        onChange={onChangeRoyalties}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end" >%</InputAdornment>
                            ),
                        }} />
                }
                helperText = { 'Suggested: 0%, 1%, 2%, 6%. Maxium: 10%.' } />
            {/* <InfoBlueBox text={'Farm admins receives 80% of first NFT sale proceeds. 10% are CUDOS Markets Fees and 10% will be held in a Cudo account as escrow.'} /> */}
            {/* <FieldColumnWrapper
                field = {
                    <Input
                        label={<TextWithTooltip text={'Maintenance Fee (per month)'} tooltipText={'Maintenance Fee (per month)'} />}
                        placeholder={'Maintenance Fee...'}
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
                <div className={'FormulaBox B2 Bold'}>{'[This Collection TH/s] / [Total TH/s] * [Maintenance fee]'}</div>
            </FieldColumnWrapper> */}
            {/* <Input
                label={<TextWithTooltip text={'Set Payout Address'} tooltipText={'Set Payout Address'} />}
                placeholder={'Enter address...'}
                value={collectionEntity.payoutAddress}
                inputValidation={collectionPayoutAddressValidation}
                onChange={creditCollectionStore.onChangeCollectionPayoutAddress} /> */}
            <Checkbox
                value={creditCollectionStore.defaultHashAndPriceValues}
                onChange={onChangeAcceptDefaultHashPowerCheckboxValue}
                label={'Set default artist name, hashing power and nft price values for all items in the collection.'} />
            { creditCollectionStore.defaultHashAndPriceValues === S.INT_TRUE && (
                <>
                    <Input
                        label={'Artist Name'}
                        placeholder={'Enter name...'}
                        value={defaultArtistNamePerNft}
                        inputValidation={collectionArtistNameValidation}
                        onChange={onChangeDefaultArtistNamePerNft} />
                    <Input
                        label={<TextWithTooltip text={'Hashing Power per NFT'} tooltipText={'The hashing power represented by each individual NFT.'} />}
                        placeholder={'Enter hash power...'}
                        value={defaultHashPowerPerNftInTh}
                        inputType = { InputType.REAL }
                        inputValidation={[collectionHashPowerPerNftValidation, notNegativeValidation]}
                        onChange={onChangeDefaultHashPowerPerNftInTh}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end" >TH/s</InputAdornment>
                            ),
                        }} />
                    <Input
                        label={<TextWithTooltip text={'Price per NFT'} tooltipText={'The sale price for each indivudial NFT, fees and royalties included.'} />}
                        placeholder={'Enter price...'}
                        inputType = { InputType.REAL }
                        value={defaultPricePerNftInUsd}
                        inputValidation={[collectionPricePerNftValidation, notNegativeValidation]}
                        onChange={onChangeDefaultPricePerNftInUsd}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start" >$</InputAdornment>
                            ),
                        }} />
                </>
            ) }
            <Actions layout={ActionsLayout.LAYOUT_COLUMN_RIGHT}>
                <Button padding={ButtonPadding.PADDING_48} onClick={onClickSave}>
                    { creditCollectionStore.isEditMode() === true ? (
                        'Save'
                    ) : (
                        'Next Step'
                    ) }
                </Button>

            </Actions>
        </div>
    )
}

export default inject((stores) => stores)(observer(CreditCollectionDetailsForm));
