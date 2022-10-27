import React, { useEffect, StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'mobx-react';

import S from './core/utilities/Main';

import AppStore from './core/presentation/stores/AppStore';

import AppRouter from './features/app-routes/presentation/components/AppRouter';
import AlertStore from './core/presentation/stores/AlertStore';
import RewardsCalculatorStore from './features/rewards-calculator/presentation/stores/RewardsCalculatorStore';
import BitcoinStorageRepo from './features/bitcoin-data/data/repo/BitcoinStorageRepo';
import MiningFarmStorageRepo from './features/mining-farm/data/repo/MiningFarmStorageRepo';
import CollectionStorageRepo from './features/collection/data/repo/CollectionStorageRepo';
import MarketplaceStore from './features/collection/presentation/stores/MarketplaceStore';
import NftStorageRepo from './features/nft/data/repo/NftStorageRepo';
import ExampleModalStore from './features/ui-kit/presensation/stores/ExampleModalStore';
import CudosStorageRepo from './features/cudos-data/data/repo/CudosStorageRepo';
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
import AccountStorageRepo from './features/accounts/data/repo/AccountStorageRepo';
import AccountSessionStore from './features/accounts/presentation/stores/AccountSessionStore';
import CategoriesStore from './features/collection/presentation/stores/CategoriesStore';
import ExploreCollectionsPageStore from './features/collection/presentation/stores/ExploreCollectionsPageStore';
import ExploreMiningFarmsPageStore from './features/mining-farm/presentation/stores/ExploreMiningFarmsPageStore';
import ExploreNftsPageStore from './features/nft/presentation/stores/ExploreNftsPageStore';
import EditMiningFarmModalStore from './features/mining-farm/presentation/stores/EditMiningFarmModalStore';
import CreditMiningFarmDetailsPageStore from './features/mining-farm/presentation/stores/CreditMiningFarmDetailsPageStore';
import SuperAdminApprovePageStore from './features/accounts/presentation/stores/SuperAdminApprovePageStore';
import CreditCollectionNftsPageStore from './features/collection/presentation/stores/CreditCollectionNftsPageStore';
import CreditCollectionStore from './features/collection/presentation/stores/CreditCollectionStore';
import CreditCollectionSuccessModalStore from './features/collection/presentation/stores/CreditCollectionSuccessModalStore';
import AnalyticsPageStore from './features/analytics/presentation/stores/AnalyticsPageStore';
import PoolEventStorageRepo from './features/analytics/data/repo/PoolEventStorageRepo';

const storageHelper = new StorageHelper();
storageHelper.open();

const appStore = new AppStore();
const alertStore = new AlertStore();
const exampleModalStore = new ExampleModalStore();

const bitcoinRepo = new BitcoinStorageRepo(storageHelper);
const cudosRepo = new CudosStorageRepo(storageHelper);
const miningFarmRepo = new MiningFarmStorageRepo(storageHelper);
const collectionRepo = new CollectionStorageRepo(storageHelper);
const nftRepo = new NftStorageRepo(storageHelper);
const accountRepo = new AccountStorageRepo(storageHelper);
const poolEventRepo = new PoolEventStorageRepo();

const walletStore = new WalletStore();
const bitcoinStore = new BitcoinStore(bitcoinRepo);
const cudosStore = new CudosStore(cudosRepo);
const accountSessionStore = new AccountSessionStore(walletStore, accountRepo, miningFarmRepo);
const categoriesStore = new CategoriesStore(collectionRepo);
const rewardsCalculatorStore = new RewardsCalculatorStore(bitcoinStore, miningFarmRepo);
const marketplaceStore = new MarketplaceStore(cudosStore, collectionRepo, nftRepo, miningFarmRepo);
const superAdminApprovePageStore = new SuperAdminApprovePageStore(miningFarmRepo, collectionRepo);
const exploreCollectionsPageStore = new ExploreCollectionsPageStore(collectionRepo, miningFarmRepo);
const exploreMiningFarmsPageStore = new ExploreMiningFarmsPageStore(miningFarmRepo);
const exploreNftsPageStore = new ExploreNftsPageStore(nftRepo, collectionRepo);
const viewNftPageStore = new ViewNftPageStore(bitcoinStore, cudosStore, nftRepo, collectionRepo, miningFarmRepo);
const creditCollectionPageStore = new CreditCollectionPageStore(nftRepo, collectionRepo, miningFarmRepo);
const creditMiningFarmPageStore = new CreditMiningFarmPageStore(miningFarmRepo, collectionRepo, nftRepo);
const userProfilePageStore = new UserProfilePageStore(walletStore, nftRepo, collectionRepo);
const analyticsPageStore = new AnalyticsPageStore(poolEventRepo, collectionRepo);
const creditMiningFarmDetailsPageStore = new CreditMiningFarmDetailsPageStore(accountSessionStore, miningFarmRepo);
const creditCollectionNftsPageStore = new CreditCollectionNftsPageStore(accountSessionStore, miningFarmRepo, collectionRepo);
const creditCollectionStore = new CreditCollectionStore(accountSessionStore, collectionRepo, nftRepo, miningFarmRepo);

const editMiningFarmModalStore = new EditMiningFarmModalStore(miningFarmRepo);
const creditCollectionSuccessModalStore = new CreditCollectionSuccessModalStore();
const buyNftModalStore = new BuyNftModalStore();
const resellNftModalStore = new ResellNftModalStore();

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
                superAdminApprovePageStore = { superAdminApprovePageStore }
                creditCollectionNftsPageStore = { creditCollectionNftsPageStore }
                creditCollectionStore = { creditCollectionStore }
                analyticsPageStore = { analyticsPageStore }

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
