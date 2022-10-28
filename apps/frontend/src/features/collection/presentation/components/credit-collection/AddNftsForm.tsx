import { inject, observer } from 'mobx-react';
import React, { useRef, useState } from 'react';
import '../../styles/add-nfts-form.css';
import '../../styles/input-column-holder.css';
import CreditCollectionStore from '../../stores/CreditCollectionStore';
import Svg, { SvgSize } from '../../../../../core/presentation/components/Svg';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import Actions, { ActionsHeight, ActionsLayout } from '../../../../../core/presentation/components/Actions';
import Button, { ButtonRadius, ButtonType } from '../../../../../core/presentation/components/Button';
import UploaderComponent from '../../../../../core/presentation/components/UploaderComponent';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import Input, { InputType } from '../../../../../core/presentation/components/Input';
import TextWithTooltip from '../../../../../core/presentation/components/TextWithTooltip';
import InfoGrayBox from '../../../../../core/presentation/components/InfoGrayBox';
import BitcoinStore from '../../../../bitcoin-data/presentation/stores/BitcoinStore';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import S from '../../../../../core/utilities/Main';
import SingleDatepicker from '../../../../../core/presentation/components/SingleDatepicker';
import ValidationState from '../../../../../core/presentation/stores/ValidationState';

type Props = {
    onClickBack: () => void
    creditCollectionStore?: CreditCollectionStore;
    bitcoinStore?: BitcoinStore;
}

function AddNftsForm({ onClickBack, creditCollectionStore, bitcoinStore }: Props) {
    const [editRoyaltiesDisabled, setEditRoyaltiesDisabled] = useState(true);
    const [editMaintenanceFeeDisabled, setEditMaintenanceFeeDisabled] = useState(true);
    const validationState = useRef(new ValidationState()).current;
    const nftNameValidation = useRef(validationState.addEmptyValidation('Empty name')).current;
    const nftHashPowerValidation = useRef(validationState.addEmptyValidation('Empty hash power')).current;
    const nftPriceValidation = useRef(validationState.addEmptyValidation('Empty name')).current;
    const nftRoyaltiesValidation = useRef(validationState.addEmptyValidation('Empty royalties')).current;
    const nftMaintenanceFeeValidation = useRef(validationState.addEmptyValidation('Empty maintenance fee')).current;

    const selectedNftEntity = creditCollectionStore.selectedNftEntity;
    function onClickAddToCollection() {
        if (validationState.getIsErrorPresent() === true) {
            validationState.setShowErrors(true);
            return;
        }

        creditCollectionStore.onClickAddToCollection();
    }

    return (
        <div className={'AddNftsForm FlexColumn'}>
            <div className={'H3 Bold'}>Add NFTs to Collection</div>
            <div className={'B1'}>Fill in the needed information for the NFTs.</div>
            <div className={'HorizontalSeparator'}></div>
            <div
                style={{
                    backgroundImage: `url("${selectedNftEntity.imageUrl}")`,
                }}
                className={`MainImagePreview ImagePreview FlexRow ${S.CSS.getClassName(creditCollectionStore.isSelectedNftImageEmpty(), 'Empty')}`}
            >
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
                <Button
                    radius={ButtonRadius.RADIUS_16}
                >
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
                                selectedNftEntity.imageUrl = base64File;
                            },
                        } } />
                </Button>
            </Actions>
            <Input
                label={'NFT Name'}
                placeholder={'Enter name...'}
                value={selectedNftEntity.name}
                inputValidation={nftNameValidation}
                onChange={creditCollectionStore.onChangeSelectedNftName}
            />
            <div className={'InputColumnHolder'}>
                <Input
                    label={<TextWithTooltip text={'Hashing Power per NFT'} tooltipText={'Hashing Power per NFT'} />}
                    placeholder={'Enter hashing power...'}
                    value={selectedNftEntity.hashPower}
                    inputType={InputType.INTEGER}
                    inputValidation={nftHashPowerValidation}
                    onChange={creditCollectionStore.onChangeSelectedNftHashPower}
                />
                <div className={'InputInfoLabel'}>Available TH/s: 80.000</div>
                <InfoGrayBox text={'You receive <b>XX</b> upon the sale and <b>YY</b> on <b>ZZ</b> date'} />
            </div>
            <div className={'InputColumnHolder'}>
                <Input
                    label={'Price per NFT'}
                    placeholder={'Enter price...'}
                    value={selectedNftEntity.price.toString()}
                    inputValidation={nftPriceValidation}
                    onChange={creditCollectionStore.onChangeSelectedNftPrice}
                />
                <div className={'InputInfoLabel'}>{bitcoinStore.getBitcoinPrice()} based on Today’s BTC Price </div>
            </div>
            <div className={'InputColumnHolder'}>
                <Input
                    label={
                        <div className={'HeaderWithButton FlexRow'}>
                            <TextWithTooltip text={'Farm Royalties'} tooltipText={'Farm Royalties'} />
                            <div className={'InputHeaderButton FlexRow'} onClick={() => setEditRoyaltiesDisabled(editRoyaltiesDisabled)}>
                                <Svg svg={BorderColorIcon} />
                                Edit
                            </div>
                        </div>
                    }
                    disabled={editRoyaltiesDisabled}
                    placeholder={'Enter royalties...'}
                    inputValidation={nftRoyaltiesValidation}
                    value={creditCollectionStore.getSelectedNftRoyaltiesInputValue()}
                    inputType={InputType.INTEGER}
                    onChange={creditCollectionStore.onChangeSelectedNftRoyalties}
                />
                <div className={'InputInfoLabel'}>Suggested: 0%, 1%, 2%, 6%. Maxium: 10%.</div>
            </div>
            <div className={'InputColumnHolder'}>
                <Input
                    label={
                        <div className={'HeaderWithButton FlexRow'}>
                            <TextWithTooltip text={'Maintenance Fee'} tooltipText={'Maintenance Fee'} />
                            <div className={'InputHeaderButton FlexRow'} onClick={() => setEditMaintenanceFeeDisabled(editMaintenanceFeeDisabled)}>
                                <Svg svg={BorderColorIcon} />
                                Edit
                            </div>
                        </div>
                    }
                    disabled={editMaintenanceFeeDisabled}
                    inputValidation={nftMaintenanceFeeValidation}
                    placeholder={'Enter Maintenance Fee...'}
                    value={creditCollectionStore.getSelectedNftMaintenanceFeeInputValue()}
                    inputType={InputType.INTEGER}
                    onChange={creditCollectionStore.onChangeSelectedNftMaintenanceFee}
                />
                <div className={'InputInfoLabel'}>Maintenance fee calculation formula:</div>
                <div className={'FormulaBox B2 Bold'}>{'[This NFT EH/s] / [Total EH/s] * [Maintenance fee]'}</div>
            </div>
            <SingleDatepicker
                label={<TextWithTooltip text={'Valid Until'} tooltipText={'BTC rewards will be paid to the NFT holder until this date.'} />}
                selected = { creditCollectionStore.getSelectedNftExpirationDateDisplay() }
                onChange = { creditCollectionStore.onChangeSelectedNftExpirationDate } />
            <Actions layout={ActionsLayout.LAYOUT_ROW_ENDS} className={'ButtonsRow'}>
                <Button type={ButtonType.TEXT_INLINE} onClick={onClickBack}>
                    <Svg svg={ArrowBackIcon} />
                    Back
                </Button>
                <Button onClick={onClickAddToCollection}>
                    {creditCollectionStore.selectedNftEntity.id === S.Strings.NOT_EXISTS ? 'Add to Collection' : 'Save Edit'}
                </Button>
            </Actions>
        </div>
    )

}

export default inject((stores) => stores)(observer(AddNftsForm));
