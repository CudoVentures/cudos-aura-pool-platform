import React, { useRef, useState } from 'react';
import BigNumber from 'bignumber.js';
import { inject, observer } from 'mobx-react';

import S from '../../../../../core/utilities/Main';
import BitcoinStore from '../../../../bitcoin-data/presentation/stores/BitcoinStore';
import CreditCollectionStore from '../../stores/CreditCollectionStore';
import ValidationState from '../../../../../core/presentation/stores/ValidationState';
import ProjectUtils from '../../../../../core/utilities/ProjectUtils';

import Svg, { SvgSize } from '../../../../../core/presentation/components/Svg';
import Actions, { ActionsHeight, ActionsLayout } from '../../../../../core/presentation/components/Actions';
import Button, { ButtonType } from '../../../../../core/presentation/components/Button';
import UploaderComponent from '../../../../../core/presentation/components/UploaderComponent';
import Input, { InputType } from '../../../../../core/presentation/components/Input';
import TextWithTooltip from '../../../../../core/presentation/components/TextWithTooltip';
import InfoGrayBox from '../../../../../core/presentation/components/InfoGrayBox';
import SingleDatepicker from '../../../../../core/presentation/components/SingleDatepicker';
import FieldColumnWrapper from '../../../../../core/presentation/components/FieldColumnWrapper';

import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import '../../styles/credit-collection-add-nft-form.css';

type Props = {
    creditCollectionStore?: CreditCollectionStore;
    bitcoinStore?: BitcoinStore;
}

function CreditCollectionAddNftForm({ creditCollectionStore, bitcoinStore }: Props) {
    const selectedNftEntity = creditCollectionStore.selectedNftEntity;

    const [editRoyaltiesDisabled, setEditRoyaltiesDisabled] = useState(true);
    const [editMaintenanceFeeDisabled, setEditMaintenanceFeeDisabled] = useState(true);

    const validationState = useRef(new ValidationState()).current;
    const nftNameValidation = useRef(validationState.addEmptyValidation('Empty name')).current;
    const nftHashPowerValidation = useRef(validationState.addEmptyValidation('Empty hash power')).current;
    const nftPriceValidation = useRef(validationState.addEmptyValidation('Empty price')).current;
    const nftRoyaltiesValidation = useRef(validationState.addEmptyValidation('Empty royalties')).current;
    const nftMaintenanceFeeValidation = useRef(validationState.addEmptyValidation('Empty maintenance fee')).current;

    function onClickAddToCollection() {
        if (validationState.getIsErrorPresent() === true) {
            validationState.setShowErrors(true);
            return;
        }

        creditCollectionStore.onClickAddToCollection();
    }

    return (
        <div className={'CreditCollectionAddNftForm FlexColumn'}>
            <div className={'H3 Bold'}>Add NFTs to Collection</div>
            <div className={'B1'}>Fill in the needed information for the NFTs.</div>
            <div className={'HorizontalSeparator'}></div>
            <div
                style={ selectedNftEntity === null ? null : ProjectUtils.makeBgImgStyle(selectedNftEntity.imageUrl) }
                className={`MainImagePreview ImagePreview FlexRow ${S.CSS.getClassName(creditCollectionStore.isSelectedNftImageEmpty(), 'Empty')}`} >
                {creditCollectionStore.isSelectedNftImageEmpty() === true && (
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
                    <Svg svg={FileUploadIcon}/>
                    Upload file
                    { selectedNftEntity !== null && (
                        <UploaderComponent
                            id = { this }
                            params = { {
                                'maxSize': 73400320, // 70MB
                                'onExceedLimit': () => {
                                    this.props.alertStore.show('', 'Максималният размер на файловете е 70MB!');
                                },
                                onReadFileAsBase64: (base64File, responseData, files: any[], i: number) => {
                                    selectedNftEntity.imageUrl = base64File;
                                },
                            } } />
                    ) }
                </Button>
            </Actions>
            <Input
                label={'NFT Name'}
                placeholder={'Enter name...'}
                disabled = { selectedNftEntity === null }
                value={creditCollectionStore.getSelectedNftName()}
                inputValidation={nftNameValidation}
                onChange={creditCollectionStore.onChangeSelectedNftName} />
            <FieldColumnWrapper
                field = {
                    <Input
                        label={<TextWithTooltip text={'Hashing Power per NFT'} tooltipText={'Hashing Power per NFT'} />}
                        placeholder={'Enter hashing power...'}
                        disabled = { selectedNftEntity === null }
                        value={creditCollectionStore.selectedNftHashingPowerInEHInputValue}
                        inputType={InputType.INTEGER}
                        inputValidation={nftHashPowerValidation}
                        onChange={creditCollectionStore.onChangeSelectedNftHashPowerInEH} />
                }
                helperText = { 'Available EH/s: 80.000' }>
                <InfoGrayBox text={'You receive <b>XX</b> upon the sale and <b>YY</b> on <b>ZZ</b> date'} />
            </FieldColumnWrapper>
            <FieldColumnWrapper
                field = {
                    <Input
                        label={'Price per NFT'}
                        placeholder={'Enter price...'}
                        disabled = { selectedNftEntity === null }
                        value={creditCollectionStore.selectedNftPriceInCudosInputValue}
                        inputValidation={nftPriceValidation}
                        onChange={creditCollectionStore.onChangeSelectedNftPriceInCudos} />
                }
                helperText = { `${bitcoinStore.getBitcoinPriceInUsd()} based on Today’s BTC Price` } />
            <FieldColumnWrapper
                field = {
                    <Input
                        label={
                            <>
                                { selectedNftEntity !== null && (
                                    <div className={'HeaderWithButton FlexRow'}>
                                        <TextWithTooltip text={'Farm Royalties'} tooltipText={'Farm Royalties'} />
                                        <div className={'InputHeaderButton FlexRow'} onClick={() => setEditRoyaltiesDisabled(!editRoyaltiesDisabled)}>
                                            <Svg className = { 'SvgInputEdit' } size = { SvgSize.CUSTOM } svg={BorderColorIcon} />
                                            Edit
                                        </div>
                                    </div>
                                ) }

                            </>
                        }
                        disabled={editRoyaltiesDisabled || selectedNftEntity === null}
                        placeholder={'Enter royalties...'}
                        inputValidation={nftRoyaltiesValidation}
                        value={creditCollectionStore.getSelectedNftRoyaltiesInputValue()}
                        inputType={InputType.INTEGER}
                        onChange={creditCollectionStore.onChangeSelectedNftRoyalties} />
                }
                helperText = { 'Suggested: 0%, 1%, 2%, 6%. Maxium: 10%.' } />
            <FieldColumnWrapper
                field = {
                    <Input
                        label={
                            <>
                                { selectedNftEntity !== null && (
                                    <div className={'HeaderWithButton FlexRow'}>
                                        <TextWithTooltip text={'Maintenance Fee'} tooltipText={'Maintenance Fee'} />
                                        <div className={'InputHeaderButton FlexRow'} onClick={() => setEditMaintenanceFeeDisabled(!editMaintenanceFeeDisabled)}>
                                            <Svg className = { 'SvgInputEdit' } size = { SvgSize.CUSTOM } svg={BorderColorIcon} />
                                            Edit
                                        </div>
                                    </div>
                                ) }

                            </>
                        }
                        disabled={editMaintenanceFeeDisabled}
                        inputValidation={nftMaintenanceFeeValidation || selectedNftEntity === null}
                        placeholder={'Enter Maintenance Fee...'}
                        value={creditCollectionStore.selectedNftMaintenanceFeeInBtcInputValue}
                        inputType={InputType.INTEGER}
                        onChange={creditCollectionStore.onChangeSelectedNftMaintenanceFeeInBtc}
                    />
                }
                helperText = { 'Maintenance fee calculation formula:' }>
                <div className={'FormulaBox B2 Bold'}>{'[This NFT EH/s] / [Total EH/s] * [Maintenance fee]'}</div>
            </FieldColumnWrapper>
            <SingleDatepicker
                label = {
                    <TextWithTooltip text={'Valid Until'} tooltipText={'BTC rewards will be paid to the NFT holder until this date.'} />
                }
                disabled = { selectedNftEntity === null }
                selected = { creditCollectionStore.getSelectedNftExpirationDateInputValue() }
                onChange = { creditCollectionStore.onChangeSelectedNftExpirationDate } />
            <div className = { 'FlexSplit' }>
                { creditCollectionStore.isCreateMode() === true && (
                    <Actions className={'ButtonsRow'}>
                        <Button type={ButtonType.TEXT_INLINE} onClick={ creditCollectionStore.moveToStepDetails }>
                            <Svg svg={ArrowBackIcon} />
                        Back
                        </Button>
                    </Actions>
                ) }
                { selectedNftEntity !== null && (
                    <Actions className={'StartRight'}>
                        <Button onClick={onClickAddToCollection}>
                            {selectedNftEntity.isNew() === true ? 'Add to Collection' : 'Save'}
                        </Button>
                    </Actions>
                ) }
            </div>
        </div>
    )

}

export default inject((stores) => stores)(observer(CreditCollectionAddNftForm));
