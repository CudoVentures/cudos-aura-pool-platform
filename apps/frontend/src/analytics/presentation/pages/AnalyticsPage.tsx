import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';

import S from '../../../core/utilities/Main';
import AnalyticsPageStore from '../stores/AnalyticsPageStore';
import CudosStore from '../../../cudos-data/presentation/stores/CudosStore';
import { NftEventType } from '../../entities/NftEventEntity';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import BitcoinStore from '../../../bitcoin-data/presentation/stores/BitcoinStore';

import MenuItem from '@mui/material/MenuItem/MenuItem';
import PageLayout from '../../../core/presentation/components/PageLayout';
import PageFooter from '../../../layout/presentation/components/PageFooter';
import StyledContainer, { ContainerPadding } from '../../../core/presentation/components/StyledContainer';
import Select from '../../../core/presentation/components/Select';
import PageAdminHeader from '../../../layout/presentation/components/PageAdminHeader';
import ChartHeading from '../components/ChartHeading';
import ChartInfo from '../components/ChartInfo';
import DailyChart from '../components/DailyChart';
import NftEventTable from '../components/NftEventTable';
import LoadingIndicator from '../../../core/presentation/components/LoadingIndicator';

import '../styles/analytics-page.css';
import RangeDatepicker, { RangeDatepickerState } from '../../../core/presentation/components/RangeDatepicker';
import TextWithTooltip from '../../../core/presentation/components/TextWithTooltip';
import BigNumber from 'bignumber.js';
import ProjectUtils from '../../../core/utilities/ProjectUtils';
import RowLayout from '../../../core/presentation/components/RowLayout';
import { EarningsPerDayCurrency } from '../../entities/EarningsPerDayFilterEntity';
import { formatBtc, formatUsd } from '../../../core/utilities/NumberFormatter';

type Props = {
    analyticsPageStore?: AnalyticsPageStore,
    cudosStore?: CudosStore,
    bitcoinStore?: BitcoinStore;
    walletStore?: WalletStore
}

function AnalyticsPage({ analyticsPageStore, cudosStore, bitcoinStore, walletStore }: Props) {
    const { filterCollectionEntities, earningsPerDayFilterEntity, earningsPerDayEntity } = analyticsPageStore;
    const miningFarmMaintenanceFeeEntity = analyticsPageStore.getMiningFarmMaintenanceFee();

    useEffect(() => {
        async function run() {
            await cudosStore.init();
            await bitcoinStore.init();
            await analyticsPageStore.init();
        }
        run();
    }, []);

    function onChangeEarningsRange(startTimestamp, endTimestamp) {
        analyticsPageStore.earningRangeState = new RangeDatepickerState(startTimestamp, endTimestamp);
    }

    function onChangeCollection(value) {
        analyticsPageStore.changeFilterCollection(value);
    }

    function onChangeCurrency(value) {
        analyticsPageStore.changeCurrency(value);
    }

    function renderEarningsTableLeftContent() {
        if (earningsPerDayFilterEntity.isBtc() === true) {
            const miningFarmTotalEarningsBtcEntity = analyticsPageStore.getMiningFarmTotalEarningsBtc();
            return (
                <ChartInfo
                    label = { <TextWithTooltip text={'Unsold NFT earnings'} tooltipText={'Earnings from unsold NFTs'} /> }
                    value = { formatBtc(miningFarmTotalEarningsBtcEntity?.unsoldNftsTotalEarningsInBtc ?? new BigNumber(0), true)} />
            )
        }

        if (earningsPerDayFilterEntity.isCudos() === true) {
            const miningFarmTotalEarningsCudosEntity = analyticsPageStore.getMiningFarmTotalEarningsCudos();
            return (
                <>
                    <ChartInfo
                        label = { <TextWithTooltip text={'Resale royalties'} tooltipText={'NFTs resale royalties'} /> }
                        value = { CudosStore.formatAcudosInCudosWithPrecision(miningFarmTotalEarningsCudosEntity?.resaleRoyaltiesTotalEarningsInAcudos ?? new BigNumber(0), 2)} />
                    <ChartInfo
                        label = { <TextWithTooltip text={'NFT sales'} tooltipText={'Funds from initial NFTs sales'} /> }
                        value = { CudosStore.formatAcudosInCudosWithPrecision(miningFarmTotalEarningsCudosEntity?.soldNftsTotalEarningsInAcudos ?? new BigNumber(0), 2)} />
                </>
            )
        }

        if (earningsPerDayFilterEntity.isUsd() === true) {
            const miningFarmTotalEarningsBtcEntity = analyticsPageStore.getMiningFarmTotalEarningsBtc();
            const miningFarmTotalEarningsCudosEntity = analyticsPageStore.getMiningFarmTotalEarningsCudos();

            const unsoldNftsTotalEarningsInBtc = miningFarmTotalEarningsBtcEntity?.unsoldNftsTotalEarningsInBtc ?? new BigNumber(0);
            const resaleRoyaltiesTotalEarningsInAcudos = miningFarmTotalEarningsCudosEntity?.resaleRoyaltiesTotalEarningsInAcudos ?? new BigNumber(0);
            const soldNftsTotalEarningsInAcudos = miningFarmTotalEarningsCudosEntity?.soldNftsTotalEarningsInAcudos ?? new BigNumber(0);

            const unsoldNftsTotalEarningsInUsd = bitcoinStore.convertBtcInUsd(unsoldNftsTotalEarningsInBtc);
            const resaleRoyaltiesTotalEarningsInUsd = cudosStore.convertAcudosInUsd(resaleRoyaltiesTotalEarningsInAcudos);
            const soldNftsTotalEarningsInUsd = cudosStore.convertAcudosInUsd(soldNftsTotalEarningsInAcudos);
            const totalInUsd = unsoldNftsTotalEarningsInUsd.plus(resaleRoyaltiesTotalEarningsInUsd).plus(soldNftsTotalEarningsInUsd);

            return (
                <ChartInfo
                    label = { <TextWithTooltip text={'Total Sales'} tooltipText={'Unsold NFTs earnings + NFTs resale royalties + initial NFTs sales converted to USD using today\'s exchange rate for both BTC and CUDOS'} /> }
                    value = { formatUsd(totalInUsd.toNumber()) } />
            )
        }

        return null;
    }

    return (
        <PageLayout className = { 'PageAnalytics' } >
            <PageAdminHeader />
            <div className={'PageContent AppContent FlexColumn'} >
                <div className = { 'FlexSplit' } >
                    <div className={'H2 Bold'}>Farm Analytics</div>
                    <RowLayout className = { 'StartRight' } numColumns = { 2 }>
                        <Select
                            className = { 'FilterInput' }
                            label={'Collection'}
                            gray= { true }
                            onChange = { onChangeCollection }
                            value = { earningsPerDayFilterEntity.getSelectedCollection() }>
                            <MenuItem value = { S.Strings.NOT_EXISTS }>All collections</MenuItem>
                            { filterCollectionEntities?.map((collectionEntity) => {
                                return (
                                    <MenuItem key = { collectionEntity.id } value = { collectionEntity.id } >{ collectionEntity.name }</MenuItem>
                                )
                            })}
                        </Select>
                        <Select
                            className = { 'FilterInput' }
                            label={'Currency'}
                            gray= { true }
                            onChange = { onChangeCurrency }
                            value = { earningsPerDayFilterEntity.currency }>
                            <MenuItem value = { EarningsPerDayCurrency.USD }>USD</MenuItem>
                            <MenuItem value = { EarningsPerDayCurrency.BTC }>BTC</MenuItem>
                            <MenuItem value = { EarningsPerDayCurrency.CUDOS }>CUDOS</MenuItem>
                        </Select>
                    </RowLayout>
                </div>

                <StyledContainer containerPadding = { ContainerPadding.PADDING_24 } >
                    <ChartHeading
                        leftContent = { renderEarningsTableLeftContent() }
                        rightContent = { (
                            <RangeDatepicker
                                gray = { true }
                                datepickerState = { analyticsPageStore.earningRangeState }
                                onChange = { onChangeEarningsRange } />
                        ) } />
                    { earningsPerDayEntity === null ? (
                        <LoadingIndicator />
                    ) : (
                        <DailyChart
                            timestampFrom = { analyticsPageStore.earningRangeState.startDate }
                            timestampTo = { analyticsPageStore.earningRangeState.endDate }
                            data = { analyticsPageStore.getEarnings() }
                            yAxisFormatter={ analyticsPageStore.earningsPerDayFilterEntity.isBtc()
                                ? (value) => formatBtc(value, false, 8)
                                : null }
                        />
                    ) }
                </StyledContainer>

                <div className={'Grid GridColumns2 BalancesDataContainer'}>
                    <StyledContainer className={'FlexColumn BalanceColumn'} containerPadding={ContainerPadding.PADDING_24}>
                        <div className={'B1 SemiBold'}>Wallet Balance</div>
                        <div className={'FlexColumn ValueColumn'}>
                            <div>
                                <span className={'H2 Bold'}>{walletStore.formatBalanceInCudosInt()}<span className={'ColorNeutral060'}>.{walletStore.formatBalanceInCudosFraction()}</span></span>
                                <span className={'H3 ColorNeutral060'}> CUDOS</span>
                            </div>
                            <div className={'ColorPrimary060 H3 Bold'}>{cudosStore.formatCudosInUsd(walletStore.getBalanceSafe())}</div>
                        </div>
                    </StyledContainer>
                    <StyledContainer className={'FlexColumn BalanceColumn'} containerPadding={ContainerPadding.PADDING_24}>
                        <div className={'B1 SemiBold'}>
                            Maintenance Fee Deposited
                            { earningsPerDayFilterEntity.isCollection() === true ? ' by Collection' : ' by Farm' }
                        </div>
                        <div className={'FlexColumn ValueColumn'}>
                            { miningFarmMaintenanceFeeEntity === null ? (
                                <LoadingIndicator />
                            ) : (
                                <>
                                    <div>
                                        <span className={'H2 Bold'}>{miningFarmMaintenanceFeeEntity.formatMaintenanceFeeDepositedInBtcInt()}<span className={'ColorNeutral060'}>.{miningFarmMaintenanceFeeEntity.formatMaintenanceFeeDepositedInBtcFraction()}</span></span>
                                        <span className={'H3 ColorNeutral060'}> BTC</span>
                                    </div>
                                    <div className={'ColorPrimary060 H3 Bold'}>{bitcoinStore.formatBtcInUsd(miningFarmMaintenanceFeeEntity.maintenanceFeeInBtc)}</div>
                                </>
                            ) }
                        </div>
                    </StyledContainer>
                </div>

                { analyticsPageStore.nftEventEntities === null ? (
                    <LoadingIndicator />
                ) : (
                    <StyledContainer className={'FlexColumn TableContainer'} containerPadding={ContainerPadding.PADDING_24}>
                        <div className={'FlexRow TableHeader'}>
                            <div className={'H3 Bold'}>Activity on Collections</div>
                            <Select
                                className={'TableFilter'}
                                onChange={analyticsPageStore.onChangeTableFilter}
                                value={analyticsPageStore.eventType} >
                                <MenuItem value = { S.NOT_EXISTS }> All Event Types </MenuItem>
                                <MenuItem value = { NftEventType.TRANSFER }> Transfer </MenuItem>
                                <MenuItem value = { NftEventType.MINT }> Mint </MenuItem>
                                <MenuItem value = { NftEventType.SALE }> Sale </MenuItem>
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
        </PageLayout>
    )
}

export default inject((stores) => stores)(observer(AnalyticsPage));
