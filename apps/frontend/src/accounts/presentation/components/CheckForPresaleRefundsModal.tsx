import React from 'react';
import { inject, observer } from 'mobx-react';
import ModalWindow from '../../../core/presentation/components/ModalWindow';
import Actions, { ActionsHeight, ActionsLayout } from '../../../core/presentation/components/Actions';
import Button from '../../../core/presentation/components/Button';
import CheckForPresaleRefundsModalStore, { RefundModalStage } from '../stores/CheckForPresaleRefundsModalStore';
import Svg, { SvgSize } from '../../../core/presentation/components/Svg';
import ReportIcon from '@mui/icons-material/Report';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LaunchIcon from '@mui/icons-material/Launch';
import '../styles/check-for-refunds-modal.css';

type Props = {
    checkForPresaleRefundsModalStore?: CheckForPresaleRefundsModalStore;
}

function CheckForPresaleRefundsModal({ checkForPresaleRefundsModalStore }: Props) {
    return (
        <ModalWindow className = { 'CheckForPresaleRefundsModal' } modalStore = { checkForPresaleRefundsModalStore } >
            <div className={ ' ModalHolder FlexColumn' } >
                { checkForPresaleRefundsModalStore.stage === RefundModalStage.INITIAL && modalStageInitial()}
                { checkForPresaleRefundsModalStore.stage === RefundModalStage.FAIL && modalStageFail()}
                { checkForPresaleRefundsModalStore.stage === RefundModalStage.SUCCESS && modalStageSuccess()}
                { checkForPresaleRefundsModalStore.stage === RefundModalStage.PROCESSING && modalStageProcessing()}
            </div>
        </ModalWindow>
    )

    function modalStageInitial() {
        return (<>
            { checkForPresaleRefundsModalStore.availableRefundAmount !== null && (
                <>
                    <div className = { 'ModalTitleRow' } >
                        <div className = { 'H3 Bold' } >Check for Presale Refunds</div>
                    </div>
                    <div className = { 'ModalTitleRow' } >
                        <div className = { 'H4 Bold' } >ETH Address: {checkForPresaleRefundsModalStore.ethAddress}</div>
                    </div>
                    <div className = { 'ModalTitleRow' } >
                        <div className = { 'H4 Bold' } >Available amount for refund: {checkForPresaleRefundsModalStore.availableRefundAmount.shiftedBy(-18).toFixed()} ETH</div>
                    </div>

                    <Actions className = { 'ModalActionsBottom' } layout={ActionsLayout.LAYOUT_COLUMN_FULL}>
                        <Button disabled = { checkForPresaleRefundsModalStore.availableRefundAmount.gt(0) === false } onClick={checkForPresaleRefundsModalStore.onClickRefund}>Withdraw refunds</Button>
                    </Actions>
                </>
            ) }
        </>)
    }

    function modalStageFail() {
        return <>
            <Svg className={'BigSvg'} svg={ReportIcon} size={SvgSize.CUSTOM}/>
            <div className={'H2 Bold'}>Error</div>
            <div className={'H3 Info'}>Transaction was not successful. Check your network or token balance.</div>
            <Actions layout={ActionsLayout.LAYOUT_ROW_CENTER} height={ActionsHeight.HEIGHT_48}>
                <Button onClick={checkForPresaleRefundsModalStore.hide}>
                Close
                </Button>
                <Button onClick={checkForPresaleRefundsModalStore.onClickRefund}>
                Try Again
                </Button>
            </Actions>
        </>
    }

    function modalStageSuccess() {
        return <>
            <Svg className={'SuccessSvg'} svg={CheckCircleIcon} size={SvgSize.CUSTOM}/>
            <div className={'H2 Bold'}>Success!</div>
            <div className={'H3'}>Transaction was successfully executed.</div>
            <div className={'FlexRow TransactionView H3'}>
                <a className={'Clickable'} href={checkForPresaleRefundsModalStore.getTxLink()} target={'_blank'} rel={'noreferrer'}>
                        Transaction details
                    <Svg svg={LaunchIcon} />
                </a>
            </div>
        </>
    }

    function modalStageProcessing() {
        return <>
            <div className={'H2 Bold'}>Processing...</div>
            <div className={'Info'}>
                <div className={'H3'}>Check your wallet for detailed information.</div>
                <div className={'H3'}>Sign the transaction.</div>
            </div>
        </>
    }

}

export default inject((stores) => stores)(observer(CheckForPresaleRefundsModal));
