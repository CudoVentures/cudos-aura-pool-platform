import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';

import '../styles/analytics-page.css';
import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';
import PageHeader from '../../../header/presentation/components/PageHeader';
import PageFooter from '../../../footer/presentation/components/PageFooter';
import StyledContainer, { ContainerPadding } from '../../../../core/presentation/components/StyledContainer';
import NavRowTabs from '../../../../core/presentation/components/NavRowTabs';
import AnalyticsPageStore from '../stores/AnalyticsPageStore';
import Select from '../../../../core/presentation/components/Select';
import MenuItem from '@mui/material/MenuItem/MenuItem';
import { EventTypeFilter } from '../../entities/CollectionEventFilterModel';
import { ALIGN_LEFT } from '../../../../core/presentation/components/TableDesktop';
import Table, { createTableCell, createTableRow } from '../../../../core/presentation/components/Table';
import CollectionEventEntity from '../../entities/CollectionEventEntity';
import CudosStore from '../../../cudos-data/presentation/stores/CudosStore';
import Chart, { ChartType, createBarChartDataSet } from '../../../../core/presentation/components/Chart';
import moment from 'moment';
import ProjectUtils from '../../../../core/utilities/ProjectUtils';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';

type Props = {
    analyticsPageStore?: AnalyticsPageStore,
    cudosStore?: CudosStore
}

const TABLE_LEGEND = ['Wallet Address', 'Last Activity', 'Item', 'Price', 'Quantity', 'To', 'Time'];
const TABLE_WIDTHS = ['14%', '12%', '18%', '14%', '12%', '14%', '16%']
const TABLE_ALINGS = [
    ALIGN_LEFT,
    ALIGN_LEFT,
    ALIGN_LEFT,
    ALIGN_LEFT,
    ALIGN_LEFT,
    ALIGN_LEFT,
    ALIGN_LEFT,
]

function MarkedplacePage({ analyticsPageStore, cudosStore }: Props) {

    useEffect(() => {
        async function run() {
            await cudosStore.init();
            await analyticsPageStore.init();
        }
        run();
    }, []);

    function renderCollectionsRows() {
        const rows = [];

        analyticsPageStore.collectionEventEntities.forEach((collectionEventEntity: CollectionEventEntity) => {
            const collectionEntity = analyticsPageStore.getCollectionById(collectionEventEntity.collectionId);
            const rowCells = [];
            console.log(collectionEntity);
            rowCells.push(createTableCell(<div className={'Bold Dots AddressCell'}>{collectionEventEntity.fromAddress}</div>, 0));
            rowCells.push(createTableCell(collectionEventEntity.getEventActivityDisplayName(), 0));
            rowCells.push(createTableCell(
                <div className={'FlexRow ItemCell'}>
                    <div className={'PicturePreview'}
                        style={{
                            backgroundImage: `url("${collectionEntity.profileImgUrl}")`,
                        }}
                    />
                    <div>{collectionEntity.name}</div>
                </div>,
                0,
            ));
            rowCells.push(createTableCell(
                <div className={'FlexColumn'}>
                    <div className={'B2 Bold'}>{collectionEventEntity.getTransferPriceDisplay()}</div>
                    <div className={'B3 SemiBold'}>{collectionEventEntity.getTransferPriceUsdDisplay(cudosStore.getCudosPrice())}</div>
                </div>,
                0,
            ));
            rowCells.push(createTableCell(collectionEventEntity.quantity, 0));
            rowCells.push(createTableCell(<div className={'Bold Dots AddressCell'}>{collectionEventEntity.toAddress}</div>, 0));
            rowCells.push(createTableCell(collectionEventEntity.getTimePassedDisplay(), 0));
            rows.push(createTableRow(rowCells));
        })

        return rows;
    }

    function getChartLabels(): string[] {
        if (analyticsPageStore.isStatsToday()) {
            return ['00:00 AM', '04:00 AM', '08:00 AM', '12:00 PM', '16:00 PM', '20:00 PM'];
        }

        if (analyticsPageStore.isStatsWeek()) {
            const labelArray = [];

            for (let i = 7; i >= 0; i--) {
                labelArray.push(moment().subtract(i, 'days').format(ProjectUtils.MOMENT_FORMAT_DATE))
            }

            return labelArray;
        }

        if (analyticsPageStore.isStatsMonth()) {
            const labelArray = [];

            for (let i = 7; i >= 0; i--) {
                labelArray.push(moment().subtract(i * 4, 'days').format(ProjectUtils.MOMENT_FORMAT_DATE))
                labelArray.push('')
                labelArray.push('')
                labelArray.push('')
            }

            return labelArray;
        }

        return [];
    }

    return (
        <PageLayoutComponent className = { 'PageAnalytics' } >
            <PageHeader />
            <div className={'PageContent AppContent FlexColumn'} >
                <div className={'H2 Bold'}>Farm Analytics</div>
                <StyledContainer containerPadding={ContainerPadding.PADDING_24}>

                    <div className={'GraphHeader FlexRow'}>
                        <div className={'FlexRow DataRow'}>
                            <div className={'FlexColumn SingleDataColumn'}>
                                <div className={'DataName B1 SemiBold'}>Total Farm Sales</div>
                                <div className={'DataValue H2 Bold'}>$3.45k</div>
                            </div>
                            <div className={'FlexColumn SingleDataColumn'}>
                                <div className={'DataName B1 SemiBold'}>Total NFTs Sold</div>
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
                                <span className={'H2 Bold'}>456,789<span className={'SecondaryColor'}>.123456</span></span>
                                <span className={'H3 SecondaryColor'}> CUDOS</span>
                            </div>
                            <div className={'SecondaryColor H3 Bold'}>$345,678.00</div>
                        </div>
                    </StyledContainer>
                </div>
                <StyledContainer className={'FlexColumn TableContainer'} containerPadding={ContainerPadding.PADDING_24}>
                    <div className={'FlexRow TableHeader'}>
                        <div className={'H3 Bold'}>Activity on Collections</div>
                        <Select
                            className={'TableFilter'}
                            onChange={analyticsPageStore.onChangeTableFilter}
                            value={analyticsPageStore.collectionEventFilterModel.eventType} >
                            <MenuItem value = { EventTypeFilter.ALL }> All Event Types </MenuItem>
                            <MenuItem value = { EventTypeFilter.TRANSFER }> Transfer </MenuItem>
                        </Select>
                    </div>
                    <Table
                        className={'ActivityOnCollections'}
                        legend={TABLE_LEGEND}
                        widths={TABLE_WIDTHS}
                        aligns={TABLE_ALINGS}
                        tableState={analyticsPageStore.analyticsTableState}
                        rows={renderCollectionsRows()}
                    />
                </StyledContainer>
            </div>
            <PageFooter />
        </PageLayoutComponent>
    )
}

export default inject((stores) => stores)(observer(MarkedplacePage));
