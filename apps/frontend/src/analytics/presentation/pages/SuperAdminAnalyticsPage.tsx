import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react'
import BigNumber from 'bignumber.js';

import S from '../../../core/utilities/Main';
import ProjectUtils from '../../../core/utilities/ProjectUtils';
import SuperAdminAnalyticsPageStore from '../stores/SuperAdminAnalyticsPageStore';
import CudosStore from '../../../cudos-data/presentation/stores/CudosStore';
import { EarningsPerDayCurrency } from '../../entities/EarningsPerDayFilterEntity';
import { NftEventType } from '../../entities/NftEventEntity';
import BitcoinStore from '../../../bitcoin-data/presentation/stores/BitcoinStore';

import MenuItem from '@mui/material/MenuItem/MenuItem';
import PageLayout from '../../../core/presentation/components/PageLayout'
import PageSuperAdminHeader from '../../../layout/presentation/components/PageSuperAdminHeader'
import ColumnLayout from '../../../core/presentation/components/ColumnLayout';
import ChangePasswordModal from '../../../accounts/presentation/components/ChangePasswordModal';
import StyledContainer, { ContainerPadding } from '../../../core/presentation/components/StyledContainer';
import LoadingIndicator from '../../../core/presentation/components/LoadingIndicator';
import ChartHeading from '../components/ChartHeading';
import ChartInfo from '../components/ChartInfo';
import DailyChart from '../components/DailyChart';
import NftEventTable from '../components/NftEventTable';
import Select from '../../../core/presentation/components/Select';
import RangeDatepicker, { RangeDatepickerState } from '../../../core/presentation/components/RangeDatepicker';
import RowLayout from '../../../core/presentation/components/RowLayout';
import TextWithTooltip from '../../../core/presentation/components/TextWithTooltip';

import '../styles/page-super-admin-analytics.css'

type Props = {
    superAdminAnalyticsPageStore?: SuperAdminAnalyticsPageStore;
    bitcoinStore?: BitcoinStore;
    cudosStore?: CudosStore,
}

function SuperAdminAnalyticsPage({ superAdminAnalyticsPageStore, bitcoinStore, cudosStore }: Props) {
    const { filterMiningFarmEntities, filterCollectionEntities, earningsPerDayFilterEntity, earningsPerDayEntity, nftEventEntities } = superAdminAnalyticsPageStore;
    const maintenanceFeeEntity = superAdminAnalyticsPageStore.getMaintenanceFeeEntity();

    useEffect(() => {
        async function run() {
            cudosStore.init();
            bitcoinStore.init();
            superAdminAnalyticsPageStore.init();
        }

        run();
    }, []);

    function onChangeEarningsRange(startTimestamp, endTimestamp) {
        superAdminAnalyticsPageStore.earningRangeState = new RangeDatepickerState(startTimestamp, endTimestamp);
    }

    function onChangeMiningFarm(value) {
        superAdminAnalyticsPageStore.changeFilterMiningFarm(value);
    }

    function onChangeCollection(value) {
        superAdminAnalyticsPageStore.changeFilterCollection(value);
    }

    function onChangeCurrency(value) {
        superAdminAnalyticsPageStore.changeCurrency(value);
    }

    function renderEarningsTableLeftContent() {
        if (earningsPerDayFilterEntity.isPlatform() === true) {
            if (earningsPerDayFilterEntity.isBtc() === true) {
                const platformTotalEarningsBtcEntity = superAdminAnalyticsPageStore.platformTotalEarningsBtcEntity;
                return (
                    <ChartInfo
                        label = { <TextWithTooltip text={'Total Platform NFT fees'} tooltipText={'Platform fee'} /> }
                        value = { BitcoinStore.formatBtc(platformTotalEarningsBtcEntity?.nftFeesTotalEarningsInBtc ?? new BigNumber(0))} />
                )
            }

            if (earningsPerDayFilterEntity.isCudos() === true) {
                const platformTotalEarningsCudosEntity = superAdminAnalyticsPageStore.platformTotalEarningsCudosEntity;
                return (
                    <ChartInfo
                        label = { <TextWithTooltip text={'Resale royalties'} tooltipText={'NFTs resale royalties'} /> }
                        value = { CudosStore.formatAcudosInCudos(platformTotalEarningsCudosEntity?.resaleRoyaltiesTotalEarningsInAcudos ?? new BigNumber(0))} />
                )
            }

            if (earningsPerDayFilterEntity.isUsd() === true) {
                const platformTotalEarningsBtcEntity = superAdminAnalyticsPageStore.platformTotalEarningsBtcEntity;
                const platformTotalEarningsCudosEntity = superAdminAnalyticsPageStore.platformTotalEarningsCudosEntity;

                const nftFeesTotalEarningsInBtc = platformTotalEarningsBtcEntity?.nftFeesTotalEarningsInBtc ?? new BigNumber(0);
                const resaleRoyaltiesTotalEarningsInAcudos = platformTotalEarningsCudosEntity?.resaleRoyaltiesTotalEarningsInAcudos ?? new BigNumber(0);

                const nftFeesTotalEarningsInUsd = bitcoinStore.convertBtcInUsd(nftFeesTotalEarningsInBtc);
                const resaleRoyaltiesTotalEarningsInUsd = cudosStore.convertAcudosInUsd(resaleRoyaltiesTotalEarningsInAcudos);
                const totalInUsd = nftFeesTotalEarningsInUsd.plus(resaleRoyaltiesTotalEarningsInUsd);

                return (
                    <ChartInfo
                        label = { <TextWithTooltip text={'Total Platform Sales'} tooltipText={'Platform fee + NFTs resale royalties converted to USD using today\'s exchange rate for both BTC and CUDOS'} /> }
                        value = { ProjectUtils.formatUsd(totalInUsd) } />
                )
            }
        } else {
            if (earningsPerDayFilterEntity.isBtc() === true) {
                const miningFarmTotalEarningsBtcEntity = superAdminAnalyticsPageStore.getMiningFarmTotalEarningsBtc();
                return (
                    <ChartInfo
                        label = { <TextWithTooltip text={'Unsold NFT earnings'} tooltipText={'Earnings from unsold NFTs'} /> }
                        value = { BitcoinStore.formatBtc(miningFarmTotalEarningsBtcEntity?.unsoftNftsTotalEarningsInBtc ?? new BigNumber(0))} />
                )
            }

            if (earningsPerDayFilterEntity.isCudos() === true) {
                const miningFarmTotalEarningsCudosEntity = superAdminAnalyticsPageStore.getMiningFarmTotalEarningsCudos();
                return (
                    <>
                        <ChartInfo
                            label = { <TextWithTooltip text={'Resale royalties'} tooltipText={'NFTs resale royalties'} /> }
                            value = { BitcoinStore.formatBtc(miningFarmTotalEarningsCudosEntity?.resaleRoyaltiesTotalEarningsInAcudos ?? new BigNumber(0))} />
                        <ChartInfo
                            label = { <TextWithTooltip text={'NFT sales'} tooltipText={'Funds from initial NFTs sales'} /> }
                            value = { BitcoinStore.formatBtc(miningFarmTotalEarningsCudosEntity?.soldNftsTotalEarningsInAcudos ?? new BigNumber(0))} />
                    </>
                )
            }

            if (earningsPerDayFilterEntity.isUsd() === true) {
                const miningFarmTotalEarningsBtcEntity = superAdminAnalyticsPageStore.getMiningFarmTotalEarningsBtc();
                const miningFarmTotalEarningsCudosEntity = superAdminAnalyticsPageStore.getMiningFarmTotalEarningsCudos();

                const unsoftNftsTotalEarningsInBtc = miningFarmTotalEarningsBtcEntity?.unsoftNftsTotalEarningsInBtc ?? new BigNumber(0);
                const resaleRoyaltiesTotalEarningsInAcudos = miningFarmTotalEarningsCudosEntity?.resaleRoyaltiesTotalEarningsInAcudos ?? new BigNumber(0);
                const soldNftsTotalEarningsInAcudos = miningFarmTotalEarningsCudosEntity?.soldNftsTotalEarningsInAcudos ?? new BigNumber(0);

                const unsoftNftsTotalEarningsInUsd = bitcoinStore.convertBtcInUsd(unsoftNftsTotalEarningsInBtc);
                const resaleRoyaltiesTotalEarningsInUsd = cudosStore.convertCudosInUsd(resaleRoyaltiesTotalEarningsInAcudos);
                const soldNftsTotalEarningsInUsd = cudosStore.convertCudosInUsd(soldNftsTotalEarningsInAcudos);
                const totalInUsd = unsoftNftsTotalEarningsInUsd.plus(resaleRoyaltiesTotalEarningsInUsd).plus(soldNftsTotalEarningsInUsd);

                return (
                    <ChartInfo
                        label = { <TextWithTooltip text={'Total Farm Sales'} tooltipText={'Unsold NFTs earnings + NFTs resale royalties + initial NFTs sales converted to USD using today\'s exchange rate for both BTC and CUDOS'} /> }
                        value = { ProjectUtils.formatUsd(totalInUsd) } />
                )
            }
        }

        return null;
    }

    return (
        <PageLayout
            className = { 'PageSuperAdminAnalytics' }
            modals = { (
                <>
                    <ChangePasswordModal />
                </>
            ) } >

            <PageSuperAdminHeader />
            <ColumnLayout className={'PageContent PageContentDefaultPadding AppContent'} >
                <div className = { 'FlexSplit' } >
                    <div className={'H2 Bold'}>Analytics</div>
                    <RowLayout className = { 'StartRight' } numColumns = { filterCollectionEntities !== null ? 3 : 2 }>
                        <Select
                            className = { 'FilterInput' }
                            label={'Farm/Platform'}
                            gray= { true }
                            onChange = { onChangeMiningFarm }
                            value = { earningsPerDayFilterEntity.farmId }>
                            <MenuItem value = { S.Strings.NOT_EXISTS }>Platform</MenuItem>
                            { filterMiningFarmEntities !== null && filterMiningFarmEntities.map((miningFarmEntity) => {
                                return (
                                    <MenuItem key = { miningFarmEntity.id } value = { miningFarmEntity.id } >{ miningFarmEntity.name }</MenuItem>
                                )
                            }) }
                        </Select>
                        { filterCollectionEntities !== null && (
                            <Select
                                className = { 'FilterInput' }
                                label={'Collection'}
                                gray= { true }
                                onChange = { onChangeCollection }
                                value = { earningsPerDayFilterEntity.getSelectedCollection() }>
                                <MenuItem value = { S.Strings.NOT_EXISTS }>All collections</MenuItem>
                                { filterCollectionEntities.map((collectionEntity) => {
                                    return (
                                        <MenuItem key = { collectionEntity.id } value = { collectionEntity.id } >{ collectionEntity.name }</MenuItem>
                                    )
                                })}
                            </Select>
                        ) }
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
                                datepickerState = { superAdminAnalyticsPageStore.earningRangeState }
                                onChange = { onChangeEarningsRange } />
                        ) } />
                    { earningsPerDayEntity === null ? (
                        <LoadingIndicator />
                    ) : (
                        <DailyChart
                            timestampFrom = { superAdminAnalyticsPageStore.earningRangeState.startDate }
                            timestampTo = { superAdminAnalyticsPageStore.earningRangeState.endDate }
                            data = { superAdminAnalyticsPageStore.getEarnings() } />
                    ) }

                </StyledContainer>

                { maintenanceFeeEntity === null ? (
                    <LoadingIndicator />
                ) : (
                    <StyledContainer className={'FlexColumn'} containerPadding={ContainerPadding.PADDING_24}>
                        <div className={'B1 SemiBold'}>
                            Maintenance Fee collected
                            { earningsPerDayFilterEntity.isPlatform() === true ? ' for Cudo' : ' by Farm' }
                        </div>
                        <div className={'FlexColumn'}>
                            <div>
                                <span className={'H2 Bold'}>{maintenanceFeeEntity.formatMaintenanceFeeDepositedInBtcInt()}<span className={'ColorNeutral060'}>.{maintenanceFeeEntity.formatMaintenanceFeeDepositedInBtcFraction()}</span></span>
                                <span className={'H3 ColorNeutral060'}> BTC</span>
                            </div>
                            <div className={'ColorPrimary060 H3 Bold'}>{bitcoinStore.formatBtcInUsd(maintenanceFeeEntity.maintenanceFeeInBtc)}</div>
                        </div>
                    </StyledContainer>
                ) }

                { nftEventEntities === null ? (
                    <LoadingIndicator />
                ) : (
                    <StyledContainer className={'FlexColumn TableContainer'} containerPadding={ContainerPadding.PADDING_24}>
                        <div className={'FlexRow TableHeader'}>
                            <div className={'H3 Bold'}>Activity on Collections</div>
                            <Select
                                className={'TableFilter'}
                                onChange={superAdminAnalyticsPageStore.onChangeTableFilter}
                                value={superAdminAnalyticsPageStore.eventType} >
                                <MenuItem value = { S.NOT_EXISTS }> All Event Types </MenuItem>
                                <MenuItem value = { NftEventType.TRANSFER }> Transfer </MenuItem>
                                <MenuItem value = { NftEventType.MINT }> Mint </MenuItem>
                                <MenuItem value = { NftEventType.SALE }> Sale </MenuItem>
                            </Select>
                        </div>
                        <NftEventTable
                            className={'ActivityOnCollections'}
                            tableState={superAdminAnalyticsPageStore.analyticsTableState}
                            nftEventEntities = { superAdminAnalyticsPageStore.nftEventEntities }
                            getNftEntityById = { superAdminAnalyticsPageStore.getNftById } />
                    </StyledContainer>
                ) }
            </ColumnLayout>

        </PageLayout>
    )
}

export default inject((stores) => stores)(observer(SuperAdminAnalyticsPage));
