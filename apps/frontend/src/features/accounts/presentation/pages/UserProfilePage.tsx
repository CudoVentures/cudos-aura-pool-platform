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
import MyEarningsTab from '../components/user-profile/MyEarningsTab';
import MyHistoryTab from '../components/user-profile/MyHistoryTab';
import NavRowTabs, { createNavRowTab } from '../../../../core/presentation/components/NavRowTabs';
import MyNftsTab from '../components/user-profile/MyNftsTab';

import '../styles/page-user-profile.css';

type Props = {
    appStore?: AppStore;
    bitcoinStore?: BitcoinStore;
    accountSessionStore?: AccountSessionStore;
    userProfilePageStore?: UserProfilePageStore,
}

function UserProfilePage({ appStore, bitcoinStore, userProfilePageStore, accountSessionStore }: Props) {
    useEffect(() => {
        appStore.useLoading(async () => {
            await bitcoinStore.init();
            await userProfilePageStore.init();
        })
    }, [])

    const accountEntity = accountSessionStore.accountEntity;
    const userEntity = accountSessionStore.userEntity;

    return (
        <PageLayoutComponent className = { 'PageUserProfile' }>
            <PageHeader />

            <div className={'PageContent AppContent'} >
                <ProfileHeader coverPictureUrl={userEntity.coverImgUrl} profilePictureUrl={userEntity.profileImgUrl} />
                <div className={'ProfileHeaderDataRow'}>
                    <div className={'AccountName H2 Bold'}>{accountEntity.name}</div>
                    <div className={'FlexRow'}>
                        <div className={'CudosWalletAddrees ColorPrimaryBlue'}>{userEntity.cudosWalletAddress}</div>
                        <div className={'JoinDate B3'}>joined {accountEntity.formatDateJoined()}</div>
                    </div>
                </div>
                <div className = { 'SectionDivider' } />
                <NavRowTabs
                    className = { 'NavRowHolder' }
                    navTabs={[
                        createNavRowTab('My NFTs', userProfilePageStore.isMyNftTab(), userProfilePageStore.markMyNftTab),
                        createNavRowTab('Earnings Info', userProfilePageStore.isMyEarningsTab(), userProfilePageStore.markMyEarningsTab),
                        createNavRowTab('History', userProfilePageStore.isMyHistoryTab(), userProfilePageStore.markMyHistoryTab),
                    ]} />

                <AnimationContainer active = { userProfilePageStore.isMyNftTab() } >
                    {userProfilePageStore.isMyNftTab() === true && (
                        <MyNftsTab />
                    ) }
                </AnimationContainer>

                <AnimationContainer active = { userProfilePageStore.isMyEarningsTab() } >
                    {userProfilePageStore.isMyEarningsTab() === true && (
                        <MyEarningsTab />
                    ) }
                </AnimationContainer>

                <AnimationContainer active = { userProfilePageStore.isMyHistoryTab() } >
                    {userProfilePageStore.isMyHistoryTab() === true && (
                        <MyHistoryTab />
                    ) }
                </AnimationContainer>

            </div>

            <PageFooter />
        </PageLayoutComponent>
    )
}

export default inject((stores) => stores)(observer(UserProfilePage));
