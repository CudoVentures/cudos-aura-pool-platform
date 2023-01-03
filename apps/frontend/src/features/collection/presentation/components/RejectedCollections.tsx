import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { useNavigate } from 'react-router-dom';

import ProjectUtils from '../../../../core/utilities/ProjectUtils';
import CollectionEntity from '../../entities/CollectionEntity';
import RejectedCollectionsStore from '../stores/RejectedCollectionsStore';
import ViewCollectionModalStore from '../stores/ViewCollectionModalStore';
import AppRoutes from '../../../app-routes/entities/AppRoutes';

import Actions, { ActionsHeight } from '../../../../core/presentation/components/Actions';
import Button, { ButtonColor, ButtonPadding, ButtonType } from '../../../../core/presentation/components/Button';
import LoadingIndicator from '../../../../core/presentation/components/LoadingIndicator';
import StyledLayout from '../../../../core/presentation/components/StyledLayout';
import Table, { createTableCell, createTableCellString, createTableRow } from '../../../../core/presentation/components/Table';
import { ALIGN_LEFT, ALIGN_RIGHT } from '../../../../core/presentation/components/TableDesktop';
import Svg from '../../../../core/presentation/components/Svg';

import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
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
            title={'Collections Waiting Approval'} >
            {collectionEntities === null ? (
                <LoadingIndicator />
            ) : (
                <Table
                    legend={['Collection', 'Description', 'Floor Price', 'Action']}
                    widths={['25%', '25%', '10%', '40%']}
                    aligns={[ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT, ALIGN_RIGHT]}
                    tableState={rejectedCollectionsStore.collectionsTableState}
                    onClickRow={onClickCollectionRow}
                    showPaging={dashboardMode === false}
                    rows={renderCollectionsRows()} />
            )}
        </StyledLayout>
    )
}

export default inject((stores) => stores)(observer(RejectedCollections));
