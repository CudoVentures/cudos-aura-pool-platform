import React, { useEffect, StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'mobx-react';

import S from './core/utilities/Main';

import AppStore from './core/presentation/stores/AppStore';

import AppRouter from './features/app-routes/presentation/components/AppRouter';
import AlertStore from './core/presentation/stores/AlertStore';
import RewardsCalculatorStore from './features/rewards-calculator/presentation/stores/RewardsCalculatorStore';
import MarketplaceStore from './features/collection/presentation/stores/MarketplaceStore';
import ExampleModalStore from './features/ui-kit/presensation/stores/ExampleModalStore';
import ViewNftPageStore from './features/nft/presentation/stores/ViewNftPageStore';
import CreditCollectionPageStore from './features/collection/presentation/stores/CreditCollectionPageStore';
import CreditMiningFarmPageStore from './features/mining-farm/presentation/stores/CreditMiningFarmPageStore';
import WalletStore from './features/ledger/presentation/stores/WalletStore';
import BuyNftModalStore from './features/nft/presentation/stores/BuyNftModalStore';
import ResellNftModalStore from './features/nft/presentation/stores/ResellNftModalStore';
import StorageHelper from './core/helpers/StorageHelper';
import BitcoinStore from './features/bitcoin-data/presentation/stores/BitcoinStore';
import CudosStore from './features/cudos-data/presentation/stores/CudosStore';
import UserProfilePageStore from './features/accounts/presentation/stores/UserProfilePageStore';
import AccountSessionStore from './features/accounts/presentation/stores/AccountSessionStore';
import CategoriesStore from './features/collection/presentation/stores/CategoriesStore';
import ExploreCollectionsPageStore from './features/collection/presentation/stores/ExploreCollectionsPageStore';
import ExploreMiningFarmsPageStore from './features/mining-farm/presentation/stores/ExploreMiningFarmsPageStore';
import ExploreNftsPageStore from './features/nft/presentation/stores/ExploreNftsPageStore';
import EditMiningFarmModalStore from './features/mining-farm/presentation/stores/EditMiningFarmModalStore';
import CreditMiningFarmDetailsPageStore from './features/mining-farm/presentation/stores/CreditMiningFarmDetailsPageStore';
import CreditCollectionStore from './features/collection/presentation/stores/CreditCollectionStore';
import CreditCollectionSuccessModalStore from './features/collection/presentation/stores/CreditCollectionSuccessModalStore';
import AnalyticsPageStore from './features/analytics/presentation/stores/AnalyticsPageStore';
import AccountApiRepo from './features/accounts/data/repo/AccountApiRepo';
import MiningFarmApiRepo from './features/mining-farm/data/repo/MiningFarmApiRepo';
import CollectionApiRepo from './features/collection/data/repo/CollectionApiRepo';
import NftApiRepo from './features/nft/data/repo/NftApiRepo';
import ViewCollectionModalStore from './features/collection/presentation/stores/ViewCollectionModalStore';
import ViewMiningFarmModalStore from './features/mining-farm/presentation/stores/ViewMiningFarmModalStore';
import BitcoinApiRepo from './features/bitcoin-data/data/repo/BitcoinApiRepo';
import CudosApiRepo from './features/cudos-data/data/repo/CudosApiRepo';
import ChangePasswordModalStore from './features/accounts/presentation/stores/ChangePasswordModalStore';
import WalletSelectModalStore from './features/header/presentation/stores/WalletSelectModalStore';
import VisitorApiRepo from './features/visitor/data/repos/VisitorApiRepo';
import VisitorStore from './features/visitor/presentation/stores/VisitorStore';
import StatisticsApiRepo from './features/analytics/data/repo/StatisticsApiRepo';
import SuperAdminDashboardPageStore from './features/indices/presentation/stores/SuperAdminDashboardPageStore';
import QueuedCollectionsStore from './features/collection/presentation/stores/QueuedCollectionsStore';

const storageHelper = new StorageHelper();
storageHelper.open();

// const bitcoinRepo = new BitcoinStorageRepo(storageHelper);
const bitcoinRepo = new BitcoinApiRepo();
const cudosRepo = new CudosApiRepo();
const miningFarmRepo = new MiningFarmApiRepo();
const collectionRepo = new CollectionApiRepo();
const nftRepo = new NftApiRepo();
const visitorRepo = new VisitorApiRepo();
const statisticsRepo = new StatisticsApiRepo();
const accountRepo = new AccountApiRepo();

const appStore = new AppStore();
const alertStore = new AlertStore();
const exampleModalStore = new ExampleModalStore();
const walletStore = new WalletStore(alertStore);

const bitcoinStore = new BitcoinStore(bitcoinRepo);
const cudosStore = new CudosStore(cudosRepo);
const accountSessionStore = new AccountSessionStore(walletStore, accountRepo, miningFarmRepo);
const categoriesStore = new CategoriesStore(collectionRepo);
const rewardsCalculatorStore = new RewardsCalculatorStore(bitcoinStore, miningFarmRepo);
const marketplaceStore = new MarketplaceStore(collectionRepo, nftRepo, miningFarmRepo);
const superAdminDashboardPageStore = new SuperAdminDashboardPageStore(miningFarmRepo, collectionRepo, walletStore, accountSessionStore, alertStore);
const exploreCollectionsPageStore = new ExploreCollectionsPageStore(collectionRepo, miningFarmRepo);
const exploreMiningFarmsPageStore = new ExploreMiningFarmsPageStore(miningFarmRepo);
const exploreNftsPageStore = new ExploreNftsPageStore(nftRepo, collectionRepo);
const viewNftPageStore = new ViewNftPageStore(bitcoinStore, cudosStore, nftRepo, collectionRepo, miningFarmRepo, statisticsRepo, accountRepo);
const creditCollectionPageStore = new CreditCollectionPageStore(nftRepo, collectionRepo, miningFarmRepo);
const creditMiningFarmPageStore = new CreditMiningFarmPageStore(miningFarmRepo, collectionRepo, nftRepo);
const userProfilePageStore = new UserProfilePageStore(walletStore, nftRepo, collectionRepo, statisticsRepo);
const analyticsPageStore = new AnalyticsPageStore(statisticsRepo, nftRepo, collectionRepo, miningFarmRepo);
const creditMiningFarmDetailsPageStore = new CreditMiningFarmDetailsPageStore(accountSessionStore, miningFarmRepo);
const creditCollectionStore = new CreditCollectionStore(accountSessionStore, collectionRepo, nftRepo, miningFarmRepo);
const visitorStore = new VisitorStore(visitorRepo);
const queuedCollectionsStore = new QueuedCollectionsStore(collectionRepo, walletStore, accountSessionStore, alertStore);

const editMiningFarmModalStore = new EditMiningFarmModalStore(miningFarmRepo);
const creditCollectionSuccessModalStore = new CreditCollectionSuccessModalStore();
const buyNftModalStore = new BuyNftModalStore(nftRepo, walletStore, accountRepo);
const resellNftModalStore = new ResellNftModalStore(nftRepo, walletStore);
const viewCollectionModalStore = new ViewCollectionModalStore(nftRepo, collectionRepo);
const viewMiningFarmModalStore = new ViewMiningFarmModalStore(miningFarmRepo);
const changePasswordModalStore = new ChangePasswordModalStore(accountRepo);
const walletSelectModalStore = new WalletSelectModalStore(walletStore, accountRepo);

bitcoinRepo.setPresentationActionsCallbacks(appStore.enableActions, appStore.disableActions);
cudosRepo.setPresentationActionsCallbacks(appStore.enableActions, appStore.disableActions);
miningFarmRepo.setPresentationActionsCallbacks(appStore.enableActions, appStore.disableActions);
collectionRepo.setPresentationActionsCallbacks(appStore.enableActions, appStore.disableActions);
nftRepo.setPresentationActionsCallbacks(appStore.enableActions, appStore.disableActions);
visitorRepo.setPresentationActionsCallbacks(appStore.enableActions, appStore.disableActions);
statisticsRepo.setPresentationActionsCallbacks(appStore.enableActions, appStore.disableActions);
accountRepo.setPresentationActionsCallbacks(appStore.enableActions, appStore.disableActions);

bitcoinRepo.setPresentationAlertCallbacks(alertStore.show);
cudosRepo.setPresentationAlertCallbacks(alertStore.show);
miningFarmRepo.setPresentationAlertCallbacks(alertStore.show);
collectionRepo.setPresentationAlertCallbacks(alertStore.show);
nftRepo.setPresentationAlertCallbacks(alertStore.show);
visitorRepo.setPresentationAlertCallbacks(alertStore.show);
statisticsRepo.setPresentationAlertCallbacks(alertStore.show);
accountRepo.setPresentationAlertCallbacks(alertStore.show);

const App = () => {

    useEffect(() => {
        initHover();
        initOnBeforeUnload();
        removeInitalPageLoading();

        async function run() {
            await accountSessionStore.loadSessionAccountsAndSync();
        }
        run();
    }, []);

    return (
        <StrictMode>
            <Provider
                appStore = { appStore }
                alertStore = { alertStore }
                walletStore = { walletStore }
                bitcoinStore = { bitcoinStore }
                cudosStore = { cudosStore }
                categoriesStore = { categoriesStore }
                accountSessionStore = { accountSessionStore }
                exampleModalStore = { exampleModalStore }
                rewardsCalculatorStore = { rewardsCalculatorStore }
                exploreCollectionsPageStore = { exploreCollectionsPageStore }
                exploreMiningFarmsPageStore = { exploreMiningFarmsPageStore }
                exploreNftsPageStore = { exploreNftsPageStore }
                marketplaceStore = { marketplaceStore }
                viewNftPageStore = { viewNftPageStore }
                creditCollectionPageStore = { creditCollectionPageStore }
                creditMiningFarmPageStore = { creditMiningFarmPageStore }
                userProfilePageStore = { userProfilePageStore }
                buyNftModalStore = { buyNftModalStore }
                resellNftModalStore = { resellNftModalStore }
                editMiningFarmModalStore = { editMiningFarmModalStore }
                creditCollectionSuccessModalStore = { creditCollectionSuccessModalStore }
                creditMiningFarmDetailsPageStore = { creditMiningFarmDetailsPageStore }
                superAdminDashboardPageStore = { superAdminDashboardPageStore }
                creditCollectionStore = { creditCollectionStore }
                visitorStore = { visitorStore }
                queuedCollectionsStore = { queuedCollectionsStore }
                analyticsPageStore = { analyticsPageStore }
                viewCollectionModalStore = { viewCollectionModalStore }
                viewMiningFarmModalStore = { viewMiningFarmModalStore }
                changePasswordModalStore = { changePasswordModalStore }
                walletSelectModalStore = { walletSelectModalStore }>
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
