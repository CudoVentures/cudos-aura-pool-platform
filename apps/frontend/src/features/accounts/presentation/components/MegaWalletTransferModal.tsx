import React, { useRef } from 'react';
import { inject, observer } from 'mobx-react';

import Input, { InputType } from '../../../../core/presentation/components/Input';
import ValidationState, { InputValidation } from '../../../../core/presentation/stores/ValidationState';
import ColumnLayout from '../../../../core/presentation/components/ColumnLayout';
import Actions, { ActionsLayout } from '../../../../core/presentation/components/Actions';
import ModalWindow from '../../../../core/presentation/components/ModalWindow';
import Button from '../../../../core/presentation/components/Button';
import MegaWalletTransferModalStore from '../stores/MegaWalletTransferModalStore';
import BigNumber from 'bignumber.js';

type Props = {
    megaWalletTransferModalStore?: MegaWalletTransferModalStore;
}

function MegaWalletTransferModal({ megaWalletTransferModalStore }: Props) {
    const validationState = useRef(new ValidationState()).current;
    const validationCudosAddress = useRef(validationState.addCudosAddressValidation('Invalid cudos address')).current;
    const validationPositiveAmount = useRef(validationState.addValidation('Invalid amount', (value) => (new BigNumber(value)?.gt(0)))).current;
    const amountUnderBalance = useRef(validationState.addValidation('Amount bigger than balance', (value) => (new BigNumber(value)?.lte(megaWalletTransferModalStore.balance)))).current;

    return (
        <ModalWindow
            className = { 'ChangeValueModal' }
            modalStore = { megaWalletTransferModalStore } >
            <div className = { 'TitleCnt' } >
                <div className = { 'Title H2 Bold' } >{megaWalletTransferModalStore.isDeposit() === true ? 'Deposit Tokens' : 'Transfer Tokens'}</div>
            </div>
            <ColumnLayout>
                <Input
                    label={'Receiver'}
                    inputType={InputType.TEXT}
                    value={megaWalletTransferModalStore.destionationAddress}
                    inputValidation={validationCudosAddress}
                    gray={megaWalletTransferModalStore.isDeposit() === true}
                    onChange={megaWalletTransferModalStore.onAddressChange}/>
                <Input
                    label={'Amount'}
                    inputType={InputType.REAL}
                    value={megaWalletTransferModalStore.amount}
                    inputValidation={[validationPositiveAmount, amountUnderBalance]}
                    onChange={megaWalletTransferModalStore.onInputChange}
                    underline={true}
                >
                    <div className={'FlexRow SpaceBetween FlexGrow'}>
                        <div className={'B2'}>
                            Balance: <span className={'SemiBold'}>{megaWalletTransferModalStore.getBalanceFormatted()}</span>
                        </div>

                        <div className={'Clickable B2 Bold Primary60 '}
                            onClick={megaWalletTransferModalStore.onClickSetMax}
                        >MAX</div>
                    </div>
                </Input>
                <Actions className = { 'SubmitButton' } layout = { ActionsLayout.LAYOUT_COLUMN_FULL }>
                    <Button onClick={megaWalletTransferModalStore.onSubmit} > Submit </Button>
                </Actions>
            </ColumnLayout>
        </ModalWindow>
    )

}

export default inject((stores) => stores)(observer(MegaWalletTransferModal));
