import React, { useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';

import S from '../../../../core/utilities/Main';
import ProjectUtils from '../../../../core/utilities/ProjectUtils';
import AnalyticsPageStore from '../stores/AnalyticsPageStore';
import CudosStore from '../../../cudos-data/presentation/stores/CudosStore';
import NftEventEntity, { NftEventType } from '../../entities/NftEventEntity';

import MenuItem from '@mui/material/MenuItem/MenuItem';
import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';
import PageFooter from '../../../footer/presentation/components/PageFooter';
import StyledContainer, { ContainerPadding } from '../../../../core/presentation/components/StyledContainer';
import Select from '../../../../core/presentation/components/Select';
import { ALIGN_LEFT } from '../../../../core/presentation/components/TableDesktop';
import Table, { createTableCell, createTableCellString, createTableRow } from '../../../../core/presentation/components/Table';
import PageAdminHeader from '../../../header/presentation/components/PageAdminHeader';
import ChartHeading from '../components/ChartHeading';
import ChartInfo from '../components/ChartInfo';
import DailyChart from '../components/DailyChart';
import DefaultIntervalPicker, { DefaultIntervalType } from '../components/DefaultIntervalPicker';
import LoadingIndicator from '../../../../core/presentation/components/LoadingIndicator';

import '../styles/analytics-page.css';

type Props = {
    analyticsPageStore?: AnalyticsPageStore,
    cudosStore?: CudosStore
}

const TABLE_LEGEND = ['Wallet Address', 'Last Activity', 'Item', 'Price', 'Quantity', 'To', 'Time'];
const TABLE_WIDTHS = ['14%', '12%', '18%', '14%', '12%', '14%', '16%']
const TABLE_ALINGS = [ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT]

function MarkedplacePage({ analyticsPageStore, cudosStore }: Props) {
    const [defaultIntervalType, setDefaultIntervalType] = useState(DefaultIntervalType.TODAY);
    const miningFarmEarningsEntity = analyticsPageStore.miningFarmEarningsEntity;

    useEffect(() => {
        async function run() {
            await cudosStore.init();
            await analyticsPageStore.init();
        }
        run();
    }, []);

    function onClickToday() {
        setDefaultIntervalType(DefaultIntervalType.TODAY);
        analyticsPageStore.markEarningsTimestampToday();
        analyticsPageStore.fetchEarnings();
    }

    function onClickWeek() {
        setDefaultIntervalType(DefaultIntervalType.WEEK);
        analyticsPageStore.markEarningsTimestampWeek();
        analyticsPageStore.fetchEarnings();
    }

    function onClickMonth() {
        setDefaultIntervalType(DefaultIntervalType.MONTH);
        analyticsPageStore.markEarningsTimestampMonth();
        analyticsPageStore.fetchEarnings();
    }

    function renderCollectionsRows() {
        return analyticsPageStore.nftEventEntities.map((nftEventEntity: NftEventEntity) => {
            const nftEntity = analyticsPageStore.getNftById(nftEventEntity.nftId);

            return createTableRow([
                createTableCell((
                    <div className={'Bold Dots AddressCell'}>{nftEventEntity.fromAddress}</div>
                )),
                createTableCellString(nftEventEntity.getEventActivityDisplayName()),
                createTableCell((
                    <div className={'FlexRow ItemCell'}>
                        <div className={'PicturePreview'} style={ ProjectUtils.makeBgImgStyle(nftEntity?.imageUrl) } />
                        <div>{nftEntity?.name}</div>
                    </div>
                )),
                createTableCell((
                    <div className={'FlexColumn'}>
                        <div className={'B2 Bold'}>{nftEventEntity.getTransferPriceDisplay()}</div>
                        <div className={'B3 SemiBold'}>{nftEventEntity.getTransferPriceUsdDisplay()}</div>
                    </div>
                )),
                createTableCellString(nftEventEntity.quantity.toString()),
                createTableCell((
                    <div className={'Bold Dots AddressCell'}>{nftEventEntity.toAddress}</div>
                )),
                createTableCellString(nftEventEntity.getTimePassedDisplay()),
            ]);
        });
    }

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
                                    <DefaultIntervalPicker
                                        selectedIntervalType = { defaultIntervalType }
                                        onClickToday = { onClickToday }
                                        onClickWeek = { onClickWeek }
                                        onClickMonth = { onClickMonth } />
                                ) } />
                            <DailyChart
                                timestampFrom = { analyticsPageStore.earningsTimestampFrom }
                                timestampTo = { analyticsPageStore.earningsTimestampTo }
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
                        <Table
                            className={'ActivityOnCollections'}
                            legend={TABLE_LEGEND}
                            widths={TABLE_WIDTHS}
                            aligns={TABLE_ALINGS}
                            tableState={analyticsPageStore.analyticsTableState}
                            rows={renderCollectionsRows()} />
                    </StyledContainer>
                ) }

            </div>
            <PageFooter />
        </PageLayoutComponent>
    )
}

export default inject((stores) => stores)(observer(MarkedplacePage));
