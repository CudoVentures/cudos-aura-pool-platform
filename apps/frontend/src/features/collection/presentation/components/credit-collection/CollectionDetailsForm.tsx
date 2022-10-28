import Svg, { SvgSize } from '../../../../../core/presentation/components/Svg';
import S from '../../../../../core/utilities/Main';
import { inject, observer } from 'mobx-react';
import React, { useRef } from 'react';
import CreditCollectionStore from '../../stores/CreditCollectionStore';
import '../../styles/input-column-holder.css';
import '../../styles/collection-details-form.css';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import Actions, { ActionsHeight, ActionsLayout } from '../../../../../core/presentation/components/Actions';
import Button, { ButtonPadding, ButtonRadius } from '../../../../../core/presentation/components/Button';
import UploaderComponent from '../../../../../core/presentation/components/UploaderComponent';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import Input, { InputType } from '../../../../../core/presentation/components/Input';
import TextWithTooltip from '../../../../../core/presentation/components/TextWithTooltip';
import InfoGrayBox from '../../../../../core/presentation/components/InfoGrayBox';
import Checkbox from '../../../../../core/presentation/components/Checkbox';
import ValidationState from '../../../../../core/presentation/stores/ValidationState';

type Props = {
    onClickNextStep: () => void
    creditCollectionStore?: CreditCollectionStore;
}

function CollectionDetailsForm({ onClickNextStep, creditCollectionStore }: Props) {
    const collectionEntity = creditCollectionStore.collectionEntity;
    const validationState = useRef(new ValidationState()).current;
    const collectionNameValidation = useRef(validationState.addEmptyValidation('Empty name')).current;
    const collectionHashPowerValidation = useRef(validationState.addEmptyValidation('Empty hashing power')).current;
    const collectionRoyaltiesValidation = useRef(validationState.addEmptyValidation('Empty royalties')).current;
    const collectionMainteannceFeesValidation = useRef(validationState.addEmptyValidation('Empty maintenance fees')).current;
    const collectionPayoutAddressValidation = useRef(validationState.addCudosAddressValidation('Empty payout address')).current;
    const collectionHashPowerPerNftValidation = useRef(validationState.addEmptyValidation('Empty hashing power per nft')).current;
    const collectionPricePerNftValidation = useRef(validationState.addEmptyValidation('Empty price per nft')).current;

    function onClickNextStepButton() {
        if (validationState.getIsErrorPresent() === true) {
            validationState.setShowErrors(true);
            return;
        }

        creditCollectionStore.initNewNftEntity();
        onClickNextStep();
    }

    return (
        <div className={'CollectionDetailsForm FlexColumn'}>
            <div className={'H3 Bold'}>Create Collecton</div>
            <div className={'B1'}>Fill in the needed information for the collection</div>
            <div className={'HorizontalSeparator'}></div>
            <div
                style={{
                    backgroundImage: `url("${collectionEntity.profileImgUrl}")`,
                }}
                className={`MainImagePreview ImagePreview FlexRow ${S.CSS.getClassName(creditCollectionStore.isProfilePictureEmpty(), 'Empty')}`}
            >
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
                                collectionEntity.profileImgUrl = base64File;
                            },
                        } } />
                </Button>
            </Actions>
            <div className={'HorizontalSeparator'}></div>
            <div
                style={{
                    backgroundImage: `url("${collectionEntity.coverImgUrl}")`,
                }}
                className={`BannerImagePreview ImagePreview FlexRow ${S.CSS.getClassName(creditCollectionStore.isCoverPictureEmpty(), 'Empty')}`}
            >
                {creditCollectionStore.isCoverPictureEmpty() === true && (
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
                onChange={creditCollectionStore.onChangeCollectionName}
            />
            <div className={'InputColumnHolder'}>
                <Input
                    label={'Description (Optional)'}
                    placeholder={'Enter description...'}
                    value={collectionEntity.description}
                    onChange={creditCollectionStore.onChangeCollectionDescription}
                />
                <div className={'InputInfoLabel'}>Collection description will be same for all NFTs within that collection. </div>
            </div>
            <Input
                label={'Hashing Power for collection'}
                placeholder={'Enter hashing power...'}
                inputValidation={collectionHashPowerValidation}
                value={creditCollectionStore.getHashingPowerInputValue()}
                onChange={creditCollectionStore.onChangeHashingPower}
            />
            <div className={'InputColumnHolder'}>
                <Input
                    label={<TextWithTooltip text={'Secondary Sale Royalties'} tooltipText={'Secondary Sale Royalties'} />}
                    placeholder={'Enter royalties...'}
                    value={creditCollectionStore.getCollectionRoyaltiesInputValue()}
                    inputType={InputType.INTEGER}
                    inputValidation={collectionRoyaltiesValidation}
                    onChange={creditCollectionStore.onChangeCollectionRoyalties}
                />
                <div className={'InputInfoLabel'}>Suggested: 0%, 1%, 2%, 6%. Maxium: 10%.</div>
            </div>
            <InfoGrayBox text={'Farm admins receives 80% of first NFT sale proceeds. 10% are Aura Pool Fees and 10% will be held to a Cudo account as escrow. Farm admin is able to change their payout address per collection.'} />
            <div className={'InputColumnHolder'}>
                <Input
                    label={<TextWithTooltip text={'Maintenance Fees (per month)'} tooltipText={'Maintenance Fees (per month)'} />}
                    placeholder={'Maintenance fees...'}
                    value={creditCollectionStore.getCollectionMaintenanceFeesInputValue()}
                    inputType={InputType.INTEGER}
                    inputValidation={collectionMainteannceFeesValidation}
                    onChange={creditCollectionStore.onChangeMaintenanceFees}
                />
                <div className={'InputInfoLabel'}>Maintenance fee calculation formula:</div>
                <div className={'FormulaBox B2 Bold'}>{'[This NFT EH/s] / [Total EH/s] * [Maintenance fee]'}</div>
            </div>
            <Input
                label={<TextWithTooltip text={'Set Payout Address'} tooltipText={'Set Payout Address'} />}
                placeholder={'Enter address...'}
                value={collectionEntity.payoutAddress}
                inputValidation={collectionPayoutAddressValidation}
                onChange={creditCollectionStore.onChangeCollectionPayoutAddress}
            />
            <Checkbox
                value={creditCollectionStore.defaultHashAndPriceValues}
                onChange={creditCollectionStore.onChangeAcceptDefaultHashPowerCheckboxValue}
                label={'Do you want to set default hashing power and nft price values for all items in the collection?'}
            />
            <Input
                label={<TextWithTooltip text={'Hashing Power per NFT'} tooltipText={'Paid monthly in BTC'} />}
                placeholder={'Enter hash power...'}
                value={creditCollectionStore.getHashPowerPerNft()}
                inputValidation={collectionHashPowerPerNftValidation}
                onChange={creditCollectionStore.onChangeHashPowerPerNft}
            />
            <Input
                label={'Price per NFT'}
                placeholder={'Enter price...'}
                value={creditCollectionStore.getPricePerNft()}
                inputValidation={collectionPricePerNftValidation}
                onChange={creditCollectionStore.onChangePricePerNft}
            />

            <Actions layout={ActionsLayout.LAYOUT_COLUMN_RIGHT}>
                <Button padding={ButtonPadding.PADDING_48} onClick={onClickNextStepButton}>NextStep</Button>
            </Actions>
        </div>
    )
}

export default inject((stores) => stores)(observer(CollectionDetailsForm));
