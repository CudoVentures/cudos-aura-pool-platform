import React from 'react';
import { observer } from 'mobx-react';
import { ALIGN_LEFT } from '../../../../../core/presentation/components/TableDesktop';
import UserProfilePageStore from '../../stores/UserProfilePageStore';
import Table, { createTableCell, createTableRow } from '../../../../../core/presentation/components/Table';
import StyledContainer, { ContainerPadding } from '../../../../../core/presentation/components/StyledContainer';
import Select from '../../../../../core/presentation/components/Select';
import { MenuItem } from '@mui/material';
import CollectionEventEntity from '../../../../analytics/entities/CollectionEventEntity';
import CudosStore from '../../../../cudos-data/presentation/stores/CudosStore';
import { EventTypeFilter } from '../../../../analytics/entities/CollectionEventFilterModel';

import '../../styles/history-page.css';

type Props = {
    userProfilePageStore: UserProfilePageStore
    cudosStore: CudosStore
}

function HistoryPage({ userProfilePageStore, cudosStore }: Props) {
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

    function renderCollectionsRows() {
        const rows = [];

        userProfilePageStore.collectionEventEntities.forEach((collectionEventEntity: CollectionEventEntity) => {
            const collectionEntity = userProfilePageStore.getCollectionById(collectionEventEntity.collectionId);
            const rowCells = [];

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

    return (
        <StyledContainer className={'HistoryPage FlexColumn TableContainer'} containerPadding={ContainerPadding.PADDING_24}>
            <div className={'FlexRow TableHeader'}>
                <div className={'H3 Bold'}>Activity on Collections</div>
                <Select
                    className={'TableFilter'}
                    onChange={userProfilePageStore.onChangeTableFilter}
                    value={userProfilePageStore.collectionEventFilterModel.eventType} >
                    <MenuItem value = { EventTypeFilter.ALL }> All Event Types </MenuItem>
                    <MenuItem value = { EventTypeFilter.TRANSFER }> Transfer </MenuItem>
                </Select>
            </div>
            <Table
                className={'ActivityOnCollections'}
                legend={TABLE_LEGEND}
                widths={TABLE_WIDTHS}
                aligns={TABLE_ALINGS}
                tableState={userProfilePageStore.analyticsTableState}
                rows={renderCollectionsRows()}
            />
        </StyledContainer>)
}

export default observer(HistoryPage);
