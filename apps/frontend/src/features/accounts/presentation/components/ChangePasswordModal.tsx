import React, { useRef, useState } from 'react';
import { inject, observer } from 'mobx-react';

import ChangePasswordModalStore from '../stores/ChangePasswordModalStore';
import ValidationState from '../../../../core/presentation/stores/ValidationState';
import AlertStore from '../../../../core/presentation/stores/AlertStore';

import InputAdornment from '@mui/material/InputAdornment/InputAdornment';
import ModalWindow from '../../../../core/presentation/components/ModalWindow';
import Button from '../../../../core/presentation/components/Button';
import Input from '../../../../core/presentation/components/Input';
import Svg from '../../../../core/presentation/components/Svg';
import Actions, { ActionsLayout } from '../../../../core/presentation/components/Actions';
import ColumnLayout from '../../../../core/presentation/components/ColumnLayout';

import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import '../styles/change-password-modal.css';

type Props = {
    alertStore?: AlertStore;
    changePasswordModalStore?: ChangePasswordModalStore;
}

function ChangePasswordModal({ alertStore, changePasswordModalStore }: Props) {
    const validationState = useRef(new ValidationState()).current;

    const validationOldPass = useRef(validationState.addPasswordValidation('Invalid password')).current;
    const validationPass = useRef(validationState.addPasswordValidation('Invalid password')).current;
    const validationConfirmPass = useRef(validationState.addPasswordValidation('Invalid password')).current;
    const [validationFirstMatchPass, validationSecondMatchPass] = useRef(validationState.addMatchStringsValidation('Passwords don\'t match.')).current;

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);

    function onClickShowOldPassword() {
        setShowOldPassword(!showOldPassword);
    }

    function onClickShowPassword() {
        setShowPassword(!showPassword);
    }

    function onClickShowRepeatPassword() {
        setShowRepeatPassword(!showRepeatPassword);
    }

    async function onClickChangePassword() {
        try {
            await changePasswordModalStore.changePassword();
        } catch (e) {
            alertStore.show('Wrong old password');
        }
    }

    return (
        <ModalWindow
            className = { 'ChangePasswordModal' }
            modalStore = { changePasswordModalStore } >
            <div className = { 'TitleCnt' } >
                <div className = { 'Title H2 Bold' } >Change Password</div>
                { changePasswordModalStore.shouldDisplayChangeInitialPasswordInfo() === true && (
                    <div className = 'SubTitle' >You are using your default password. It is highly recommended to change your password for security reasons.</div>
                ) }
            </div>
            <ColumnLayout>
                <Input
                    label={'Old Password'}
                    placeholder={'***************'}
                    InputProps={{
                        endAdornment: <InputAdornment position="end" >
                            <Svg className={'Clickable'} svg={showOldPassword === false ? VisibilityOffIcon : VisibilityIcon} onClick={onClickShowOldPassword}/>
                        </InputAdornment>,
                    }}
                    value={changePasswordModalStore.oldPassword}
                    inputValidation={[
                        validationOldPass,
                    ]}
                    onChange={changePasswordModalStore.setOldPassword}
                    type={showOldPassword === false ? 'password' : 'text'} />
                <Input
                    label={'Password'}
                    placeholder={'***************'}
                    InputProps={{
                        endAdornment: <InputAdornment position="end" >
                            <Svg className={'Clickable'} svg={showPassword === false ? VisibilityOffIcon : VisibilityIcon} onClick={onClickShowPassword}/>
                        </InputAdornment>,
                    }}
                    value={changePasswordModalStore.newPassword}
                    inputValidation={[
                        validationPass,
                        validationFirstMatchPass,
                    ]}
                    onChange={changePasswordModalStore.setNewPassword}
                    type={showPassword === false ? 'password' : 'text'} />
                <Input
                    label={'Repeat Password'}
                    placeholder={'***************'}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">
                            <Svg className={'Clickable'} svg={showRepeatPassword === false ? VisibilityOffIcon : VisibilityIcon} onClick={onClickShowRepeatPassword}/>
                        </InputAdornment>,
                    }}
                    inputValidation={[
                        validationConfirmPass,
                        validationSecondMatchPass,
                    ]}
                    value={changePasswordModalStore.repeatNewPassword}
                    onChange={changePasswordModalStore.setRepeatNewPassword}
                    type={showRepeatPassword === false ? 'password' : 'text'} />
            </ColumnLayout>
            <Actions className = { 'ChangePasswordActions' } layout = { ActionsLayout.LAYOUT_COLUMN_FULL }>
                <Button onClick={onClickChangePassword} > Change Password </Button>
            </Actions>
        </ModalWindow>
    )

}

export default inject((stores) => stores)(observer(ChangePasswordModal));
