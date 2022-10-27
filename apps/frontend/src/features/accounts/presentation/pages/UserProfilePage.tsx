import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';

import S from '../../../../../src/core/utilities/Main';
import AccountSessionStore from '../stores/AccountSessionStore';
import AppStore from '../../../../core/presentation/stores/AppStore';
import UserProfilePageStore from '../stores/UserProfilePageStore';
import NftEntity from '../../../nft/entities/NftEntity';
import BitcoinStore from '../../../bitcoin-data/presentation/stores/BitcoinStore';
import NftFilterModel from '../../../nft/utilities/NftFilterModel';

import { MenuItem } from '@mui/material';
import ProfileHeader from '../../../collection/presentation/components/ProfileHeader';
import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';
import PageHeader from '../../../header/presentation/components/PageHeader';
import PageFooter from '../../../footer/presentation/components/PageFooter';
import LoadingIndicator from '../../../../core/presentation/components/LoadingIndicator';
import Select from '../../../../core/presentation/components/Select';
import Actions, { ActionsHeight, ActionsLayout } from '../../../../core/presentation/components/Actions';
import Button, { ButtonPadding, ButtonType } from '../../../../core/presentation/components/Button';
import GridView from '../../../../core/presentation/components/GridView';
import NftPreview from '../../../nft/presentation/components/NftPreview';
import DataGridLayout from '../../../../core/presentation/components/DataGridLayout';
import AnimationContainer from '../../../../core/presentation/components/AnimationContainer';

import '../styles/page-user-profile.css';
import Chart, { ChartType, createBarChartDataSet, createChartDataSet, createLineChartDataSet, createPieChartDataSet } from '../../../../core/presentation/components/Chart';
import StyledContainer, { ContainerPadding } from '../../../../core/presentation/components/StyledContainer';
import NavRowTabs from '../../../../core/presentation/components/NavRowTabs';

type Props = {
    appStore?: AppStore
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
    const nftFilterModel = userProfilePageStore.nftFilterModel;

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
                    <div className={'FlexRow RightSide'}>
                        <div className={'BorderContainer FlexColumn'}>
                            <div className={'FlexRow BtcEarned'}>
                                <div className={'FlexRow BtcValueRow'}>
                                    <div className={'H2 Bold'}>{userEntity.totalBtcEarned.toFixed(3)}</div>
                                    <div className={'B1 SemiBold'}>BTC</div>
                                </div>
                                <div className={'B3 SemiBold Gray'}>${userEntity.totalBtcEarned.multipliedBy(bitcoinStore.getBitcoinPrice()).toFixed(3)}</div>
                            </div>
                            <div className={'B3 Bold Gray'}>BTC Earned</div>
                        </div>
                        <div className={'BorderContainer FlexColumn'}>
                            <div className={'FlexRow TotalHash'}>
                                <div className={'H2 Bold'}>{userEntity.totalHashPower}</div>
                                <div className={'B1 SemiBold'}> TH/s</div>
                            </div>
                            <div className={'B3 Bold Gray'}>TOTAL CONTRACT HASH POWER</div>
                        </div>
                    </div>
                </div>
                <div className={'FlexRow ProfileNavHolder'}>
                    <div className={'ProfileNav FlexRow B3 SemiBold'}>
                        <div onClick={userProfilePageStore.markNftPage} className={`NavButton Clickable ${S.CSS.getActiveClassName(userProfilePageStore.isNftPage())}`}>My NFTs</div>
                        <div onClick={userProfilePageStore.markEarningsPage} className={`NavButton Clickable ${S.CSS.getActiveClassName(userProfilePageStore.isEarningsPage())}`}>Earnings Info</div>
                        <div onClick={userProfilePageStore.markHistoryPage} className={`NavButton Clickable ${S.CSS.getActiveClassName(userProfilePageStore.isHistoryPage())}`}>History</div>
                    </div>
                </div>

                <AnimationContainer active = { userProfilePageStore.isNftPage() } >
                    {userProfilePageStore.isNftPage() === true && (
                        <DataGridLayout
                            headerLeft = { (
                                <>
                                    <Select
                                        onChange={userProfilePageStore.onChangeSortKey}
                                        value={nftFilterModel.sortKey} >
                                        <MenuItem value = { NftFilterModel.SORT_KEY_NAME }> Name </MenuItem>
                                        <MenuItem value = { NftFilterModel.SORT_KEY_POPULAR }> Popular </MenuItem>
                                    </Select>
                                </>
                            ) }
                            headerRight = { (
                                <Actions
                                    layout={ActionsLayout.LAYOUT_ROW_RIGHT}
                                    height={ActionsHeight.HEIGHT_48} >
                                    <Button
                                        padding={ButtonPadding.PADDING_24}
                                        type={ButtonType.ROUNDED} >
                                    All Filters
                                    </Button>
                                </Actions>
                            ) }>

                            { userProfilePageStore.nftEntities === null && (
                                <LoadingIndicator />
                            ) }

                            { userProfilePageStore.nftEntities !== null && (
                                <GridView
                                    gridViewState={userProfilePageStore.gridViewState}
                                    defaultContent={userProfilePageStore.nftEntities.length === 0 ? <div className={'NoContentFound'}>No Nfts found</div> : null} >
                                    {userProfilePageStore.nftEntities.map((nftEntity: NftEntity) => {
                                        return (
                                            <NftPreview
                                                key={nftEntity.id}
                                                nftEntity={nftEntity}
                                                collectionName={userProfilePageStore.getCollectionName(nftEntity.collectionId)} />
                                        )
                                    })}
                                </GridView>
                            ) }

                        </DataGridLayout>
                    ) }
                </AnimationContainer>

                <AnimationContainer active = { userProfilePageStore.isEarningsPage() } >
                    {userProfilePageStore.isEarningsPage() === true && (
                        <EarningsInfo />
                    ) }
                </AnimationContainer>

                <AnimationContainer active = { userProfilePageStore.isHistoryPage() } >
                    {userProfilePageStore.isHistoryPage() === true && (
                        'history'
                    ) }
                </AnimationContainer>
            </div>

            <PageFooter />
        </PageLayoutComponent>
    )

    function EarningsInfo() {
        return (
            <StyledContainer containerPadding={ContainerPadding.PADDING_24}>

                <div className={'GraphHeader FlexRow'}>
                    <div className={'FlexRow DataRow'}>
                        <div className={'FlexColumn SingleDataColumn'}>
                            <div className={'DataName B1 SemiBold'}>Total BTC Earnings</div>
                            <div className={'DataValue H2 Bold'}>$3.45k</div>
                        </div>
                        <div className={'FlexColumn SingleDataColumn'}>
                            <div className={'DataName B1 SemiBold'}>Total NFTs Bought</div>
                            <div className={'DataValue H2 Bold'}>34</div>
                        </div>
                    </div>
                    <NavRowTabs navTabs={[
                        {
                            navName: 'Today',
                            isActive: analyticsPageStore.isStatsToday(),
                            onClick: analyticsPageStore.setStatsToday,
                        },
                        {
                            navName: '7 Days',
                            isActive: analyticsPageStore.isStatsWeek(),
                            onClick: analyticsPageStore.setStatsWeek,
                        },
                        {
                            navName: '30 Days',
                            isActive: analyticsPageStore.isStatsMonth(),
                            onClick: analyticsPageStore.setStatsMonth,
                        },
                    ]} />
                </div>
                <Chart
                    labels = { getChartLabels() }
                    datasets = { [
                        createBarChartDataSet('set label 1', analyticsPageStore.statistics, '#30425A'),
                    ] }
                    type = { ChartType.BAR } />
            </StyledContainer>

        )
    }

}

export default inject((stores) => stores)(observer(UserProfilePage));
