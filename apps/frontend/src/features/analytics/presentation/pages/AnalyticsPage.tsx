import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';

import '../styles/analytics-page.css';
import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';
import PageFooter from '../../../footer/presentation/components/PageFooter';
import StyledContainer, { ContainerPadding } from '../../../../core/presentation/components/StyledContainer';
import AnalyticsPageStore from '../stores/AnalyticsPageStore';
import Select from '../../../../core/presentation/components/Select';
import MenuItem from '@mui/material/MenuItem/MenuItem';
import { EventTypeFilter } from '../../entities/CollectionEventFilterModel';
import { ALIGN_LEFT } from '../../../../core/presentation/components/TableDesktop';
import Table, { createTableCell, createTableCellString, createTableRow } from '../../../../core/presentation/components/Table';
import CollectionEventEntity from '../../entities/CollectionEventEntity';
import CudosStore from '../../../cudos-data/presentation/stores/CudosStore';
import ExtendedChart, { createHeaderValueTab } from '../../../../core/presentation/components/ExtendedChart';
import PageAdminHeader from '../../../header/presentation/components/PageAdminHeader';

type Props = {
    analyticsPageStore?: AnalyticsPageStore,
    cudosStore?: CudosStore
}

const TABLE_LEGEND = ['Wallet Address', 'Last Activity', 'Item', 'Price', 'Quantity', 'To', 'Time'];
const TABLE_WIDTHS = ['14%', '12%', '18%', '14%', '12%', '14%', '16%']
const TABLE_ALINGS = [ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT]

function MarkedplacePage({ analyticsPageStore, cudosStore }: Props) {

    useEffect(() => {
        async function run() {
            await cudosStore.init();
            await analyticsPageStore.init();
        }
        run();
    }, []);

    function renderCollectionsRows() {
        return analyticsPageStore.collectionEventEntities.map((collectionEventEntity: CollectionEventEntity) => {
            const collectionEntity = analyticsPageStore.getCollectionById(collectionEventEntity.collectionId);

            return createTableRow([
                createTableCell((
                    <div className={'Bold Dots AddressCell'}>{collectionEventEntity.fromAddress}</div>
                )),
                createTableCellString(collectionEventEntity.getEventActivityDisplayName()),
                createTableCell((
                    <div className={'FlexRow ItemCell'}>
                        <div className={'PicturePreview'}
                            style={{
                                backgroundImage: `url("${collectionEntity?.profileImgUrl}")`,
                            }}
                        />
                        <div>{collectionEntity?.name}</div>
                    </div>
                )),
                createTableCell((
                    <div className={'FlexColumn'}>
                        <div className={'B2 Bold'}>{collectionEventEntity.getTransferPriceDisplay()}</div>
                        <div className={'B3 SemiBold'}>{collectionEventEntity.getTransferPriceUsdDisplay(cudosStore.getCudosPrice())}</div>
                    </div>
                )),
                createTableCellString(collectionEventEntity.quantity.toString()),
                createTableCell((
                    <div className={'Bold Dots AddressCell'}>{collectionEventEntity.toAddress}</div>
                )),
                createTableCellString(collectionEventEntity.getTimePassedDisplay()),
            ]);
        });
    }

    return (
        <PageLayoutComponent className = { 'PageAnalytics' } >
            <PageAdminHeader />
            <div className={'PageContent AppContent FlexColumn'} >
                <div className={'H2 Bold'}>Farm Analytics</div>
                <StyledContainer containerPadding = { ContainerPadding.PADDING_24 } >
                    <ExtendedChart
                        className = { 'TheChart' }
                        headerValueTabs={[
                            createHeaderValueTab('Total Farm Sales', '$3.45k'),
                            createHeaderValueTab('Total NFTs Sold', '34'),
                        ]}
                        extendedChartState={analyticsPageStore.extendedChartState} />
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
