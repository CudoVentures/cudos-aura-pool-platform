import React, { useEffect, StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'mobx-react';

import S from './core/utilities/Main';

import AppStore from './core/presentation/stores/AppStore';

import AppRouter from './app-routes/presentation/components/AppRouter';
import AlertStore from './core/presentation/stores/AlertStore';
import RewardsCalculatorStore from './rewards-calculator/presentation/stores/RewardsCalculatorStore';
import MarketplacePageStore from './layout/presentation/stores/MarketplacePageStore';
import ExampleModalStore from './ui-kit/presensation/stores/ExampleModalStore';
import ViewNftPageStore from './nft/presentation/stores/ViewNftPageStore';
import CreditCollectionPageStore from './collection/presentation/stores/CreditCollectionPageStore';
import CreditMiningFarmPageStore from './mining-farm/presentation/stores/CreditMiningFarmPageStore';
import WalletStore from './ledger/presentation/stores/WalletStore';
import BuyNftModalStore from './nft/presentation/stores/BuyNftModalStore';
import ResellNftModalStore from './nft/presentation/stores/ResellNftModalStore';
import StorageHelper from './core/helpers/StorageHelper';
import BitcoinStore from './bitcoin-data/presentation/stores/BitcoinStore';
import CudosStore from './cudos-data/presentation/stores/CudosStore';
import UserProfilePageStore from './accounts/presentation/stores/UserProfilePageStore';
import AccountSessionStore from './accounts/presentation/stores/AccountSessionStore';
import CategoriesStore from './collection/presentation/stores/CategoriesStore';
import ExploreCollectionsPageStore from './collection/presentation/stores/ExploreCollectionsPageStore';
import ExploreMiningFarmsPageStore from './mining-farm/presentation/stores/ExploreMiningFarmsPageStore';
import ExploreNftsPageStore from './nft/presentation/stores/ExploreNftsPageStore';
import EditMiningFarmModalStore from './mining-farm/presentation/stores/EditMiningFarmModalStore';
import CreditMiningFarmDetailsPageStore from './mining-farm/presentation/stores/CreditMiningFarmDetailsPageStore';
import CreditCollectionStore from './collection/presentation/stores/CreditCollectionStore';
import CreditCollectionSuccessModalStore from './collection/presentation/stores/CreditCollectionSuccessModalStore';
import AnalyticsPageStore from './analytics/presentation/stores/AnalyticsPageStore';
import AccountApiRepo from './accounts/data/repo/AccountApiRepo';
import MiningFarmApiRepo from './mining-farm/data/repo/MiningFarmApiRepo';
import CollectionApiRepo from './collection/data/repo/CollectionApiRepo';
import NftApiRepo from './nft/data/repo/NftApiRepo';
import SettingsApiRepo from './general/data/repo/SettingsApiRepo';
import ViewCollectionModalStore from './collection/presentation/stores/ViewCollectionModalStore';
import ViewMiningFarmModalStore from './mining-farm/presentation/stores/ViewMiningFarmModalStore';
import BitcoinApiRepo from './bitcoin-data/data/repo/BitcoinApiRepo';
import CudosApiRepo from './cudos-data/data/repo/CudosApiRepo';
import ChangePasswordModalStore from './accounts/presentation/stores/ChangePasswordModalStore';
import WalletSelectModalStore from './layout/presentation/stores/WalletSelectModalStore';
import VisitorApiRepo from './visitor/data/repos/VisitorApiRepo';
import VisitorStore from './visitor/presentation/stores/VisitorStore';
import StatisticsApiRepo from './analytics/data/repo/StatisticsApiRepo';
import SuperAdminDashboardPageStore from './layout/presentation/stores/SuperAdminDashboardPageStore';
import QueuedCollectionsStore from './collection/presentation/stores/QueuedCollectionsStore';
import QueuedMiningFarmsStore from './mining-farm/presentation/stores/QueuedMiningFarmsStore';
import SuperAdminMegaWalletPageStore from './accounts/presentation/stores/SuperAdminMegaWalletPageStore';
import ValueChangeModalStore from './core/presentation/stores/ValueChangeModalStore';
import WalletApiRepo from './ledger/data/repo/WalletApiRepo';
import SnackStore from './core/presentation/stores/SnackStore';
import MegaWalletSettingsModalStore from './accounts/presentation/stores/MegaWalletSettingsModalStore';
import MegaWalletTransferModalStore from './accounts/presentation/stores/MegaWalletTransferModalStore';
import SuperAdminMningFarmsPageStore from './mining-farm/presentation/stores/SuperAdminMningFarmsPageStore';
import SuperAdminCollectionsPageStore from './collection/presentation/stores/SuperAdminCollectionsPageStore';
import MegaWalletBalanceStore from './accounts/presentation/stores/MegaWalletBalanceStore';
import EditUserModalStore from './accounts/presentation/stores/EditUserModalStore';
import EditUserBtcModalStore from './accounts/presentation/stores/EditUserBtcModalStore';
import SuperAdminAnalyticsPageStore from './analytics/presentation/stores/SuperAdminAnalyticsPageStore';
import ApprovedCollectionsStore from './collection/presentation/stores/ApprovedCollectionsStore';
import RejectedCollectionsStore from './collection/presentation/stores/RejectedCollectionsStore';
import GeneralStore from './general/presentation/stores/GeneralStore';
import ProgressStore from './core/presentation/stores/ProgressStore';
import KycApiRepo from './kyc/data/repo/KycApiRepo';
import KycStore from './kyc/presentation/stores/KycStore';
import CheckForPresaleRefundsModalStore from './accounts/presentation/stores/CheckForPresaleRefundsModalStore';
import PresaleStore from './app-routes/presentation/PresaleStore';
import AllowlistApiRepo from './allowlist/data/repo/AllowlistApiRepo';
import NftPresaleStore from './nft-presale/presentation/stores/NftPresaleStore';
import MintPrivateSaleNftModalStore from './nft-presale/presentation/stores/MintPrivateSaleNftModalStore';
import PresaleCollectionModalStore from './nft-presale/presentation/stores/PresaleCollectionModalStore';

// @ts-ignore
declare global {
    // tslint:disable-next-line
    interface Window {
      web3: any;
      ethereum: any;
    }
}

const storageHelper = new StorageHelper();
storageHelper.open();

const bitcoinRepo = new BitcoinApiRepo();
const cudosRepo = new CudosApiRepo();
const miningFarmRepo = new MiningFarmApiRepo();
const collectionRepo = new CollectionApiRepo();
const nftRepo = new NftApiRepo();
const visitorRepo = new VisitorApiRepo();
const statisticsRepo = new StatisticsApiRepo();
const accountRepo = new AccountApiRepo();
const walletRepo = new WalletApiRepo();
const settingsRepo = new SettingsApiRepo();
const allowlistRepo = new AllowlistApiRepo();
const kycRepo = new KycApiRepo();

const appStore = new AppStore();
const alertStore = new AlertStore();
const snackStore = new SnackStore();
const progressStore = new ProgressStore();
const exampleModalStore = new ExampleModalStore();
const walletStore = new WalletStore(alertStore, walletRepo, nftRepo);
const generalStore = new GeneralStore(settingsRepo);
const presaleStore = new PresaleStore();

const bitcoinStore = new BitcoinStore(bitcoinRepo);
const cudosStore = new CudosStore(cudosRepo);
const kycStore = new KycStore(kycRepo);
const accountSessionStore = new AccountSessionStore(walletStore, kycStore, accountRepo, miningFarmRepo, cudosRepo);
const categoriesStore = new CategoriesStore(collectionRepo);
const rewardsCalculatorStore = new RewardsCalculatorStore(bitcoinStore, generalStore, miningFarmRepo);
const marketplacePageStore = new MarketplacePageStore(alertStore, walletStore, collectionRepo, nftRepo, miningFarmRepo, allowlistRepo);
const superAdminDashboardPageStore = new SuperAdminDashboardPageStore(bitcoinStore, cudosStore, accountSessionStore, alertStore, statisticsRepo, miningFarmRepo, collectionRepo);
const exploreCollectionsPageStore = new ExploreCollectionsPageStore(collectionRepo, miningFarmRepo);
const exploreMiningFarmsPageStore = new ExploreMiningFarmsPageStore(miningFarmRepo);
const exploreNftsPageStore = new ExploreNftsPageStore(nftRepo, collectionRepo);
const viewNftPageStore = new ViewNftPageStore(bitcoinStore, cudosStore, generalStore, accountSessionStore, presaleStore, nftRepo, collectionRepo, miningFarmRepo, statisticsRepo, accountRepo);
const creditCollectionPageStore = new CreditCollectionPageStore(nftRepo, collectionRepo, miningFarmRepo, walletStore, alertStore, accountSessionStore);
const creditMiningFarmPageStore = new CreditMiningFarmPageStore(miningFarmRepo, collectionRepo, nftRepo, accountSessionStore, alertStore, walletStore);
const userProfilePageStore = new UserProfilePageStore(walletStore, accountSessionStore, nftRepo, collectionRepo, statisticsRepo);
const analyticsPageStore = new AnalyticsPageStore(bitcoinStore, cudosStore, statisticsRepo, nftRepo, collectionRepo, miningFarmRepo);
const superAdminAnalyticsPageStore = new SuperAdminAnalyticsPageStore(bitcoinStore, cudosStore, miningFarmRepo, collectionRepo, statisticsRepo);
const creditMiningFarmDetailsPageStore = new CreditMiningFarmDetailsPageStore(accountSessionStore, miningFarmRepo, alertStore);
const creditCollectionStore = new CreditCollectionStore(cudosStore, accountSessionStore, collectionRepo, nftRepo, miningFarmRepo);
const visitorStore = new VisitorStore(visitorRepo);
const queuedMiningFarmsStore = new QueuedMiningFarmsStore(miningFarmRepo, accountSessionStore, generalStore);
const queuedCollectionsStore = new QueuedCollectionsStore(collectionRepo, miningFarmRepo, nftRepo, walletStore, accountSessionStore, alertStore);
const approvedCollectionsStore = new ApprovedCollectionsStore(collectionRepo, nftRepo, walletStore, accountSessionStore, alertStore);
const rejectedCollectionsStore = new RejectedCollectionsStore(collectionRepo, nftRepo, accountSessionStore, alertStore);
const superAdminMegaWalletPageStore = new SuperAdminMegaWalletPageStore(cudosRepo, statisticsRepo, accountSessionStore);
const superAdminMiningFarmsPageStore = new SuperAdminMningFarmsPageStore(miningFarmRepo, statisticsRepo);
const editMiningFarmModalStore = new EditMiningFarmModalStore(miningFarmRepo);
const editUserModalStore = new EditUserModalStore(accountRepo);
const editUserBtcModalStore = new EditUserBtcModalStore(accountRepo, cudosRepo, alertStore, walletStore);
const creditCollectionSuccessModalStore = new CreditCollectionSuccessModalStore();
const buyNftModalStore = new BuyNftModalStore(cudosStore, nftRepo, walletStore, accountRepo, cudosRepo);
const resellNftModalStore = new ResellNftModalStore(nftRepo, walletStore, cudosStore);
const viewCollectionModalStore = new ViewCollectionModalStore(nftRepo, collectionRepo, accountRepo, miningFarmRepo);
const viewMiningFarmModalStore = new ViewMiningFarmModalStore(generalStore, miningFarmRepo);
const changePasswordModalStore = new ChangePasswordModalStore(accountRepo);
const walletSelectModalStore = new WalletSelectModalStore(walletStore, accountRepo, accountSessionStore, kycStore);
const valueChangeModalStore = new ValueChangeModalStore();
const megaWalletSettingsModalStore = new MegaWalletSettingsModalStore(accountSessionStore, generalStore);
const megaWalletTransferModalStore = new MegaWalletTransferModalStore(accountSessionStore, walletStore);
const superAdminCollectionsPageStore = new SuperAdminCollectionsPageStore();
const megaWalletBalanceStore = new MegaWalletBalanceStore(cudosRepo, accountSessionStore);
const checkForPresaleRefundsModalStore = new CheckForPresaleRefundsModalStore(appStore, walletStore);
const nftPresaleStore = new NftPresaleStore(nftRepo, collectionRepo, allowlistRepo, alertStore, cudosStore, presaleStore, walletStore);
const mintPrivateSaleNftsModalStore = new MintPrivateSaleNftModalStore(cudosRepo, nftRepo, accountRepo, alertStore, walletStore, cudosStore);
const presaleCollectionModalStore = new PresaleCollectionModalStore(appStore, alertStore, collectionRepo);

bitcoinRepo.setPresentationActionsCallbacks(appStore.enableActions, appStore.disableActions);
cudosRepo.setPresentationActionsCallbacks(appStore.enableActions, appStore.disableActions);
miningFarmRepo.setPresentationActionsCallbacks(appStore.enableActions, appStore.disableActions);
collectionRepo.setPresentationActionsCallbacks(appStore.enableActions, appStore.disableActions);
nftRepo.setPresentationActionsCallbacks(appStore.enableActions, appStore.disableActions);
visitorRepo.setPresentationActionsCallbacks(appStore.enableActions, appStore.disableActions);
statisticsRepo.setPresentationActionsCallbacks(appStore.enableActions, appStore.disableActions);
accountRepo.setPresentationActionsCallbacks(appStore.enableActions, appStore.disableActions);
walletRepo.setPresentationActionsCallbacks(appStore.enableActions, appStore.disableActions);
settingsRepo.setPresentationActionsCallbacks(appStore.enableActions, appStore.disableActions);
kycRepo.setPresentationActionsCallbacks(appStore.enableActions, appStore.disableActions);
allowlistRepo.setPresentationActionsCallbacks(appStore.enableActions, appStore.disableActions);

bitcoinRepo.setPresentationAlertCallbacks(alertStore.show);
cudosRepo.setPresentationAlertCallbacks(alertStore.show);
miningFarmRepo.setPresentationAlertCallbacks(alertStore.show);
collectionRepo.setPresentationAlertCallbacks(alertStore.show);
nftRepo.setPresentationAlertCallbacks(alertStore.show);
visitorRepo.setPresentationAlertCallbacks(alertStore.show);
statisticsRepo.setPresentationAlertCallbacks(alertStore.show);
accountRepo.setPresentationAlertCallbacks(alertStore.show);
walletRepo.setPresentationAlertCallbacks(alertStore.show);
settingsRepo.setPresentationAlertCallbacks(alertStore.show);
kycRepo.setPresentationAlertCallbacks(alertStore.show);
allowlistRepo.setPresentationAlertCallbacks(alertStore.show);

collectionRepo.setProgressCallbacks(progressStore.onProgress);
miningFarmRepo.setProgressCallbacks(progressStore.onProgress);

const App = () => {

    useEffect(() => {
        initHover();
        initOnBeforeUnload();
        removeInitalPageLoading();

        async function run() {
            await accountSessionStore.loadSessionAccountsAndSync();
            setTimeout(run, 5 * 60 * 1000); // refrech token each 5 minutes
        }

        run();
    }, []);

    return (
        <StrictMode>
            <Provider
                appStore={appStore}
                alertStore={alertStore}
                snackStore={snackStore}
                progressStore={progressStore}
                walletStore={walletStore}
                generalStore={generalStore}
                bitcoinStore={bitcoinStore}
                cudosStore={cudosStore}
                categoriesStore={categoriesStore}
                accountSessionStore={accountSessionStore}
                kycStore={kycStore}
                exampleModalStore={exampleModalStore}
                rewardsCalculatorStore={rewardsCalculatorStore}
                exploreCollectionsPageStore={exploreCollectionsPageStore}
                exploreMiningFarmsPageStore={exploreMiningFarmsPageStore}
                exploreNftsPageStore={exploreNftsPageStore}
                marketplacePageStore={marketplacePageStore}
                viewNftPageStore={viewNftPageStore}
                creditCollectionPageStore={creditCollectionPageStore}
                creditMiningFarmPageStore={creditMiningFarmPageStore}
                userProfilePageStore={userProfilePageStore}
                buyNftModalStore={buyNftModalStore}
                resellNftModalStore={resellNftModalStore}
                editMiningFarmModalStore={editMiningFarmModalStore}
                editUserModalStore={editUserModalStore}
                editUserBtcModalStore={editUserBtcModalStore}
                creditCollectionSuccessModalStore={creditCollectionSuccessModalStore}
                creditMiningFarmDetailsPageStore={creditMiningFarmDetailsPageStore}
                superAdminDashboardPageStore={superAdminDashboardPageStore}
                creditCollectionStore={creditCollectionStore}
                visitorStore={visitorStore}
                queuedMiningFarmsStore={queuedMiningFarmsStore}
                queuedCollectionsStore={queuedCollectionsStore}
                analyticsPageStore={analyticsPageStore}
                superAdminAnalyticsPageStore={superAdminAnalyticsPageStore}
                viewCollectionModalStore={viewCollectionModalStore}
                viewMiningFarmModalStore={viewMiningFarmModalStore}
                changePasswordModalStore={changePasswordModalStore}
                walletSelectModalStore={walletSelectModalStore}
                superAdminMegaWalletPageStore={superAdminMegaWalletPageStore}
                valueChangeModalStore={valueChangeModalStore}
                megaWalletSettingsModalStore={megaWalletSettingsModalStore}
                megaWalletTransferModalStore={megaWalletTransferModalStore}
                superAdminMiningFarmsPageStore={superAdminMiningFarmsPageStore}
                superAdminCollectionsPageStore={superAdminCollectionsPageStore}
                megaWalletBalanceStore={megaWalletBalanceStore}
                approvedCollectionsStore={approvedCollectionsStore}
                rejectedCollectionsStore={rejectedCollectionsStore}
                checkForPresaleRefundsModalStore={checkForPresaleRefundsModalStore}
                presaleStore={presaleStore}
                nftPresaleStore={nftPresaleStore}
                mintPrivateSaleNftsModalStore={mintPrivateSaleNftsModalStore}
                presaleCollectionModalStore = { presaleCollectionModalStore }
            >
                <BrowserRouter>
                    <AppRouter />
                </BrowserRouter>
            </Provider>
        </StrictMode>
    );

}

export default App;

function initHover() {
    if (navigator.maxTouchPoints === 0 || navigator.msMaxTouchPoints === 0) {
        return;
    }

    let touch = false;
    let timerId: any = null;
    const timerCallback = () => {
        touch = false;
    };

    document.documentElement.addEventListener('mousemove', (e) => {
        if (touch === false) { S.CSS.removeClass(document.documentElement, 'Touchable'); }
    }, true);

    document.documentElement.addEventListener('touchstart', () => {
        touch = true;
        if (timerId !== null) {
            clearTimeout(timerId);
        }
        S.CSS.addClass(document.documentElement, 'Touchable');
    }, true);

    document.documentElement.addEventListener('touchend', () => {
        if (timerId !== null) {
            clearTimeout(timerId);
        }
        timerId = setTimeout(timerCallback, 256);
    });
}

function initOnBeforeUnload() {
    let loadedFromCache = false;

    window.onbeforeunload = (e: BeforeUnloadEvent) => {
        const defaultReturnValue = e.returnValue;

        if (S.Browser.instance_name === S.Browser.SAFARI) {
            document.body.style.opacity = '0';
        }

        if (loadedFromCache === true) {
            e.returnValue = defaultReturnValue;
            return;
        }

        if (e.returnValue !== defaultReturnValue) {
            setTimeout(() => {
                setTimeout(() => {
                    setTimeout(() => {
                        setTimeout(() => {
                            setTimeout(() => {
                                if (S.Browser.instance_name === S.Browser.SAFARI) {
                                    document.body.style.opacity = '1';
                                }
                            }, 20);
                        }, 20);
                    }, 20);
                }, 20);
            }, 20);
        }
    };

    window.onpageshow = (e: PageTransitionEvent) => {
        loadedFromCache = e.persisted;
        if (e.persisted) {
            window.location.reload();
        }
    };
}

function removeInitalPageLoading() {
    const pageLoadingN = document.getElementById('page_loading');
    pageLoadingN?.parentNode?.removeChild(pageLoadingN);
}
