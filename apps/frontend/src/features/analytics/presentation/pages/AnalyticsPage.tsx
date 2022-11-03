import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';

import S from '../../../../core/utilities/Main';
import AnalyticsPageStore from '../stores/AnalyticsPageStore';
import CudosStore from '../../../cudos-data/presentation/stores/CudosStore';
import { NftEventType } from '../../entities/NftEventEntity';

import MenuItem from '@mui/material/MenuItem/MenuItem';
import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';
import PageFooter from '../../../footer/presentation/components/PageFooter';
import StyledContainer, { ContainerPadding } from '../../../../core/presentation/components/StyledContainer';
import Select from '../../../../core/presentation/components/Select';
import PageAdminHeader from '../../../header/presentation/components/PageAdminHeader';
import ChartHeading from '../components/ChartHeading';
import ChartInfo from '../components/ChartInfo';
import DailyChart from '../components/DailyChart';
import DefaultIntervalPicker from '../components/DefaultIntervalPicker';
import NftEventTable from '../components/NftEventTable';
import LoadingIndicator from '../../../../core/presentation/components/LoadingIndicator';

import '../styles/analytics-page.css';

type Props = {
    analyticsPageStore?: AnalyticsPageStore,
    cudosStore?: CudosStore
}

function MarkedplacePage({ analyticsPageStore, cudosStore }: Props) {
    const { miningFarmEarningsEntity, defaultIntervalPickerState } = analyticsPageStore;

    useEffect(() => {
        async function run() {
            await cudosStore.init();
            await analyticsPageStore.init();
        }
        run();
    }, []);

    return (
        <PageLayoutComponent className = { 'PageAnalytics' } >
            <PageAdminHeader />
            <div className={'PageContent AppContent FlexColumn'} >
                <div className={'H2 Bold'}>Farm Analytics</div>

                { miningFarmEarningsEntity === null ? (
                    <LoadingIndicator />
                ) : (
                    <>
                        <StyledContainer containerPadding = { ContainerPadding.PADDING_24 } >
                            <ChartHeading
                                leftContent = { (
                                    <>
                                        <ChartInfo label = { 'Total Farm Sales'} value = { miningFarmEarningsEntity.formatTotalFarmSalesInUsd()} />
                                        <ChartInfo label = { 'Total NFTs Sold'} value = { miningFarmEarningsEntity.totalNftSold.toString() } />
                                    </>
                                ) }
                                rightContent = { (
                                    <DefaultIntervalPicker defaultIntervalPickerState = { defaultIntervalPickerState } />
                                ) } />
                            <DailyChart
                                timestampFrom = { defaultIntervalPickerState.earningsTimestampFrom }
                                timestampTo = { defaultIntervalPickerState.earningsTimestampTo }
                                data = { miningFarmEarningsEntity.earningsPerDayInUsd } />
                        </StyledContainer>
                        <div className={'Grid GridColumns2 BalancesDataContainer'}>
                            <StyledContainer className={'FlexColumn BalanceColumn'} containerPadding={ContainerPadding.PADDING_24}>
                                <div className={'B1 SemiBold'}>Wallet Balance</div>
                                <div className={'FlexColumn ValueColumn'}>
                                    <div>
                                        <span className={'H2 Bold'}>456,789<span className={'SecondaryColor'}>.123456</span></span>
                                        <span className={'H3 SecondaryColor'}> CUDOS</span>
                                    </div>
                                    <div className={'SecondaryColor H3 Bold'}>$345,678.00</div>
                                </div>
                            </StyledContainer>
                            <StyledContainer className={'FlexColumn BalanceColumn'} containerPadding={ContainerPadding.PADDING_24}>
                                <div className={'B1 SemiBold'}>Maintenance Fee Deposited</div>
                                <div className={'FlexColumn ValueColumn'}>
                                    <div>
                                        <span className={'H2 Bold'}>{miningFarmEarningsEntity.formatMaintenanceFeeDepositedInCudosInt()}<span className={'SecondaryColor'}>.{miningFarmEarningsEntity.formatMaintenanceFeeDepositedInCudosFraction()}</span></span>
                                        <span className={'H3 SecondaryColor'}> CUDOS</span>
                                    </div>
                                    <div className={'SecondaryColor H3 Bold'}>{miningFarmEarningsEntity.formatMaintenanceFeeDepositedInUsd()}</div>
                                </div>
                            </StyledContainer>
                        </div>
                    </>
                ) }

                { analyticsPageStore.nftEventEntities === null ? (
                    <LoadingIndicator />
                ) : (
                    <StyledContainer className={'FlexColumn TableContainer'} containerPadding={ContainerPadding.PADDING_24}>
                        <div className={'FlexRow TableHeader'}>
                            <div className={'H3 Bold'}>Activity on Collections</div>
                            <Select
                                className={'TableFilter'}
                                onChange={analyticsPageStore.onChangeTableFilter}
                                value={analyticsPageStore.nftEventFilterModel.eventType} >
                                <MenuItem value = { S.NOT_EXISTS }> All Event Types </MenuItem>
                                <MenuItem value = { NftEventType.TRANSFER }> Transfer </MenuItem>
                                <MenuItem value = { NftEventType.MINT }> Mint </MenuItem>
                            </Select>
                        </div>
                        <NftEventTable
                            className={'ActivityOnCollections'}
                            tableState={analyticsPageStore.analyticsTableState}
                            nftEventEntities = { analyticsPageStore.nftEventEntities }
                            getNftEntityById = { analyticsPageStore.getNftById } />
                    </StyledContainer>
                ) }

            </div>
            <PageFooter />
        </PageLayoutComponent>
    )
}

export default inject((stores) => stores)(observer(MarkedplacePage));
