import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react'

import PageLayout from '../../../core/presentation/components/PageLayout'
import PageSuperAdminHeader from '../../../layout/presentation/components/PageSuperAdminHeader'
import ColumnLayout from '../../../core/presentation/components/ColumnLayout';
import ChangePasswordModal from '../../../accounts/presentation/components/ChangePasswordModal';
import StyledContainer, { ContainerPadding } from '../../../core/presentation/components/StyledContainer';

import '../styles/page-super-admin-analytics.css'
import LoadingIndicator from '../../../core/presentation/components/LoadingIndicator';
import ChartHeading from '../components/ChartHeading';
import ChartInfo from '../components/ChartInfo';
import DefaultIntervalPicker from '../components/DefaultIntervalPicker';
import DailyChart from '../components/DailyChart';
import NftEventTable from '../components/NftEventTable';
import SuperAdminAnalyticsPageStore from '../stores/SuperAdminAnalyticsPageStore';
import CudosStore from '../../../cudos-data/presentation/stores/CudosStore';
import Select from '../../../core/presentation/components/Select';
import MenuItem from '@mui/material/MenuItem/MenuItem';
import { NftEventType } from '../../entities/NftEventEntity';
import S from '../../../core/utilities/Main';

type Props = {
    superAdminAnalyticsPageStore?: SuperAdminAnalyticsPageStore;
    cudosStore?: CudosStore,
}

function SuperAdminAnalyticsPage({ superAdminAnalyticsPageStore, cudosStore }: Props) {
    const { totalEarningsEntity, defaultIntervalPickerState, nftEventEntities } = superAdminAnalyticsPageStore;

    useEffect(() => {
        superAdminAnalyticsPageStore.init();
    }, []);

    return (
        <PageLayout
            className = { 'PageSuperAdminAnalytics' }
            modals = { (
                <>
                    <ChangePasswordModal />
                </>
            ) } >

            <PageSuperAdminHeader />
            <ColumnLayout className={'PageContent AppContent'} >
                <div className={'H2 Bold'}>Analytics</div>

                { totalEarningsEntity === null ? (
                    <LoadingIndicator />
                ) : (
                    <>
                        <StyledContainer containerPadding = { ContainerPadding.PADDING_24 } >
                            <ChartHeading
                                leftContent = { (
                                    <>
                                        <ChartInfo label = { 'Total Platform Sales'} value = { cudosStore.formatConvertedAcudosInUsd(totalEarningsEntity.totalSalesInAcudos)} />
                                    </>
                                ) }
                                rightContent = { (
                                    <DefaultIntervalPicker defaultIntervalPickerState = { defaultIntervalPickerState } />
                                ) } />
                            <DailyChart
                                timestampFrom = { defaultIntervalPickerState.earningsTimestampFrom }
                                timestampTo = { defaultIntervalPickerState.earningsTimestampTo }
                                data = { totalEarningsEntity.earningsPerDayInUsd } />
                        </StyledContainer>
                    </>
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
