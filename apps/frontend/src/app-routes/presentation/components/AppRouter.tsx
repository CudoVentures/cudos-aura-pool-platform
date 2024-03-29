import React, { lazy, useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

import AppRoutes from '../../entities/AppRoutes';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import KycStore from '../../../kyc/presentation/stores/KycStore';
import PresaleStore from '../PresaleStore';

import LazyPageLoading from '../../../core/presentation/components/LazyPageLoading';

import NotFoundPage from '../../../layout/presentation/pages/NotFoundPage';
import UiKitPage from '../../../ui-kit/presensation/components/UiKitPage';
import RewardsCalculatorPage from '../../../rewards-calculator/presentation/pages/RewardsCalculatorPage';
import MarketplacePage from '../../../layout/presentation/pages/MarketplacePage';
import ExploreNftsPage from '../../../nft/presentation/pages/ExploreNftsPage';
import ExploreCollectionsPage from '../../../collection/presentation/pages/ExploreCollectionsPage';
import ExploreMiningFarmsPage from '../../../mining-farm/presentation/pages/ExploreMiningFarmsPage';
import UserProfilePage from '../../../accounts/presentation/pages/UserProfilePage';
import ViewNftPage from '../../../nft/presentation/pages/ViewNftPage';
import CreditCollectionPage from '../../../collection/presentation/pages/CreditCollectionPage';
import CreditMiningFarmPage from '../../../mining-farm/presentation/pages/CreditMiningFarmPage';
import LoginPage from '../../../accounts/presentation/pages/LoginPage';
import RegisterPage from '../../../accounts/presentation/pages/RegisterPage';
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
import SuperAdminCollectionsPage from '../../../collection/presentation/pages/SuperAdminCollectionsPage';
import SuperAdminMiningFarmsPage from '../../../mining-farm/presentation/pages/SuperAdminMiningFarmsPage';
import SuperAdminAnalyticsPage from '../../../analytics/presentation/pages/SuperAdminAnalyticsPage';
import SuperAdminMegaWalletPage from '../../../accounts/presentation/pages/SuperAdminMegaWalletPage';
import SuperAdminDashboardPage from '../../../layout/presentation/pages/SuperAdminDashboardPage';
// import KycPage from '../../../kyc/presentation/pages/KycPage';
import TermsAndConditionsPage from '../../../info/presentation/pages/TermsAndConditionsPage';

import LoadingIndicator from '../../../core/presentation/components/LoadingIndicator';

import '../styles/app-router.css';

// const NotFoundPage = lazy(() => import('../../../layout/presentation/pages/NotFoundPage'));
// const UiKitPage = lazy(() => import('../../../ui-kit/presensation/components/UiKitPage'));
// const RewardsCalculatorPage = lazy(() => import('../../../rewards-calculator/presentation/pages/RewardsCalculatorPage'));
// const MarketplacePage = lazy(() => import('../../../layout/presentation/pages/MarketplacePage'));
// const ExploreNftsPage = lazy(() => import('../../../nft/presentation/pages/ExploreNftsPage'));
// const ExploreCollectionsPage = lazy(() => import('../../../collection/presentation/pages/ExploreCollectionsPage'));
// const ExploreMiningFarmsPage = lazy(() => import('../../../mining-farm/presentation/pages/ExploreMiningFarmsPage'));
// const UserProfilePage = lazy(() => import('../../../accounts/presentation/pages/UserProfilePage'));
// const ViewNftPage = lazy(() => import('../../../nft/presentation/pages/ViewNftPage'));
// const CreditCollectionPage = lazy(() => import('../../../collection/presentation/pages/CreditCollectionPage'));
// const CreditMiningFarmPage = lazy(() => import('../../../mining-farm/presentation/pages/CreditMiningFarmPage'));
// const LoginPage = lazy(() => import('../../../accounts/presentation/pages/LoginPage'));
// const RegisterPage = lazy(() => import('../../../accounts/presentation/pages/RegisterPage'));
// const CreditMiningFarmDetailsPage = lazy(() => import('../../../mining-farm/presentation/pages/CreditMiningFarmDetailsPage'));
// const CreditCollectionDetailsCreatePage = lazy(() => import('../../../collection/presentation/pages/CreditCollectionDetailsCreatePage'));
// const ForgottenPassRequestPage = lazy(() => import('../../../accounts/presentation/pages/ForgottenPassRequestPage'));
// const ForgottenPassEditPage = lazy(() => import('../../../accounts/presentation/pages/ForgottenPassEditPage'));
// const EmailVerificationRequestPage = lazy(() => import('../../../accounts/presentation/pages/EmailVerificationRequestPage'));
// const EmailVerificationConfirmationPage = lazy(() => import('../../../accounts/presentation/pages/EmailVerificationConfirmationPage'));
// const CreditAccountSettings = lazy(() => import('../../../accounts/presentation/pages/CreditAccountSettings'));
// const AnalyticsPage = lazy(() => import('../../../analytics/presentation/pages/AnalyticsPage'));
// const CreditCollectionDetailsAddNftsPage = lazy(() => import('../../../collection/presentation/pages/CreditCollectionDetailsAddNftsPage'));
// const CreditCollectionDetailsEditPage = lazy(() => import('../../../collection/presentation/pages/CreditCollectionDetailsEditPage'));
// const SuperAdminCollectionsPage = lazy(() => import('../../../collection/presentation/pages/SuperAdminCollectionsPage'));
// const SuperAdminMiningFarmsPage = lazy(() => import('../../../mining-farm/presentation/pages/SuperAdminMiningFarmsPage'));
// const SuperAdminAnalyticsPage = lazy(() => import('../../../analytics/presentation/pages/SuperAdminAnalyticsPage'));
// const SuperAdminMegaWalletPage = lazy(() => import('../../../accounts/presentation/pages/SuperAdminMegaWalletPage'));
// const SuperAdminDashboardPage = lazy(() => import('../../../layout/presentation/pages/SuperAdminDashboardPage'));
const KycPage = lazy(() => import('../../../kyc/presentation/pages/KycPage'));
// const TermsAndConditionsPage = lazy(() => import('../../../info/presentation/pages/TermsAndConditionsPage'));

type Props = {
    accountSessionStore?: AccountSessionStore,
    presaleStore?: PresaleStore
    kycStore?: KycStore
}

function AppRouter({ accountSessionStore, kycStore, presaleStore }: Props) {

    const location = useLocation();
    const [displayLocation, setDisplayLocation] = useState(location);
    const [transitionStage, setTransistionStage] = useState('PageTransitionIn');

    useEffect(() => {
        presaleStore.update();

        if (location !== displayLocation) {
            setTransistionStage('PageTransitionOut');
        }
    }, [location, displayLocation]);

    function onRouterTransitionEnd() {
        if (transitionStage === 'PageTransitionOut') {
            setTransistionStage('PageTransitionIn');
            setDisplayLocation(location);
            window.scrollTo(0, 0);
        }
    }

    function getIndexPage() {
        if (accountSessionStore.isLoggedIn() === true) {
            if (accountSessionStore.isEmailVerified() === false) {
                return <EmailVerificationRequestPage />
            }

            if (accountSessionStore.isAdmin() === true) {
                return <CreditMiningFarmPage />;
            }

            if (accountSessionStore.isSuperAdmin() === true) {
                return <SuperAdminDashboardPage />;
            }
        }

        return <MarketplacePage />;
    }

    function isInited() {
        return accountSessionStore.isInited() === true;
    }

    return (
        <div
            className={`AppRouter ${transitionStage}`}
            onAnimationEnd = { onRouterTransitionEnd } >

            { isInited() === false ? (
                <LoadingIndicator className = { 'LoadingIndicatorLoadingAccounts' } />
            ) : (
                <Routes location = { displayLocation } >
                    <Route index = { true } element = { getIndexPage() } />
                    <Route path = { '*' } element = { <NotFoundPage /> } />
                    <Route path = { AppRoutes.UI_KIT } element = { <UiKitPage /> } />
                    {/* <Route path = { AppRoutes.REWARDS_CALCULATOR } element = { <RewardsCalculatorPage /> } /> */}
                    <Route path = { AppRoutes.MARKETPLACE } element = { <MarketplacePage /> } />
                    <Route path = { `${AppRoutes.VIEW_NFT}/:nftId` } element = { <ViewNftPage /> } />
                    { presaleStore.isInPresale() === false && (
                        <>
                            <Route path = { AppRoutes.EXPLORE_NFTS } element = { <ExploreNftsPage /> } />
                            <Route path = { AppRoutes.EXPLORE_COLLECTIONS } element = { <ExploreCollectionsPage /> } />
                            <Route path = { AppRoutes.EXPLORE_MINING_FARMS } element = { <ExploreMiningFarmsPage /> } />
                            <Route path = { `${AppRoutes.CREDIT_COLLECTION}/:collectionId` } element = { <CreditCollectionPage /> } />
                            <Route path = { `${AppRoutes.CREDIT_MINING_FARM}/:farmId` } element = { <CreditMiningFarmPage /> } />
                        </>
                    ) }
                    {/* <Route path = { AppRoutes.TERMS_AND_CONDITIONS } element = { <TermsAndConditionsPage /> } /> */}

                    {/* Auth */}
                    <Route path = { AppRoutes.LOGIN } element = { <LoginPage /> } />
                    <Route path = { AppRoutes.REGISTER } element = { <RegisterPage /> } />
                    <Route path = { AppRoutes.FORGOTTEN_PASS_REQUEST } element = { <ForgottenPassRequestPage /> } />
                    <Route path = { `${AppRoutes.FORGOTTEN_PASS_EDIT}/:token` } element = { <ForgottenPassEditPage /> } />
                    <Route path = { AppRoutes.EMAIL_VERIFICATION_REQUEST } element = { <EmailVerificationRequestPage /> } />
                    <Route path = { AppRoutes.EMAIL_VERIFICATION_CONFIRMATION } element = { <EmailVerificationConfirmationPage /> } />

                    {/* profile */}
                    { accountSessionStore.isUser() === true && (
                        <>
                            <Route path = { AppRoutes.USER_PROFILE } element = { <UserProfilePage /> } />
                            <Route path = { AppRoutes.KYC } element = { <LazyPageLoading><KycPage /></LazyPageLoading> } />
                        </>
                    ) }

                    {/* admin */}
                    { accountSessionStore.isAdmin() === true && (
                        <>
                            <Route path = { AppRoutes.CREDIT_MINING_FARM_DETAILS } element = { <CreditMiningFarmDetailsPage /> } />
                            <Route path = { AppRoutes.CREDIT_ACCOUNT_SETTINGS } element = { <CreditAccountSettings /> } />
                            { accountSessionStore.hasApprovedMiningFarm() === true && (
                                <>
                                    <Route path = { AppRoutes.CREDIT_MINING_FARM } element = { <CreditMiningFarmPage /> } />
                                    <Route path = { `${AppRoutes.CREDIT_COLLECTION_DETAILS_ADD_NFTS}/:collectionId` } element = { <CreditCollectionDetailsAddNftsPage /> } />
                                    <Route path = { `${AppRoutes.CREDIT_COLLECTION_DETAILS_EDIT}/:collectionId` } element = { <CreditCollectionDetailsEditPage /> } />
                                    <Route path = { AppRoutes.CREDIT_COLLECTION_DETAILS_CREATE } element = { <CreditCollectionDetailsCreatePage /> } />
                                    <Route path = { AppRoutes.FARM_ANALYTICS } element = { <AnalyticsPage /> } />
                                </>
                            ) }
                            { presaleStore.isInPresale() === true && (
                                <>
                                    <Route path = { `${AppRoutes.CREDIT_COLLECTION}/:collectionId` } element = { <CreditCollectionPage /> } />
                                    <Route path = { `${AppRoutes.CREDIT_MINING_FARM}/:farmId` } element = { <CreditMiningFarmPage /> } />
                                </>
                            ) }
                        </>
                    )}

                    { accountSessionStore.isSuperAdmin() === true && (
                        <>
                            <Route path = { AppRoutes.SUPER_ADMIN_ANALYTICS } element = { <SuperAdminAnalyticsPage /> } />
                            <Route path = { AppRoutes.SUPER_ADMIN_MEGA_WALLET } element = { <SuperAdminMegaWalletPage /> } />
                            <Route path = { AppRoutes.SUPER_ADMIN_COLLECTIONS } element = { <SuperAdminCollectionsPage /> } />
                            <Route path = { AppRoutes.SUPER_ADMIN_MINING_FARMS } element = { <SuperAdminMiningFarmsPage /> } />

                            { presaleStore.isInPresale() === true && (
                                <>
                                    <Route path = { AppRoutes.EXPLORE_NFTS } element = { <ExploreNftsPage /> } />
                                    <Route path = { AppRoutes.EXPLORE_COLLECTIONS } element = { <ExploreCollectionsPage /> } />
                                    <Route path = { AppRoutes.EXPLORE_MINING_FARMS } element = { <ExploreMiningFarmsPage /> } />
                                    <Route path = { `${AppRoutes.CREDIT_COLLECTION}/:collectionId` } element = { <CreditCollectionPage /> } />
                                    <Route path = { `${AppRoutes.CREDIT_MINING_FARM}/:farmId` } element = { <CreditMiningFarmPage /> } />
                                </>
                            ) }
                        </>
                    ) }

                </Routes>
            ) }
        </div>
    )
}

export default inject((stores) => stores)(observer(AppRouter));
