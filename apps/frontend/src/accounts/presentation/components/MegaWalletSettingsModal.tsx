import React, { useRef } from 'react';
import { inject, observer } from 'mobx-react';

import InputAdornment from '@mui/material/InputAdornment/InputAdornment';
import MegaWalletSettingsModalStore from '../stores/MegaWalletSettingsModalStore';
import Input, { InputType } from '../../../core/presentation/components/Input';
import ValidationState, { InputValidation } from '../../../core/presentation/stores/ValidationState';
import ColumnLayout from '../../../core/presentation/components/ColumnLayout';
import Actions, { ActionsLayout } from '../../../core/presentation/components/Actions';
import ModalWindow from '../../../core/presentation/components/ModalWindow';
import Button from '../../../core/presentation/components/Button';
import TextWithTooltip from '../../../core/presentation/components/TextWithTooltip';

import '../styles/mega-wallet-settings-modal.css';

type Props = {
    megaWalletSettingsModalStore?: MegaWalletSettingsModalStore;
}

type SettingLayoutProps = {
    modalTitle: string;
    modalSubTitle?: string;
    label: string;
    inputType: InputType;
    validationState?: ValidationState;
    inputValidation?: InputValidation[];
    megaWalletSettingsModalStore?: MegaWalletSettingsModalStore;
}

function MegaWalletSettingsModal({ megaWalletSettingsModalStore }: Props) {
    const validationStateCudosAddress = useRef(new ValidationState()).current;
    const validationCudosAddress = useRef(validationStateCudosAddress.addCudosAddressValidation('Invalid cudos address')).current;

    const validationStateNotEmpty = useRef(new ValidationState()).current;
    const validationNotEmpty = useRef(validationStateNotEmpty.addEmptyValidation('Must be a value between 0 and 10 inclusive')).current;

    return (
        <ModalWindow
            className = { 'MegaWalletSettingsModal' }
            modalStore = { megaWalletSettingsModalStore } >
            {megaWalletSettingsModalStore.isSettingTypeAddress() === true && (
                <SettingLayout
                    modalTitle={'Update Wallet Address'}
                    label={'Wallet Address'}
                    inputType={InputType.TEXT}
                    validationState = { validationStateCudosAddress }
                    inputValidation={ [validationCudosAddress] }
                />
            )}
            {megaWalletSettingsModalStore.isSettingTypeGlobalRoyalties() === true && (
                <SettingLayout
                    modalTitle={'Change Global Roaylties'}
                    modalSubTitle={'Choose the amount you want to withdraw from your account and add the wallet address you want to send tokens to. (To be updated)'}
                    label={'Global Royalties %'}
                    inputType={InputType.REAL}
                    validationState = { validationStateNotEmpty }
                    inputValidation={ [validationNotEmpty] }
                />
            )}
            {megaWalletSettingsModalStore.isSettingTypeGlobalFees() === true && (
                <SettingLayout
                    modalTitle={'Change Pool Fee'}
                    modalSubTitle={'Choose the amount you want to withdraw from your account and add the wallet address you want to send tokens to. (To be updated)'}
                    label={'Pool Fee %'}
                    inputType={InputType.REAL}
                    validationState = { validationStateNotEmpty }
                    inputValidation={ [validationNotEmpty] }
                />
            )}
            {megaWalletSettingsModalStore.isSettingTypeResaleFees() === true && (
                <SettingLayout
                    modalTitle={'Change Resale Fee'}
                    modalSubTitle={'Choose the amount you want to withdraw from your account and add the wallet address you want to send tokens to. (To be updated)'}
                    label={'Resale Fee %'}
                    inputType={InputType.REAL}
                    validationState = { validationStateNotEmpty }
                    inputValidation={ [validationNotEmpty] }
                />
            )}
            {megaWalletSettingsModalStore.isSettingTypeFirstSaleFees() === true && (
                <SettingLayout
                    modalTitle={'Change First Sale Fee'}
                    modalSubTitle={'Choose the amount you want to withdraw from your account and add the wallet address you want to send tokens to. (To be updated)'}
                    label={'First Sale Fee %'}
                    inputType={InputType.REAL}
                    validationState = { validationStateNotEmpty }
                    inputValidation={ [validationNotEmpty] }
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
    validationState,
    inputValidation,
    megaWalletSettingsModalStore,
}: SettingLayoutProps) => {
    function onSubmit() {
        if (validationState.getIsErrorPresent() === true) {
            validationState.setShowErrors(true);
            return;
        }

        megaWalletSettingsModalStore.onSubmit();
    }

    return (
        <>
            <div className = { 'MegaWalletSettingsModalTitleCnt' } >
                <div className = { 'H3 ExtraBold' } >{modalTitle}</div>
                <div className = { 'B2 ColorNeutral060 '} >{modalSubTitle}</div>
            </div>
            <ColumnLayout>
                <Input
                    label={`Current ${label}`}
                    inputType={inputType}
                    value={megaWalletSettingsModalStore.getCurrentValue()}
                    gray={true}
                    InputProps = {{
                        endAdornment: <InputAdornment position="end"> % </InputAdornment>,
                    }}/>
                <Input
                    label={<TextWithTooltip text={`New ${label}`} tooltipText={'Max 10%'} />}
                    inputType={inputType}
                    decimalLength={2}
                    inputValidation={inputValidation}
                    value={megaWalletSettingsModalStore.value}
                    onChange={megaWalletSettingsModalStore.onInputChange}
                    InputProps = {{
                        endAdornment: <InputAdornment position="end"> % </InputAdornment>,
                    }} />
                <Actions className = { 'SubmitButton' } layout = { ActionsLayout.LAYOUT_COLUMN_FULL }>
                    <Button onClick={ onSubmit } > Save Changes </Button>
                </Actions>
            </ColumnLayout>
        </>
    )
}));

export default inject((stores) => stores)(observer(MegaWalletSettingsModal));
