import React, { useRef } from 'react';
import { inject, observer } from 'mobx-react';
import SnackStore from '../../../../core/presentation/stores/SnackStore';
import EditUserBtcModalStore from '../stores/EditUserBtcModalStore';
import ModalWindow from '../../../../core/presentation/components/ModalWindow';
import Actions, { ActionsLayout } from '../../../../core/presentation/components/Actions';
import Button from '../../../../core/presentation/components/Button';
import Input from '../../../../core/presentation/components/Input';
import ValidationState from '../../../../core/presentation/stores/ValidationState';

type Props = {
    snackStore?: SnackStore;
    editUserBtcModalStore?: EditUserBtcModalStore;
}

function EditUserBtcModal({ snackStore, editUserBtcModalStore }: Props) {

    const validationState = useRef(new ValidationState()).current;
    const bitcoinPayoutWalletAddressValidation = useRef(validationState.addBitcoinAddressValidation('Invalid bitcoin address')).current;

    async function onClickSave() {
        if (validationState.getIsErrorPresent() === true) {
            validationState.setShowErrors(true);
            return;
        }

        try {
            await editUserBtcModalStore.confirmBitcoinAddress();
            await editUserBtcModalStore.editSessionUser();
            editUserBtcModalStore.onFinish();
            editUserBtcModalStore.hide();
            snackStore.showSuccess('Btc address was udpated');
        } catch (ex) {
        }
    }

    return (
        <ModalWindow className = { 'EditUserBtcModal' } modalStore = { editUserBtcModalStore } >
            { editUserBtcModalStore.visible === true && (
                <>
                    <div className = { 'ModalTitleRow' } >
                        <div className = { 'H3 Bold' } >Update Btc Address</div>
                    </div>

                    <Input
                        label = { 'Your BTC Payout Address' }
                        placeholder={'bc1qxy...'}
                        value = { editUserBtcModalStore.bitcoinPayoutWalletAddress }
                        onChange = { editUserBtcModalStore.onChangeBitcoinPayoutWalletAddress }
                        inputValidation = { bitcoinPayoutWalletAddressValidation } />

                    <Actions className = { 'ModalActionsBottom' } layout={ActionsLayout.LAYOUT_COLUMN_FULL}>
                        <Button disabled = { editUserBtcModalStore.isBtcAddressChanged() === false } onClick={onClickSave}>Save Changes</Button>
                    </Actions>
                </>
            ) }
        </ModalWindow>
    )

}

export default inject((stores) => stores)(observer(EditUserBtcModal));
