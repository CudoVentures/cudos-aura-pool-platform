import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

import S from '../../../../../src/core/utilities/Main';
import AppRoutes from '../../../app-routes/entities/AppRoutes';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';

import Svg from '../../../../core/presentation/components/Svg';
import HeaderWallet from './HeaderWallet';

import SvgAuraPoolLogo from '../../../../public/assets/vectors/aura-pool-logo.svg';
import '../styles/page-admin-header.css'
import Actions from '../../../../core/presentation/components/Actions';
import Button from '../../../../core/presentation/components/Button';

type Props = {
    accountSessionStore?: AccountSessionStore;
};

function PageAdminHeader({ accountSessionStore }: Props) {

    const navigate = useNavigate();
    const location = useLocation();

    function onClickLogo() {
        navigate(AppRoutes.HOME);
    }

    function onClickMarketplace() {
        navigate(AppRoutes.MARKETPLACE);
    }

    function onClickRewardsCalculator() {
        navigate(AppRoutes.REWARDS_CALCULATOR);
    }

    function onClickAnalytics() {
        navigate(AppRoutes.FARM_ANALYTICS);
    }

    function onClickCreditMiningFarm() {
        navigate(AppRoutes.HOME);
    }

    async function onClickLogout() {
        await accountSessionStore.logout();
        navigate(AppRoutes.HOME);
    }

    return (
        <header className={'PageAdminHeader FlexRow FlexSplit'}>
            <div className={'LogoHeader FlexRow'}>
                <Svg className={'SVG IconLogoWithText Clickable'} svg={ SvgAuraPoolLogo } onClick = { onClickLogo } />
                <div className={'AdminPortalNav B2 SemiBold'}>Admin Portal</div>
            </div>

            <div className={'NavCnt FlexRow'}>
                <div className={`NavButton B1 SemiBold Clickable ${S.CSS.getActiveClassName(location.pathname === AppRoutes.MARKETPLACE)}`} onClick={onClickMarketplace}>Marketplace</div>
                <div className={`NavButton B1 SemiBold Clickable ${S.CSS.getActiveClassName(location.pathname === AppRoutes.REWARDS_CALCULATOR)}`} onClick={onClickRewardsCalculator}>Rewards Calculator</div>

                { accountSessionStore.isAdmin() === true && (
                    <>
                        <div className={`NavButton B1 SemiBold Clickable ${S.CSS.getActiveClassName(location.pathname === AppRoutes.CREDIT_MINING_FARM)}`} onClick={onClickCreditMiningFarm}>Farm Profile</div>
                        <div className={`NavButton B1 SemiBold Clickable ${S.CSS.getActiveClassName(location.pathname === AppRoutes.FARM_ANALYTICS)}`} onClick={onClickAnalytics}>Analytics</div>
                        <HeaderWallet />
                    </>
                ) }

                <Actions>
                    <Button onClick={onClickLogout}>Logout</Button>
                </Actions>
            </div>
        </header>
    )
}

export default inject((stores) => stores)(observer(PageAdminHeader));
