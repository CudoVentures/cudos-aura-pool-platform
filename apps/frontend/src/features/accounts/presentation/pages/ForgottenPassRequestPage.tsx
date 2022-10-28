import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

import AppRoutes from '../../../app-routes/entities/AppRoutes';
import AccountSessionStore from '../stores/AccountSessionStore';
import AlertStore from '../../../../core/presentation/stores/AlertStore';

import { InputAdornment } from '@mui/material';
import Input from '../../../../core/presentation/components/Input';
import Svg from '../../../../core/presentation/components/Svg';
import Button, { ButtonType } from '../../../../core/presentation/components/Button';
import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';
import PageFooter from '../../../footer/presentation/components/PageFooter';
import PageAdminHeader from '../../../header/presentation/components/PageAdminHeader';
import LoadingIndicator from '../../../../core/presentation/components/LoadingIndicator';
import AuthBlockLayout from '../components/AuthBlockLayout';

import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import '../styles/page-forgotten-pass-request.css';
import ValidationState from '../../../../core/presentation/stores/ValidationState';

type Props = {
    alertStore?: AlertStore;
    accountSessionStore?: AccountSessionStore;
}

function ForgottenPassRequestPage({ alertStore, accountSessionStore }: Props) {
    const navigate = useNavigate();
    const validationState = useRef(new ValidationState()).current;
    const requestEmailValidation = useRef(validationState.addEmailValidation('Invalid email')).current;
    const resendEmailValidation = useRef(validationState.addEmailValidation('Invalid email')).current;

    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [showResendStep, setShowResendStep] = useState(false);

    async function onClickSendNewPassword() {
        if (validationState.getIsErrorPresent() === true) {
            validationState.setShowErrors(true);
            return;
        }
        setLoading(true);
        await accountSessionStore.forgottenPassword(email);
        setShowResendStep(true);
        setLoading(false);
    }

    function onClickBackToLogin() {
        navigate(AppRoutes.LOGIN);
    }

    async function onClickResend() {
        if (validationState.getIsErrorPresent() === true) {
            validationState.setShowErrors(true);
            return;
        }

        setLoading(true);
        await accountSessionStore.forgottenPassword(email);
        alertStore.show('We have resent the email.');
        setLoading(false);
    }

    function renderRequestStep() {
        if (showResendStep === true) {
            return null;
        }

        return (
            <AuthBlockLayout
                title = { 'Forgotten Password' }
                subtitle = { 'Check your email and update your password.' }
                content = { (
                    <Input
                        label={'Email'}
                        placeholder={'Email'}
                        InputProps={{
                            endAdornment: <InputAdornment position="end" >
                                <Svg svg={AlternateEmailIcon}/>
                            </InputAdornment>,
                        }}
                        inputValidation={requestEmailValidation}
                        value={email}
                        onChange={setEmail} />
                ) }
                actions = { (
                    <>
                        <Button onClick = { loading === true ? null : onClickSendNewPassword } >
                            {loading === true ? <LoadingIndicator /> : 'Send new password'}
                        </Button>
                        <Button type = { ButtonType.TEXT_INLINE } onClick = { onClickBackToLogin } >
                            Go back to Login
                        </Button>
                    </>
                ) } />
        )
    }

    function renderResendStep() {
        if (showResendStep === false) {
            return null;
        }

        return (
            <>
                <AuthBlockLayout
                    confirmationTitle = { 'Check your email' }
                    confirmationTitleSvg = { MailOutlineIcon }
                    subtitle = { 'We send you link where you can set your new password' }
                    content = { (
                        <Input
                            label={'Email'}
                            placeholder={'Email'}
                            InputProps={{
                                endAdornment: <InputAdornment position="end" >
                                    <Svg svg={AlternateEmailIcon}/>
                                </InputAdornment>,
                            }}
                            inputValidation={resendEmailValidation}
                            gray = { true }
                            value={email}/>
                    ) }
                    actions = { (
                        <Button type = { ButtonType.TEXT_INLINE } onClick = { loading === true ? null : onClickResend } >
                            {loading === true ? <LoadingIndicator /> : 'Resend Link'}
                        </Button>
                    ) } />
            </>
        )
    }

    return (
        <PageLayoutComponent className = { 'PageForgottenPassRequest' }>

            <PageAdminHeader />

            <div className = { 'PageContent AppContent' } >

                { renderRequestStep() }

                { renderResendStep() }

            </div>

            <PageFooter />

        </PageLayoutComponent>
    )
}

export default inject((stores) => stores)(observer(ForgottenPassRequestPage));
