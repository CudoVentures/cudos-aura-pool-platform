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
import LoadingIndicator from '../../../../core/presentation/components/LoadingIndicator';
import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';
import PageFooter from '../../../footer/presentation/components/PageFooter';
import PageAdminHeader from '../../../header/presentation/components/PageAdminHeader';
import AuthBlockLayout from '../components/AuthBlockLayout';

import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import '../styles/page-login.css';
import ValidationState from '../../../../core/presentation/stores/ValidationState';

type Props = {
    alertStore?: AlertStore;
    accountSessionStore?: AccountSessionStore;
}

function LoginPage({ alertStore, accountSessionStore }: Props) {
    const navigate = useNavigate();
    const validationState = useRef(new ValidationState()).current;
    const emailValidation = useRef(validationState.addEmailValidation('Invalid email')).current;
    const passwordValidation = useRef(validationState.addPasswordValidation('Invalid email')).current;

    const [email, setEmail] = useState('');
    const [logging, setLogging] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    function onClickForgottenPassword() {
        navigate(AppRoutes.FORGOTTEN_PASS_REQUEST);
    }

    function onClickRegister() {
        navigate(AppRoutes.REGISTER);
    }

    function onClickShowPassword() {
        setShowPassword(!showPassword);
    }

    async function onClickLogin() {
        if (validationState.getIsErrorPresent() === true) {
            validationState.setShowErrors(true);
            return;
        }

        setLogging(true);
        try {
            await accountSessionStore.login(email, password, '', null);
            navigate(AppRoutes.HOME);
        } catch (e) {
            alertStore.show('Wrong username/password');
        }
        setLogging(false);
    }

    return (
        <PageLayoutComponent className = { 'PageLogin' }>

            <PageAdminHeader />

            <div className = { 'PageContent AppContent' } >

                <AuthBlockLayout
                    title = { 'Log in' }
                    subtitle = { 'Fill your credentials in order to access your account' }
                    content = { (
                        <>
                            <Input
                                label={'Email'}
                                placeholder={'Email'}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end" >
                                        <Svg svg={AlternateEmailIcon}/>
                                    </InputAdornment>,
                                }}
                                inputValidation={emailValidation}
                                value={email}
                                onChange={setEmail} />
                            <Input
                                label={'Password'}
                                placeholder={'Password'}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end" >
                                            <Svg className={'Clickable'} svg={showPassword === false ? VisibilityOffIcon : VisibilityIcon} onClick={onClickShowPassword}/>
                                        </InputAdornment>
                                    ),
                                }}
                                inputValidation={passwordValidation}
                                value={password}
                                onChange={setPassword}
                                type={showPassword === false ? 'password' : 'text'} />
                        </>
                    ) }
                    subInputsAction = { (
                        <div className={'B2 SemiBold Clickable'} onClick={onClickForgottenPassword}>Forgotten Password?</div>
                    ) }
                    actions = { (
                        <>
                            <Button onClick={ logging === true ? null : onClickLogin } >
                                {logging === true ? <LoadingIndicator /> : 'Login'}
                            </Button>
                            <Button type = { ButtonType.TEXT_INLINE } onClick={ onClickRegister } >
                                <span className = { 'Regular' } > You don’t have account?</span>&nbsp;Request Admin Account
                            </Button>
                        </>
                    ) } />

            </div>

            <PageFooter />

        </PageLayoutComponent>
    )
}

export default inject((stores) => stores)(observer(LoginPage));
