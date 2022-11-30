import React, { useRef, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { useNavigate } from 'react-router-dom';

import AccountSessionStore from '../stores/AccountSessionStore';
import ValidationState from '../../../../core/presentation/stores/ValidationState';
import AlertStore from '../../../../core/presentation/stores/AlertStore';
import AppRoutes from '../../../app-routes/entities/AppRoutes';

import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';
import PageFooter from '../../../footer/presentation/components/PageFooter';
import PageAdminHeader from '../../../header/presentation/components/PageAdminHeader';
import Input from '../../../../core/presentation/components/Input';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import Actions, { ActionsLayout } from '../../../../core/presentation/components/Actions';
import Button, { ButtonType } from '../../../../core/presentation/components/Button';
import Svg from '../../../../core/presentation/components/Svg';
import AnimationContainer from '../../../../core/presentation/components/AnimationContainer';
import StyledContainer, { ContainerBackground, ContainerPadding } from '../../../../core/presentation/components/StyledContainer';

import '../styles/credit-account-settings.css';

type Props = {
    accountSessionStore?: AccountSessionStore;
    alertStore?: AlertStore;
}

function CreditAccountSettings({ accountSessionStore, alertStore }: Props) {
    const navigate = useNavigate();

    const validationStateEmail = useRef(new ValidationState()).current;
    const validationStateOwner = useRef(new ValidationState()).current;
    const validationStatePass = useRef(new ValidationState()).current;

    const accountEmailValidation = useRef(validationStateEmail.addEmailValidation('Invalid email')).current;
    const accountNameValidation = useRef(validationStateOwner.addEmptyValidation('Name can\'t be empty.')).current;
    const validationPass = useRef(validationStatePass.addPasswordValidation('Invalid password')).current;
    const validationConfirmPass = useRef(validationStatePass.addPasswordValidation('Invalid password')).current;
    const [validationFirstMatchPass, validationSecondMatchPass] = useRef(validationStatePass.addMatchStringsValidation('Passwords don\'t match.')).current;

    const self = useRef({
        accountEntity: accountSessionStore.accountEntity?.deepClone() || null,
    }).current;

    const [changedEmail, setChangedEmail] = useState(false);
    const [editEmail, setEditEmail] = useState(false);
    const [editOwner, setEditOwner] = useState(false);
    const [editPass, setEditPass] = useState(false);
    const [oldPass, setOldPass] = useState('');
    const [pass, setPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');

    function onClickEditEmail() {
        setEditEmail(true);
    }

    function onClickCancelEditEmail() {
        setEditEmail(false);
        setChangedEmail(false);
    }

    function onClickEditOwner() {
        setEditOwner(true);
    }

    function onClickCancelEditOwner() {
        setEditOwner(false);
    }

    function onClickEditPass() {
        setEditPass(true);
    }

    function onClickCancelEditPass() {
        setEditPass(false);
    }

    function onChangeEmail(value) {
        self.accountEntity.email = value;
    }

    function onChangeOwner(value) {
        self.accountEntity.name = value;
    }

    async function onClickChangeEmail() {
        if (validationStateEmail.getIsErrorPresent() === true) {
            validationStateEmail.setShowErrors(true);
            return;
        }

        await accountSessionStore.creditSessionAccount(self.accountEntity);
        setChangedEmail(true);
    }

    async function onClickChangeOwner() {
        if (validationStateOwner.getIsErrorPresent() === true) {
            validationStateOwner.setShowErrors(true);
            return;
        }

        await accountSessionStore.creditSessionAccount(self.accountEntity);
        setEditOwner(false);
    }

    async function onClickResendVerificationEmail() {
        await accountSessionStore.sendVerificationEmail();
        alertStore.show('Email was sent');
    }

    async function onClickChangePass() {
        try {
            await accountSessionStore.changePassword(oldPass, pass);
            alertStore.show('Your password has been changed. Please, login again.', async () => {
                await accountSessionStore.logout();
                navigate(AppRoutes.LOGIN);
            });
        } catch (e) {
            alertStore.show('Wrong old password');
        }
    }

    const accountEntity = accountSessionStore.accountEntity;
    const adminEntity = accountSessionStore.adminEntity;

    return (
        <PageLayoutComponent className = { 'CreditAccountSettings' }>

            <PageAdminHeader />

            <div className = { 'PageContent AppContent FlexColumn' } >
                <div className={'Header FlexRow'}>
                    <div className={'H2 Bold'}>Account Details</div>
                </div>
                <div className={'SettingsItem'}>
                    <div className={'SettingsName'}>Account Email</div>
                    <div className={'SettingsOptions'}>
                        <div className = { 'SettingsDisplay FlexRow' } >
                            <Input
                                gray = { true }
                                value={accountEntity?.email} />
                            <Actions>
                                <Button onClick={onClickEditEmail} disabled = { editEmail } >
                                    <Svg svg={BorderColorIcon} />
                                    Change
                                </Button>
                            </Actions>
                        </div>
                        <AnimationContainer className = { 'SettingsEdit' } active = { editEmail } >
                            { changedEmail === false ? (
                                <>
                                    <Input
                                        label = { 'Enter new email address' }
                                        inputValidation = { accountEmailValidation }
                                        value = { self.accountEntity?.email }
                                        onChange = { onChangeEmail } />
                                    <Actions layout = { ActionsLayout.LAYOUT_ROW_RIGHT } >
                                        <Button type = { ButtonType.TEXT_INLINE } onClick = { onClickCancelEditEmail } >Discard Changes</Button>
                                        <Button onClick = { onClickChangeEmail }>Save Changes</Button>
                                    </Actions>
                                </>
                            ) : (
                                <>
                                    <StyledContainer containerPadding = { ContainerPadding.PADDING_16 } containerBackground = { ContainerBackground.GRAY } >
                                        An email has been sent to you with a link to<br />
                                        verify your account.<br />
                                        Resend email if it doesn’t arrive in a minute.
                                    </StyledContainer>
                                    <Actions layout = { ActionsLayout.LAYOUT_ROW_RIGHT } >
                                        <Button onClick = { onClickResendVerificationEmail }>Resend</Button>
                                    </Actions>
                                </>
                            ) }

                        </AnimationContainer>
                    </div>
                </div>
                <div className={'SettingsItem'}>
                    <div className={'SettingsName'}>Account Owner</div>
                    <div className={'SettingsOptions'}>
                        <div className = { 'SettingsDisplay FlexRow' } >
                            <Input
                                gray = { true }
                                value={accountEntity.name} />
                            <Actions>
                                <Button onClick={onClickEditOwner} disabled = { editOwner }>
                                    <Svg svg={BorderColorIcon} />
                                    Change
                                </Button>
                            </Actions>
                        </div>
                        <AnimationContainer className = { 'SettingsEdit' } active = { editOwner } >
                            <Input
                                label = { 'Enter new account name' }
                                inputValidation = { accountNameValidation }
                                value = { self.accountEntity.name }
                                onChange = { onChangeOwner } />
                            <Actions layout = { ActionsLayout.LAYOUT_ROW_RIGHT } >
                                <Button type = { ButtonType.TEXT_INLINE } onClick = { onClickCancelEditOwner } >Discard Changes</Button>
                                <Button onClick = { onClickChangeOwner }>Save Changes</Button>
                            </Actions>
                        </AnimationContainer>
                    </div>
                </div>
                <div className={'SettingsItem'}>
                    <div className={'SettingsName'}>Password</div>
                    <div className={'SettingsOptions'}>
                        <div className = { 'SettingsDisplay FlexRow' } >
                            <Input
                                gray = { true }
                                value={'*****************'} />
                            <Actions>
                                <Button onClick = { onClickEditPass } disabled = { editPass }>
                                    <Svg svg={BorderColorIcon} />
                                    Change
                                </Button>
                            </Actions>
                        </div>
                        <AnimationContainer className = { 'SettingsEdit' } active = { editPass } >
                            <Input
                                label = { 'Current Password' }
                                value = { oldPass }
                                type = {'password'}
                                onChange = { setOldPass } />
                            <Input
                                label = { 'New Password' }
                                value = { pass }
                                type = {'password'}
                                inputValidation={[
                                    validationPass,
                                    validationFirstMatchPass,
                                ]}
                                onChange = { setPass } />
                            <Input
                                label = { 'Confirm Password' }
                                value = { confirmPass }
                                type = {'password'}
                                inputValidation={[
                                    validationConfirmPass,
                                    validationSecondMatchPass,
                                ]}
                                onChange = { setConfirmPass } />
                            <Actions layout = { ActionsLayout.LAYOUT_ROW_RIGHT } >
                                <Button type = { ButtonType.TEXT_INLINE } onClick = { onClickCancelEditPass } >Discard Changes</Button>
                                <Button onClick = { onClickChangePass } >Save Changes</Button>
                            </Actions>
                        </AnimationContainer>
                    </div>
                </div>
                <div className={'SettingsItem'}>
                    <div className={'SettingsName'}>Connected Wallet Address</div>
                    <div className={'SettingsOptions'}>
                        <div className = { 'SettingsDisplay FlexRow' } >
                            <Input
                                gray = { true }
                                value={adminEntity.cudosWalletAddress} />
                        </div>
                    </div>
                </div>
            </div>

            <PageFooter />

        </PageLayoutComponent>
    )

}

export default inject((stores) => stores)(observer(CreditAccountSettings));
