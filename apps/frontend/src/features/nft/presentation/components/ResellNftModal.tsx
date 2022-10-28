import React, { useRef } from 'react';
import { inject, observer } from 'mobx-react';

import S from '../../../../core/utilities/Main';
import ResellNftModalStore from '../stores/ResellNftModalStore';

import InputAdornment from '@mui/material/InputAdornment';
import ModalWindow from '../../../../core/presentation/components/ModalWindow';
import Input, { InputType } from '../../../../core/presentation/components/Input';
import Checkbox from '../../../../core/presentation/components/Checkbox';
import Actions, { ActionsHeight, ActionsLayout } from '../../../../core/presentation/components/Actions';
import Button from '../../../../core/presentation/components/Button';
import Svg, { SvgSize } from '../../../../core/presentation/components/Svg';
import AnimationContainer from '../../../../core/presentation/components/AnimationContainer';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LaunchIcon from '@mui/icons-material/Launch';
import ReportIcon from '@mui/icons-material/Report';
import '../styles/resell-nft-modal.css';
import ValidationState from '../../../../core/presentation/stores/ValidationState';

type Props = {
    resellNftModalStore?: ResellNftModalStore;
}

function ResellNftModal({ resellNftModalStore }: Props) {
    const nftEntity = resellNftModalStore.nftEntity;
    const validationState = useRef(new ValidationState()).current;
    const nftPriceValidation = useRef(validationState.addEmptyValidation('Empty price')).current;

    function onClickSubmitForSell() {
        if (validationState.getIsErrorPresent() === true) {
            validationState.setShowErrors(true);
            return;
        }

        resellNftModalStore.onClickSubmitForSell();
    }
    function PreviewContent() {
        return (
            <>
                <div className={'H3 Bold'}>Resell NFT</div>
                <div className={'BorderContainer FlexRow'}>
                    <div
                        className={'NftPicture'}
                        style={{
                            backgroundImage: `url("${nftEntity.imageUrl}")`,
                        }}
                    />
                    <div className={'NftInfo FlexColumnt'}>
                        <div className={'CollectionName B2 SemiBold Gray'}>{resellNftModalStore.collectionName}</div>
                        <div className={'NftName H2 Bold'}>{nftEntity.name}</div>
                        <div className={'Address FlexColumn'}>
                            <div className={'B2 SemiBold Gray'}>Current Rewards Recipient</div>
                            <div className={'H3 Bold Dots'}>{nftEntity.currentOwnerAddress}</div>
                        </div>
                    </div>
                </div>
                <Input inputType={InputType.REAL}
                    value={resellNftModalStore.priceDisplay}
                    onChange={resellNftModalStore.setPrice}
                    label={'Set NFT Price'}
                    placeholder={'0'}
                    inputValidation={nftPriceValidation}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end" > CUDOS </InputAdornment>
                        ),
                    }}
                />
                <div className={'CheckBoxText B2 SemiBold'}>Do you want to have immediate auto pay on sale or disperse as per the original payment schedule?</div>
                <div className={'FlexRow CheckBoxRow'}>
                    <Checkbox
                        label={'Auto pay'}
                        value={resellNftModalStore.autoPay}
                        onChange={resellNftModalStore.toggleAutoPay} />
                    <Checkbox
                        label={'Original Payment Schedule'}
                        value={resellNftModalStore.originalPaymentSchedule}
                        onChange={resellNftModalStore.toggleOriginalPaymentSchedule} />
                </div>
                <Actions height={ActionsHeight.HEIGHT_48} layout={ActionsLayout.LAYOUT_COLUMN_FULL}>
                    <Button onClick={onClickSubmitForSell}>Submit for sell</Button>
                </Actions>
            </>
        )
    }

    function ProcessingContent() {
        return (
            <>
                <div className={'H2 Bold'}>Processing...</div>
                <div className={'H3 Info'}>Check your wallet for detailed information.</div>
            </>
        )
    }

    function SuccessContent() {
        return (
            <>
                <Svg className={'BigSvg'} svg={CheckCircleIcon} size={SvgSize.CUSTOM}/>
                <div className={'H2 Bold'}>Success!</div>
                <div className={'H3 Info'}>Transaction was successfully executed.</div>
                <div className={'FlexRow TransactionView H3'}>
                    Transaction details
                    <a className={'Clickable'} href={resellNftModalStore.getTxLink()} target={'_blank'} rel={'noreferrer'}>
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
        )
    }

    function FailContent() {
        return (
            <>
                <Svg className={'BigSvg'} svg={ReportIcon} size={SvgSize.CUSTOM}/>
                <div className={'H2 Bold'}>Error</div>
                <div className={'H3 Info'}>Transaction was not successful. Check your network or token balance.</div>
                <div className={'FlexRow TransactionView H3'}>
                    Transaction details
                    <a className={'Clickable'} href={resellNftModalStore.getTxLink()} target={'_blank'} rel={'noreferrer'}>
                        <Svg svg={LaunchIcon} />
                    </a>
                </div>
                <Actions layout={ActionsLayout.LAYOUT_ROW_CENTER} height={ActionsHeight.HEIGHT_48}>
                    <Button
                        onClick={resellNftModalStore.hide}>
                        Close
                    </Button>
                    <Button
                        onClick={resellNftModalStore.onClickSubmitForSell}>
                        Try Again
                    </Button>
                </Actions>
            </>
        )
    }

    return (
        <ModalWindow
            className = { 'ResellNftPopup' }
            modalStore = { resellNftModalStore } >

            <AnimationContainer className = { 'Stage Preview FlexColumn' } active = { resellNftModalStore.isStagePreview() } >
                { resellNftModalStore.isStagePreview() === true && <PreviewContent /> }
            </AnimationContainer>

            <AnimationContainer className = { 'Stage Processing FlexColumn' } active = { resellNftModalStore.isStageProcessing() } >
                {resellNftModalStore.isStageProcessing() === true && <ProcessingContent /> }
            </AnimationContainer>

            <AnimationContainer className = { 'Stage Success FlexColumn' } active = { resellNftModalStore.isStageSuccess() } >
                {resellNftModalStore.isStageSuccess() === true && <SuccessContent /> }
            </AnimationContainer>

            <AnimationContainer className = { 'Stage Fail FlexColumn' } active = { resellNftModalStore.isStageFail() } >
                {resellNftModalStore.isStageFail() === true && <FailContent /> }
            </AnimationContainer>

        </ModalWindow>
    )
}

export default inject((stores) => stores)(observer(ResellNftModal));
