import React, { useRef } from 'react';
import { inject, observer } from 'mobx-react';

import MegaWalletSettingsModalStore from '../stores/MegaWalletSettingsModalStore';
import Input, { InputType } from '../../../../core/presentation/components/Input';
import ValidationState, { InputValidation } from '../../../../core/presentation/stores/ValidationState';
import ColumnLayout from '../../../../core/presentation/components/ColumnLayout';
import Actions, { ActionsLayout } from '../../../../core/presentation/components/Actions';
import ModalWindow from '../../../../core/presentation/components/ModalWindow';
import Button from '../../../../core/presentation/components/Button';

import '../styles/mega-wallet-settings-modal.css';
import { InputAdornment } from '@mui/material';

type Props = {
    megaWalletSettingsModalStore?: MegaWalletSettingsModalStore;
}

type SettingLayoutProps = {
    modalTitle: string;
    modalSubTitle?: string;
    label: string;
    inputType: InputType;
    inputValidation?: InputValidation[];
    megaWalletSettingsModalStore?: MegaWalletSettingsModalStore;
}

function MegaWalletSettingsModal({ megaWalletSettingsModalStore }: Props) {
    const validationState = useRef(new ValidationState()).current;
    const validationCudosAddress = useRef(validationState.addCudosAddressValidation('Invalid cudos address')).current;

    return (
        <ModalWindow
            className = { 'MegaWalletSettingsModal' }
            modalStore = { megaWalletSettingsModalStore } >
            {megaWalletSettingsModalStore.isSettingTypeAddress() === true && (
                <SettingLayout
                    modalTitle={'Update Wallet Address'}
                    label={'Wallet Address'}
                    inputType={InputType.TEXT}
                    inputValidation={[validationCudosAddress]}
                />
            )}
            {megaWalletSettingsModalStore.isSettingTypeGlobalRoyalties() === true && (
                <SettingLayout
                    modalTitle={'Change Global Roaylties'}
                    modalSubTitle={'Choose the amount you want to withdraw from your account and add the wallet address you want to send tokens to. (To be updated)'}
                    label={'Global Royalties %'}
                    inputType={InputType.REAL}
                />
            )}
            {megaWalletSettingsModalStore.isSettingTypeGlobalFees() === true && (
                <SettingLayout
                    modalTitle={'Change Global Fees'}
                    modalSubTitle={'Choose the amount you want to withdraw from your account and add the wallet address you want to send tokens to. (To be updated)'}
                    label={'Global Fees %'}
                    inputType={InputType.REAL}
                />
            )}
            {megaWalletSettingsModalStore.isSettingTypeResaleFees() === true && (
                <SettingLayout
                    modalTitle={'Change Resale Fees'}
                    modalSubTitle={'Choose the amount you want to withdraw from your account and add the wallet address you want to send tokens to. (To be updated)'}
                    label={'Resale Fees %'}
                    inputType={InputType.REAL}
                />
            )}
            {megaWalletSettingsModalStore.isSettingTypeFirstSaleFees() === true && (
                <SettingLayout
                    modalTitle={'Change First Sale Fees'}
                    modalSubTitle={'Choose the amount you want to withdraw from your account and add the wallet address you want to send tokens to. (To be updated)'}
                    label={'First Sale Fees %'}
                    inputType={InputType.REAL}
                />
            )}
        </ModalWindow>
    )

}

const SettingLayout = inject((stores) => stores)(observer(({
    modalTitle,
    modalSubTitle,
    label,
    inputType,
    inputValidation,
    megaWalletSettingsModalStore,
}: SettingLayoutProps) => <>
    <div className = { 'MegaWalletSettingsModalTitleCnt' } >
        <div className = { 'H3 ExtraBold' } >{modalTitle}</div>
        <div className = { 'B2 ColorNeutral060 '} >{modalSubTitle}</div>
    </div>
    <ColumnLayout>
        <Input
            label={`Current ${label}`}
            inputType={inputType}
            value={megaWalletSettingsModalStore.getCurrentValue()}
            inputValidation={inputValidation}
            gray={true}
            InputProps = {{
                endAdornment: <InputAdornment position="end"> % </InputAdornment>,
            }}/>
        <Input
            label={`New ${label}`}
            inputType={inputType}
            inputValidation={inputValidation}
            value={megaWalletSettingsModalStore.value}
            onChange={megaWalletSettingsModalStore.onInputChange}
            InputProps = {{
                endAdornment: <InputAdornment position="end"> % </InputAdornment>,
            }} />
        <Actions className = { 'SubmitButton' } layout = { ActionsLayout.LAYOUT_COLUMN_FULL }>
            <Button onClick={megaWalletSettingsModalStore.onSubmit} > Save Changes </Button>
        </Actions>
    </ColumnLayout>
</>));

export default inject((stores) => stores)(observer(MegaWalletSettingsModal));
