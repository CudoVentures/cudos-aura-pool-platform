import React, { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

import AppRoutes from '../../entities/AppRoutes';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';

import NotFoundPage from '../../../not-found/presensation/components/NotFoundPage';
import UiKitPage from '../../../ui-kit/presensation/components/UiKitPage';
import RewardsCalculatorPage from '../../../rewards-calculator/presentation/pages/RewardsCalculatorPage';
import MarketplacePage from '../../../collection/presentation/pages/MarketplacePage';
import ExploreNftsPage from '../../../nft/presentation/pages/ExploreNftsPage';
import ExploreCollectionsPage from '../../../collection/presentation/pages/ExploreCollectionsPage';
import ExploreMiningFarmsPage from '../../../mining-farm/presentation/pages/ExploreMiningFarmsPage';
import UserProfilePage from '../../../accounts/presentation/pages/UserProfilePage';
import ViewNftPage from '../../../nft/presentation/pages/ViewNftPage';
import CreditCollectionPage from '../../../collection/presentation/pages/CreditCollectionPage';
import CreditMiningFarmPage from '../../../mining-farm/presentation/pages/CreditMiningFarmPage';
import LoginPage from '../../../accounts/presentation/pages/LoginPage';
import RegisterPage from '../../../accounts/presentation/pages/RegisterPage';
import SuperAdminApprovePage from '../../../accounts/presentation/pages/SuperAdminApprovePage';
import BitcoinConfirmPage from '../../../accounts/presentation/pages/BitcoinConfirmPage';
import CreditMiningFarmDetailsPage from '../../../mining-farm/presentation/pages/CreditMiningFarmDetailsPage';
import CreditCollectionDetailsCreatePage from '../../../collection/presentation/pages/CreditCollectionDetailsCreatePage';
import ForgottenPassRequestPage from '../../../accounts/presentation/pages/ForgottenPassRequestPage';
import ForgottenPassEditPage from '../../../accounts/presentation/pages/ForgottenPassEditPage';
import EmailVerificationRequestPage from '../../../accounts/presentation/pages/EmailVerificationRequestPage';
import EmailVerificationConfirmationPage from '../../../accounts/presentation/pages/EmailVerificationConfirmationPage';
import CreditAccountSettings from '../../../accounts/presentation/pages/CreditAccountSettings';
import AnalyticsPage from '../../../analytics/presentation/pages/AnalyticsPage';
import CreditCollectionDetailsAddNftsPage from '../../../collection/presentation/pages/CreditCollectionDetailsAddNftsPage';
import CreditCollectionDetailsEditPage from '../../../collection/presentation/pages/CreditCollectionDetailsEditPage';

import LoadingIndicator from '../../../../core/presentation/components/LoadingIndicator';

import '../styles/app-router.css';

type Props = {
    accountSessionStore?: AccountSessionStore,
}

function AppRouter({ accountSessionStore }: Props) {

    const location = useLocation();
    const [displayLocation, setDisplayLocation] = useState(location);
    const [transitionStage, setTransistionStage] = useState('PageTransitionIn');

    useEffect(() => {
        if (location !== displayLocation) {
            setTransistionStage('PageTransitionOut');
        }
    }, [location, displayLocation]);

    function onRouterTransitionEnd() {
        if (transitionStage === 'PageTransitionOut') {
            setTransistionStage('PageTransitionIn');
            setDisplayLocation(location);
        }
    }

    function getIndexPage() {
        if (accountSessionStore.isLoggedIn() === true) {
            if (accountSessionStore.isEmailVerified() === false) {
                return <EmailVerificationRequestPage />
            }

            if (accountSessionStore.isAdmin() === true) {
                const userEntity = accountSessionStore.userEntity;
                if (userEntity.isBitcointAddressConfirmed() === false) {
                    return <BitcoinConfirmPage />
                }

                // if (accountSessionStore.hasApprovedMiningFarm() === false) {
                //     return <CreditMiningFarmDetailsPage />
                // }

                return <CreditMiningFarmPage />;
            }

            if (accountSessionStore.isSuperAdmin() === true) {
                return <SuperAdminApprovePage />;
            }
        }

        return <MarketplacePage />;
    }

    return (
        <div
            className={`AppRouter ${transitionStage}`}
            onAnimationEnd = { onRouterTransitionEnd } >

            { accountSessionStore.isInited() === false && (
                <LoadingIndicator />
            ) }

            { accountSessionStore.isInited() === true && (
                <Routes location = { displayLocation } >
                    <Route index = { true } element = { getIndexPage() } />
                    <Route path = { '*' } element = { <NotFoundPage /> } />
                    <Route path = { AppRoutes.UI_KIT } element = { <UiKitPage /> } />
                    <Route path = { AppRoutes.REWARDS_CALCULATOR } element = { <RewardsCalculatorPage /> } />
                    <Route path = { AppRoutes.MARKETPLACE } element = { <MarketplacePage /> } />
                    <Route path = { AppRoutes.EXPLORE_NFTS } element = { <ExploreNftsPage /> } />
                    <Route path = { AppRoutes.EXPLORE_COLLECTIONS } element = { <ExploreCollectionsPage /> } />
                    <Route path = { AppRoutes.EXPLORE_MINING_FARMS } element = { <ExploreMiningFarmsPage /> } />
                    <Route path = { `${AppRoutes.VIEW_NFT}/:nftId` } element = { <ViewNftPage /> } />
                    <Route path = { `${AppRoutes.CREDIT_COLLECTION}/:collectionId` } element = { <CreditCollectionPage /> } />
                    <Route path = { `${AppRoutes.CREDIT_MINING_FARM}/:farmId` } element = { <CreditMiningFarmPage /> } />

                    {/* Auth */}
                    <Route path = { AppRoutes.LOGIN } element = { <LoginPage /> } />
                    <Route path = { AppRoutes.REGISTER } element = { <RegisterPage /> } />
                    <Route path = { AppRoutes.FORGOTTEN_PASS_REQUEST } element = { <ForgottenPassRequestPage /> } />
                    <Route path = { AppRoutes.FORGOTTEN_PASS_EDIT } element = { <ForgottenPassEditPage /> } />
                    <Route path = { AppRoutes.EMAIL_VERIFICATION_REQUEST } element = { <EmailVerificationRequestPage /> } />
                    <Route path = { AppRoutes.EMAIL_VERIFICATION_CONFIRMATION } element = { <EmailVerificationConfirmationPage /> } />

                    {/* profile */}
                    { accountSessionStore.isUser() === true && (
                        <Route path = { AppRoutes.USER_PROFILE } element = { <UserProfilePage /> } />
                    ) }

                    {/* admin */}
                    { accountSessionStore.isAdmin() === true && (
                        <>
                            <Route path = { AppRoutes.CREDIT_MINING_FARM_DETAILS } element = { <CreditMiningFarmDetailsPage /> } />
                            <Route path = { AppRoutes.CREDIT_ACCOUNT_SETTINGS } element = { <CreditAccountSettings /> } />
                        </>
                    )}

                    { accountSessionStore.isAdmin() === true && accountSessionStore.hasApprovedMiningFarm() === true && (
                        <>
                            <Route path = { AppRoutes.CREDIT_MINING_FARM } element = { <CreditMiningFarmPage /> } />
                            <Route path = { `${AppRoutes.CREDIT_COLLECTION_DETAILS_ADD_NFTS}/:collectionId` } element = { <CreditCollectionDetailsAddNftsPage /> } />
                            <Route path = { `${AppRoutes.CREDIT_COLLECTION_DETAILS_EDIT}/:collectionId` } element = { <CreditCollectionDetailsEditPage /> } />
                            <Route path = { AppRoutes.CREDIT_COLLECTION_DETAILS_CREATE } element = { <CreditCollectionDetailsCreatePage /> } />
                            <Route path = { AppRoutes.FARM_ANALYTICS } element = { <AnalyticsPage /> } />
                        </>
                    ) }
                </Routes>
            ) }
        </div>
    )
}

export default inject((stores) => stores)(observer(AppRouter));
