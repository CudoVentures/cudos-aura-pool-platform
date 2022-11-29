import React from 'react'
import { useNavigate } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

import AppRoutes from '../../../app-routes/entities/AppRoutes';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import ChangePasswordModalStore from '../../../accounts/presentation/stores/ChangePasswordModalStore';

import Svg from '../../../../core/presentation/components/Svg';
import Actions from '../../../../core/presentation/components/Actions';
import Button from '../../../../core/presentation/components/Button';

import SvgAuraPoolLogo from '../../../../public/assets/vectors/aura-pool-logo.svg';
import '../styles/page-super-admin-header.css'

type Props = {
    accountSessionStore?: AccountSessionStore;
    changePasswordModalStore?: ChangePasswordModalStore;
}

function PageSuperAdminHeader({ accountSessionStore, changePasswordModalStore }: Props) {
    const navigate = useNavigate();

    function onClickLogo() {
        navigate(AppRoutes.HOME);
    }

    async function onClickLogout() {
        await accountSessionStore.logout();
        navigate(AppRoutes.HOME);
    }

    function onClickChangePassword() {
        changePasswordModalStore.showSignal();
    }

    return (
        <header className={'PageAdminHeader FlexRow FlexSplit'}>
            <div className={'LogoHeader FlexRow'}>
                <Svg className={'SVG IconLogoWithText Clickable'} svg={ SvgAuraPoolLogo } onClick = { onClickLogo } />
                <div className={'AdminPortalNav B2 SemiBold'}>Super Admin</div>
            </div>
            <Actions className = { 'StartRight' }>
                <Button onClick={onClickChangePassword}>Change Password</Button>
                <Button onClick={onClickLogout}>Logout</Button>
            </Actions>
        </header>
    )
}

export default inject((stores) => stores)(observer(PageSuperAdminHeader));
