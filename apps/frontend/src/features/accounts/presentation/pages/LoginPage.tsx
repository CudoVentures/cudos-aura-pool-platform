import React, { useState } from 'react';

import '../styles/page-login.css';
import { inject, observer } from 'mobx-react';
import Input, { InputType } from '../../../../core/presentation/components/Input';
import { InputAdornment } from '@mui/material';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import Svg from '../../../../core/presentation/components/Svg';
import Actions, { ACTIONS_HEIGHT, ACTIONS_LAYOUT } from '../../../../core/presentation/components/Actions';
import Button, { BUTTON_RADIUS } from '../../../../core/presentation/components/Button';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccountSessionStore from '../stores/AccountSessionStore';
import AppStore from '../../../../core/presentation/stores/AppStore';
import LoadingIndicator from '../../../../core/presentation/components/LoadingIndicator';
import S from '../../../../core/utilities/Main';
import AlertStore from '../../../../core/presentation/stores/AlertStore';
import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';
import PageHeader from '../../../header/presentation/components/PageHeader';
import PageFooter from '../../../footer/presentation/components/PageFooter';
import Box, { BoxWidth } from '../../../../core/presentation/components/Box';
import { useNavigate } from 'react-router-dom';
import AppRoutes from '../../../app-routes/entities/AppRoutes';

type Props = {
    alertStore?: AlertStore;
    accountSessionStore?: AccountSessionStore;
}

function LoginPage({ alertStore, accountSessionStore }: Props) {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [logging, setLogging] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    function onClickForgottenPassword() {

    }

    function onClickRegister() {
        navigate(AppRoutes.REGISTER);
    }

    function onClickShowPassword() {
        setShowPassword(!showPassword);
    }

    async function onClickLogin() {
        setLogging(true);
        try {
            await accountSessionStore.login(email, password, '', null);
            // TO DO: redirect to farm details
        } catch (e) {
            alertStore.show('Wrong username/password');
        }
        setLogging(false);
    }

    return (
        <PageLayoutComponent className = { 'PageLogin' }>

            <PageHeader />

            <div className = { 'PageContent AppContent' } >

                <Box boxWidth = { BoxWidth.SMALL } >
                    <div className={'Title H2 Bold'}>Log in</div>
                    <div className={'Subtitle'}>Fill your credentials in order to access your account</div>

                    <div className = { 'InputsCnt' } >
                        <Input
                            label={'Email'}
                            placeholder={'Email'}
                            InputProps={{
                                endAdornment: <InputAdornment position="end" >
                                    <Svg svg={AlternateEmailIcon}/>
                                </InputAdornment>,
                            }}
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
                            value={password}
                            onChange={setPassword}
                            type={showPassword === false ? 'password' : 'text'} />
                    </div>

                    <div className={'ForgottenPassword B2 SemiBold Clickable'} onClick={onClickForgottenPassword}>Forgotten Password?</div>

                    <Actions className = { 'LoginActions' } layout={ACTIONS_LAYOUT.LAYOUT_COLUMN_FULL} height={ACTIONS_HEIGHT.HEIGHT_48}>
                        <Button onClick={onClickLogin}>
                            {logging === true ? <LoadingIndicator /> : 'Login'}
                        </Button>
                    </Actions>

                    <div className={'BottomAction B2 Clickable'} onClick={onClickRegister}>
                        You don’t have account? <span className = { 'Bold' }>Request Admin Account</span>
                    </div>
                </Box>

            </div>

            <PageFooter />

        </PageLayoutComponent>
    )
}

export default inject((stores) => stores)(observer(LoginPage));
