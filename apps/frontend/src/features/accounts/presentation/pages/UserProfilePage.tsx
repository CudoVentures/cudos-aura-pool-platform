import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import AccountSessionStore from '../stores/AccountSessionStore';
import AppStore from '../../../../core/presentation/stores/AppStore';
import UserProfilePageStore from '../stores/UserProfilePageStore';
import BitcoinStore from '../../../bitcoin-data/presentation/stores/BitcoinStore';
import ProfileHeader from '../../../collection/presentation/components/ProfileHeader';
import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';
import PageHeader from '../../../header/presentation/components/PageHeader';
import PageFooter from '../../../footer/presentation/components/PageFooter';
import AnimationContainer from '../../../../core/presentation/components/AnimationContainer';
import EarningsInfoPage from '../components/user-profile/EarningsInfoPage';
import HistoryPage from '../components/user-profile/HistoryPage';
import NavRowTabs, { createNavRowTab } from '../../../../core/presentation/components/NavRowTabs';
import MyNftsPage from '../components/user-profile/MyNftsPage';
import CudosStore from '../../../cudos-data/presentation/stores/CudosStore';

import '../styles/page-user-profile.css';

type Props = {
    appStore?: AppStore;
    cudosStore?: CudosStore;
    bitcoinStore?: BitcoinStore;
    accountSessionStore?: AccountSessionStore;
    userProfilePageStore?: UserProfilePageStore,
}

function UserProfilePage({ appStore, cudosStore, bitcoinStore, userProfilePageStore, accountSessionStore }: Props) {
    useEffect(() => {
        appStore.useLoading(async () => {
            await bitcoinStore.init();
            await userProfilePageStore.init();
        })
    }, [])

    const accountEntity = accountSessionStore.accountEntity;
    const userEntity = accountSessionStore.userEntity;

    return (
        <PageLayoutComponent
            className = { 'PageUserProfile' }>
            <PageHeader />

            <div className={'PageContent AppContent'} >
                <ProfileHeader coverPictureUrl={userEntity.coverImgUrl} profilePictureUrl={userEntity.profileImgUrl} />
                <div className={'ProfileHeaderDataRow FlexRow FlexGrow'}>
                    <div className={'FlexColumn LeftSide'}>
                        <div className={'H2 Bold'}>{accountEntity.name}</div>
                        <div className={'FlexRow InfoBelowUserName'}>
                            <div className={'Addrees'}>{userEntity.cudosWalletAddress}</div>
                            <div className={'JoinDate B3'}>{accountEntity.formatDateJoined()}</div>
                        </div>
                    </div>
                </div>
                <div className={'FlexRow NavRowHolder'}>
                    <NavRowTabs
                        navTabs={[
                            createNavRowTab('My NFTs', userProfilePageStore.isNftPage(), userProfilePageStore.markNftPage),
                            createNavRowTab('Earnings Info', userProfilePageStore.isEarningsPage(), userProfilePageStore.markEarningsPage),
                            createNavRowTab('History', userProfilePageStore.isHistoryPage(), userProfilePageStore.markHistoryPage),
                        ]}
                    />
                </div>
                <AnimationContainer active = { userProfilePageStore.isNftPage() } >
                    {userProfilePageStore.isNftPage() === true && (
                        <MyNftsPage userProfilePageStore={userProfilePageStore}/>
                    ) }
                </AnimationContainer>

                <AnimationContainer active = { userProfilePageStore.isEarningsPage() } >
                    {userProfilePageStore.isEarningsPage() === true && (
                        <EarningsInfoPage userProfilePageStore={userProfilePageStore}/>
                    ) }
                </AnimationContainer>

                <AnimationContainer active = { userProfilePageStore.isHistoryPage() } >
                    {userProfilePageStore.isHistoryPage() === true && (
                        <HistoryPage userProfilePageStore={userProfilePageStore} cudosStore = {cudosStore} />
                    ) }
                </AnimationContainer>
            </div>

            <PageFooter />
        </PageLayoutComponent>
    )
}

export default inject((stores) => stores)(observer(UserProfilePage));
