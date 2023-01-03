import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';

import ProjectUtils from '../../../../core/utilities/ProjectUtils';
import RejectedCollectionsStore from '../stores/RejectedCollectionsStore';
import ViewCollectionModalStore from '../stores/ViewCollectionModalStore';

import LoadingIndicator from '../../../../core/presentation/components/LoadingIndicator';
import StyledLayout from '../../../../core/presentation/components/StyledLayout';
import Table, { createTableCell, createTableCellString, createTableRow } from '../../../../core/presentation/components/Table';
import { ALIGN_LEFT } from '../../../../core/presentation/components/TableDesktop';

import '../styles/queued-collections.css';

type Props = {
    rejectedCollectionsStore?: RejectedCollectionsStore;
    viewCollectionModalStore?: ViewCollectionModalStore;
    dashboardMode: boolean;
}

function RejectedCollections({ rejectedCollectionsStore, viewCollectionModalStore, dashboardMode }: Props) {
    const collectionEntities = rejectedCollectionsStore.collectionEntities;

    useEffect(() => {
        rejectedCollectionsStore.init(dashboardMode === true ? 8 : 12);
    }, [dashboardMode]);

    function onClickCollectionRow(i: number) {
        viewCollectionModalStore.showSignal(collectionEntities[i]);
    }

    function renderCollectionsRows() {
        return collectionEntities.map((collectionEntity) => {
            const collectionDetailsEntity = rejectedCollectionsStore.getCollectionDetails(collectionEntity.id);
            return createTableRow([
                createTableCell((
                    <div className={'FlexRow Bold'} >
                        <div className={'QueuedCollectionImg ImgCoverNode'} style={ProjectUtils.makeBgImgStyle(collectionEntity.coverImgUrl)} />
                        {collectionEntity.name}
                    </div>
                )),
                createTableCellString(collectionEntity.description),
                createTableCellString(collectionDetailsEntity?.formatFloorPriceInCudos() ?? ''),
            ]);
        });
    }

    return (
        <StyledLayout
            className={'RejectedCollections'}
            title={'Rejected Collections'} >
            {collectionEntities === null ? (
                <LoadingIndicator />
            ) : (
                <Table
                    legend={['Collection', 'Description', 'Floor Price']}
                    widths={['45%', '45%', '10%']}
                    aligns={[ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT]}
                    tableState={rejectedCollectionsStore.collectionsTableState}
                    onClickRow={onClickCollectionRow}
                    showPaging={dashboardMode === false}
                    rows={renderCollectionsRows()} />
            )}
        </StyledLayout>
    )
}

export default inject((stores) => stores)(observer(RejectedCollections));
