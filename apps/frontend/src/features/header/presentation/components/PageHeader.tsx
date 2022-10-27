import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

import S from '../../../../../src/core/utilities/Main';
import AppRoutes from '../../../app-routes/entities/AppRoutes';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';

import Svg from '../../../../core/presentation/components/Svg';
import HeaderWallet from './HeaderWallet';

import SvgAuraPoolLogo from '../../../../public/assets/vectors/aura-pool-logo.svg';
import '../styles/page-header.css'

type Props = {
    accountSessionStore?: AccountSessionStore,
}

function PageHeader({ accountSessionStore }: Props) {
    const navigate = useNavigate();
    const location = useLocation();

    function onClickAddress() {
        navigate(AppRoutes.USER_PROFILE);
    }

    function onClickLogo() {
        navigate(AppRoutes.HOME);
    }

    function onClickMarketplace() {
        navigate(AppRoutes.MARKETPLACE);
    }

    function onClickRewardsCalculator() {
        navigate(AppRoutes.REWARDS_CALCULATOR);
    }

    function onClickAdminPortal() {
        navigate(AppRoutes.HOME);
    }

    return (
        <header className={'PageHeader FlexRow FlexSplit'}>
            <div className={'LogoHeader FlexRow'}>
                <Svg className={'SVG IconLogoWithText Clickable'} svg={ SvgAuraPoolLogo } onClick = { onClickLogo } />
            </div>

            <div className={'NavCnt FlexRow'}>
                <div className={`NavButton B1 SemiBold Clickable ${S.CSS.getActiveClassName(location.pathname === AppRoutes.MARKETPLACE)}`} onClick={onClickMarketplace}>Marketplace</div>
                <div className={`NavButton B1 SemiBold Clickable ${S.CSS.getActiveClassName(location.pathname === AppRoutes.REWARDS_CALCULATOR)}`} onClick={onClickRewardsCalculator}>Rewards Calculator</div>

                { accountSessionStore.isUser() === true && (
                    <div
                        className={`NavButton B1 SemiBold Clickable ${S.CSS.getActiveClassName(location.pathname === AppRoutes.USER_PROFILE)}`}
                        onClick={onClickAddress}>
                        Profile
                    </div>
                ) }

                { accountSessionStore.isAdmin() === true && (
                    <div
                        className={'NavButton B1 SemiBold Clickable'}
                        onClick={onClickAdminPortal}>
                        Admin Portal
                    </div>
                ) }

                <HeaderWallet />
            </div>
        </header>
    )
}

export default inject((stores) => stores)(observer(PageHeader));
