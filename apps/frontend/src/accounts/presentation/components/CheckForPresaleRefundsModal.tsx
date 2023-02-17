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

    function renderStageInitial() {
        return (<>
            { checkForPresaleRefundsModalStore.availableRefundAmount !== null && (
                <>
                    <div className = { 'ModalTitleRow' } >
                        <div className = { 'H2 Bold ColorPrimary60' } >Check for Presale Refunds</div>
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

    function renderStageFail() {
        return <>
            <Svg className={'StatusSvg ColorError060'} svg={ReportIcon} size={SvgSize.CUSTOM} />
            <div className={'H2 Bold'}>Error</div>
            <div className={'H3 Info'}>Transaction was not successful. Check your network or token balance.</div>
            <Actions className = { 'ModalActionsBottom' } layout={ActionsLayout.LAYOUT_ROW_CENTER} height={ActionsHeight.HEIGHT_48}>
                <Button onClick={checkForPresaleRefundsModalStore.hide}> Close </Button>
                <Button onClick={checkForPresaleRefundsModalStore.onClickRefund}> Try Again </Button>
            </Actions>
        </>
    }

    function renderStageSuccess() {
        return <>
            <Svg className={'StatusSvg ColorSuccess060'} svg={CheckCircleIcon} size={SvgSize.CUSTOM}/>
            <div className={'H2 Bold'}>Success!</div>
            <div className={'H3 Info'}>Transaction was successfully executed.</div>
            <div className={'TransactionView H3 ModalActionsBottom'}>
                <a className={'FlexRow Clickable'} href={checkForPresaleRefundsModalStore.getTxLink()} target={'_blank'} rel={'noreferrer'}>
                    Transaction details
                    <Svg svg={LaunchIcon} />
                </a>
            </div>
        </>
    }

    function renderStageProcessing() {
        return <>
            <div className={'H2 Bold'}>Processing...</div>
            <div className={'H3 Info'}>
                <div>Check your wallet for detailed information.</div>
                <div>Sign the transaction.</div>
            </div>
        </>
    }

    return (
        <ModalWindow className = { 'CheckForPresaleRefundsModal' } modalStore = { checkForPresaleRefundsModalStore } hasClose = { checkForPresaleRefundsModalStore.stage !== RefundModalStage.PROCESSING } >
            <div className={ 'ModalHolder FlexColumn' } >
                { checkForPresaleRefundsModalStore.stage === RefundModalStage.INITIAL && renderStageInitial()}
                { checkForPresaleRefundsModalStore.stage === RefundModalStage.FAIL && renderStageFail()}
                { checkForPresaleRefundsModalStore.stage === RefundModalStage.SUCCESS && renderStageSuccess()}
                { checkForPresaleRefundsModalStore.stage === RefundModalStage.PROCESSING && renderStageProcessing()}
            </div>
        </ModalWindow>
    )

}

export default inject((stores) => stores)(observer(CheckForPresaleRefundsModal));
