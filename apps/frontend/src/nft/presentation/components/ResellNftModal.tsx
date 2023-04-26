import React, { useRef } from 'react';
import { inject, observer } from 'mobx-react';

import ResellNftModalStore from '../stores/ResellNftModalStore';

import InputAdornment from '@mui/material/InputAdornment/InputAdornment';
import ModalWindow from '../../../core/presentation/components/ModalWindow';
import Input, { InputType } from '../../../core/presentation/components/Input';
import Actions, { ActionsHeight, ActionsLayout } from '../../../core/presentation/components/Actions';
import Button, { ButtonColor } from '../../../core/presentation/components/Button';
import Svg, { SvgSize } from '../../../core/presentation/components/Svg';
import AnimationContainer from '../../../core/presentation/components/AnimationContainer';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LaunchIcon from '@mui/icons-material/Launch';
import ReportIcon from '@mui/icons-material/Report';
import '../styles/resell-nft-modal.css';
import ValidationState from '../../../core/presentation/stores/ValidationState';
import BigNumber from 'bignumber.js';
import InfoBlueBox, { InfoAlignment } from '../../../core/presentation/components/InfoBlueBox';
import ProjectUtils from '../../../core/utilities/ProjectUtils';

type Props = {
    resellNftModalStore?: ResellNftModalStore;
}

function ResellNftModal({ resellNftModalStore }: Props) {
    const nftEntity = resellNftModalStore.nftEntity;
    const validationState = useRef(new ValidationState()).current;
    const nftPriceValidation = useRef(validationState.addEmptyValidation('Empty price')).current;
    const nftPriceValidationNotZero = useRef(validationState.addValidation('Price must be more than 0.', (value) => (new BigNumber(value).gt(0)))).current;

    function onClickSubmitForSell() {
        if (validationState.getIsErrorPresent() === true) {
            validationState.setShowErrors(true);
            return;
        }

        resellNftModalStore.onClickSubmitForSell();
    }

    function onClickCancelListing() {
        resellNftModalStore.onClickCancelListing();
    }

    function onClickDeclineCancelListing() {
        resellNftModalStore.hide();
    }

    function onClickSaveEditListing() {
        if (validationState.getIsErrorPresent() === true) {
            validationState.setShowErrors(true);
            return;
        }

        resellNftModalStore.onClickSaveEditListing();
    }

    return (
        <ModalWindow
            className = { 'ResellNftPopup' }
            modalStore = { resellNftModalStore }
            hasClose = { resellNftModalStore.isStageProcessing() === false } >

            <AnimationContainer className = { 'Stage Preview FlexColumn' } active = { resellNftModalStore.isStagePreview() } >
                { resellNftModalStore.isStagePreview() === true && nftEntity !== null && (
                    <>
                        <div className={'H3 Bold'}>{resellNftModalStore.getModelWindowName()}</div>
                        <div className={'BorderContainer FlexRow'}>
                            <div className={'NftPicture'} style={ ProjectUtils.makeBgImgStyle(nftEntity.imageUrl) } />
                            <div className={'NftInfo FlexColumnt'}>
                                <div className={'CollectionName B2 SemiBold Gray'}>{resellNftModalStore.collectionEntity?.name}</div>
                                <div className={'NftName H2 Bold'}>{nftEntity.name}</div>
                                <div className={'Address FlexColumn'}>
                                    <div className={'B2 SemiBold Gray'}>Current Rewards Recipient</div>
                                    <div className={'H3 Bold Dots'}>{nftEntity.currentOwner}</div>
                                </div>
                            </div>
                        </div>
                        {resellNftModalStore.shouldShowPriceInput() === true && (<>
                            <Input inputType={InputType.REAL}
                                value={resellNftModalStore.priceDisplay}
                                onChange={resellNftModalStore.setPrice}
                                label={'Set NFT Price'}
                                placeholder={'0'}
                                inputValidation={[nftPriceValidation, nftPriceValidationNotZero]}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" > $ </InputAdornment>
                                    ),
                                }}
                            />

                        </>)}
                        <InfoBlueBox alignment={InfoAlignment.TOP}>
                            {resellNftModalStore.isTypeCancelResell() === false && (<div>
                                <b>Resale fees</b><br/>
                                    - {resellNftModalStore.miningFarmEntity.cudosResaleNftRoyaltiesPercent}% CUDOS Markets Secondary Resale Royalty<br/>
                                    - {resellNftModalStore.collectionEntity.royalties}% Secondary NFT Sale Platform Fee
                            </div>)}
                            {resellNftModalStore.isTypeCancelResell() === true && (<div>
                                You are about to cancel your listing. Are you sure you want proceed? You will be asked to sign this cancellation from your wallet.<br/><br/>
                                <b>Note</b>: You can list your NFTs for sale at any time.
                            </div>)}
                        </InfoBlueBox>
                        {/* <div className={'CheckBoxText B2 SemiBold'}>Do you want to have immediate auto pay on sale or disperse as per the original payment schedule?</div>
                    <div className={'FlexRow CheckBoxRow'}>
                        <Checkbox
                            label={'Auto pay'}
                            value={resellNftModalStore.autoPay}
                            onChange={resellNftModalStore.toggleAutoPay} />
                        <Checkbox
                            label={'Original Payment Schedule'}
                            value={resellNftModalStore.originalPaymentSchedule}
                            onChange={resellNftModalStore.toggleOriginalPaymentSchedule} />
                    </div> */}
                        {resellNftModalStore.isTypeResell() === true && (<Actions height={ActionsHeight.HEIGHT_48} layout={ActionsLayout.LAYOUT_COLUMN_FULL}>
                            <Button onClick={onClickSubmitForSell}>Submit for sell</Button>
                        </Actions>)}
                        {resellNftModalStore.isTypeEditResell() === true && (
                            <Actions height={ActionsHeight.HEIGHT_48} layout={ActionsLayout.LAYOUT_ROW_FULL}>
                                <Button color={ButtonColor.SCHEME_RED_BORDER} onClick={resellNftModalStore.setModalTypeCancel}>Cancel Listing</Button>
                                <Button onClick={onClickSaveEditListing}>Save Changes</Button>
                            </Actions>)}
                        {resellNftModalStore.isTypeCancelResell() === true && (
                            <Actions height={ActionsHeight.HEIGHT_48} layout={ActionsLayout.LAYOUT_ROW_FULL}>
                                <Button color={ButtonColor.SCHEME_4} onClick={onClickDeclineCancelListing}>No</Button>
                                <Button color={ButtonColor.SCHEME_RED_BORDER} onClick={onClickCancelListing}>Yes, cancel</Button>
                            </Actions>)}
                    </>
                ) }
            </AnimationContainer>

            <AnimationContainer className = { 'Stage Processing FlexColumn' } active = { resellNftModalStore.isStageProcessing() } >
                {resellNftModalStore.isStageProcessing() === true && (
                    <>
                        <div className={'H2 Bold'}>Processing...</div>
                        <div className={'H3 Info'}>Check your wallet for detailed information.</div>
                    </>
                ) }
            </AnimationContainer>

            <AnimationContainer className = { 'Stage Success FlexColumn' } active = { resellNftModalStore.isStageSuccess() } >
                {resellNftModalStore.isStageSuccess() === true && (
                    <>
                        <Svg className={'BigSvg'} svg={CheckCircleIcon} size={SvgSize.CUSTOM}/>
                        <div className={'H2 Bold'}>Success!</div>
                        <div className={'H3 Info'}>Transaction was successfully executed.</div>
                        <div className={'FlexRow TransactionView H3'}>
                            <a className={'Clickable'} href={resellNftModalStore.getTxLink()} target={'_blank'} rel={'noreferrer'}>
                            Transaction details
                                <Svg svg={LaunchIcon} />
                            </a>
                        </div>
                        <Actions layout={ActionsLayout.LAYOUT_ROW_CENTER} height={ActionsHeight.HEIGHT_48}>
                            <Button
                                onClick={resellNftModalStore.hide}>
                            Close Now
                            </Button>
                        </Actions>
                    </>
                ) }
            </AnimationContainer>

            <AnimationContainer className = { 'Stage Fail FlexColumn' } active = { resellNftModalStore.isStageFail() } >
                {resellNftModalStore.isStageFail() === true && (
                    <>
                        <Svg className={'BigSvg'} svg={ReportIcon} size={SvgSize.CUSTOM}/>
                        <div className={'H2 Bold'}>Error</div>
                        <div className={'H3 Info'}>Transaction was not successful. Check your network or token balance.</div>
                        {/* <div className={'FlexRow TransactionView H3'}>
                        <a className={'Clickable'} href={resellNftModalStore.getTxLink()} target={'_blank'} rel={'noreferrer'}>
                            Transaction details
                            <Svg svg={LaunchIcon} />
                        </a>
                    </div> */}
                        <Actions layout={ActionsLayout.LAYOUT_ROW_CENTER} height={ActionsHeight.HEIGHT_48}>
                            <Button onClick={resellNftModalStore.hide}>
                                Close
                            </Button>
                            <Button onClick={resellNftModalStore.onClickSubmitForSell}>
                                Try Again
                            </Button>
                        </Actions>
                    </>
                ) }
            </AnimationContainer>

        </ModalWindow>
    )
}

export default inject((stores) => stores)(observer(ResellNftModal));
