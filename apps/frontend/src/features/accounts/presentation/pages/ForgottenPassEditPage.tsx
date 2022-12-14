import React, { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

import AppRoutes from '../../../app-routes/entities/AppRoutes';
import AccountSessionStore from '../stores/AccountSessionStore';
import AlertStore from '../../../../core/presentation/stores/AlertStore';
import ValidationState from '../../../../core/presentation/stores/ValidationState';

import { InputAdornment } from '@mui/material';
import Input from '../../../../core/presentation/components/Input';
import Svg from '../../../../core/presentation/components/Svg';
import Button from '../../../../core/presentation/components/Button';
import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';
import PageFooter from '../../../footer/presentation/components/PageFooter';
import PageAdminHeader from '../../../header/presentation/components/PageAdminHeader';
import AuthBlockLayout from '../components/AuthBlockLayout';

import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import '../styles/page-forgotten-pass-edit.css';

type Props = {
    alertStore?: AlertStore;
    accountSessionStore?: AccountSessionStore;
}

function ForgottenPassEditPage({ accountSessionStore }: Props) {
    const { token } = useParams();

    const navigate = useNavigate();
    const validationState = useRef(new ValidationState()).current;
    const validationPass = useRef(validationState.addPasswordValidation('Invalid password')).current;
    const validationConfirmPass = useRef(validationState.addPasswordValidation('Invalid password')).current;
    const [validationFirstMatchPass, validationSecondMatchPass] = useRef(validationState.addMatchStringsValidation('Passwords don\'t match.')).current;

    const [pass, setPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [showUpdatedStep, setShowUpdatedStep] = useState(false);

    async function onClickSendNewPassword() {
        if (validationState.getIsErrorPresent() === true) {
            validationState.setShowErrors(true);
            return;
        }
        await accountSessionStore.editPassword(token, pass);
        setShowUpdatedStep(true);
    }

    function onClickBackToLogin() {
        navigate(AppRoutes.LOGIN);
    }

    function renderRequestStep() {
        if (showUpdatedStep === true) {
            return null;
        }

        return (
            <AuthBlockLayout
                title = { 'Set new password' }
                subtitle = { 'Check your email and update your password.' }
                content = { (
                    <>
                        <Input
                            label={'New Password'}
                            placeholder={'***************'}
                            type = { 'password' }
                            inputValidation={[
                                validationPass,
                                validationFirstMatchPass,
                            ]}
                            value={pass}
                            onChange={setPass} />
                        <Input
                            label={'Confirm Password'}
                            placeholder={'***************'}
                            type = { 'password' }
                            inputValidation={[
                                validationConfirmPass,
                                validationSecondMatchPass,
                            ]}
                            value={confirmPass}
                            onChange={setConfirmPass} />
                    </>
                ) }
                actions = { (
                    <Button onClick = { onClickSendNewPassword } >Update Password</Button>
                ) } />
        )
    }

    function renderResendStep() {
        if (showUpdatedStep === false) {
            return null;
        }

        return (
            <>
                <AuthBlockLayout
                    confirmationTitle = { 'Password was updated' }
                    confirmationTitleSvg = { CheckCircleIcon }
                    subtitle = { 'You successfully updated your password. Login to your account now.' }
                    actions = { (
                        <Button onClick = { onClickBackToLogin } > To Login </Button>
                    ) } />
            </>
        )
    }

    return (
        <PageLayoutComponent className = { 'PageForgottenPassEdit' }>

            <PageAdminHeader />

            <div className = { 'PageContent AppContent' } >

                { renderRequestStep() }

                { renderResendStep() }

            </div>

            <PageFooter />

        </PageLayoutComponent>
    )
}

export default inject((stores) => stores)(observer(ForgottenPassEditPage));
