import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { useNavigate } from 'react-router-dom';

import ProjectUtils from '../../../../core/utilities/ProjectUtils';
import CollectionEntity from '../../entities/CollectionEntity';
import QueuedCollectionsStore from '../stores/QueuedCollectionsStore';
import ViewCollectionModalStore from '../stores/ViewCollectionModalStore';
import AppRoutes from '../../../app-routes/entities/AppRoutes';

import Actions, { ActionsHeight } from '../../../../core/presentation/components/Actions';
import Button, { ButtonColor, ButtonPadding, ButtonType } from '../../../../core/presentation/components/Button';
import LoadingIndicator from '../../../../core/presentation/components/LoadingIndicator';
import StyledLayout from '../../../../core/presentation/components/StyledLayout';
import Table, { createTableCell, createTableCellString, createTableRow } from '../../../../core/presentation/components/Table';
import { ALIGN_LEFT, ALIGN_RIGHT } from '../../../../core/presentation/components/TableDesktop';
import Svg from '../../../../core/presentation/components/Svg';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import '../styles/queued-collections.css';

type Props = {
    queuedCollectionsStore?: QueuedCollectionsStore;
    viewCollectionModalStore?: ViewCollectionModalStore;
    dashboardMode: boolean;
}

function QueuedCollections({ queuedCollectionsStore, viewCollectionModalStore, dashboardMode }: Props) {
    const navigate = useNavigate();
    const collectionEntities = queuedCollectionsStore.collectionEntities;

    useEffect(() => {
        queuedCollectionsStore.init(dashboardMode === true ? 8 : 12);
    }, [dashboardMode]);

    function onClickApprove(collectionEntity: CollectionEntity, e) {
        e.stopPropagation();
        queuedCollectionsStore.approveCollection(collectionEntity);
    }

    function onClickReject(collectionEntity: CollectionEntity, e) {
        e.stopPropagation();
        queuedCollectionsStore.rejectCollection(collectionEntity);
    }

    function onClickCollectionRow(i: number) {
        viewCollectionModalStore.showSignal(collectionEntities[i]);
    }

    function onClickSeeAllCollections() {
        navigate(AppRoutes.SUPER_ADMIN_COLLECTIONS);
    }

    function renderCollectionsRows() {
        return collectionEntities.filter((collectionEntity) => collectionEntity.isStatusQueued()).map((collectionEntity) => {
            const collectionDetailsEntity = queuedCollectionsStore.getCollectionDetails(collectionEntity.id);
            return createTableRow([
                createTableCell((
                    <div className = { 'FlexRow Bold' } >
                        <div className = { 'QueuedCollectionImg ImgCoverNode' } style = { ProjectUtils.makeBgImgStyle(collectionEntity.coverImgUrl) } />
                        { collectionEntity.name }
                    </div>
                )),
                createTableCellString(collectionEntity.description),
                createTableCellString(collectionDetailsEntity?.formatFloorPriceInCudos() ?? ''),
                createTableCell((
                    <Actions height = { ActionsHeight.HEIGHT_32 }>
                        <Button color = { ButtonColor.SCHEME_GREEN } type = { ButtonType.TEXT_INLINE } onClick = { onClickApprove.bind(null, collectionEntity) }>
                            <Svg svg = { CheckCircleOutlineIcon } />
                            Approve
                        </Button>
                        <Button color = { ButtonColor.SCHEME_RED } type = { ButtonType.TEXT_INLINE } onClick = { onClickReject.bind(null, collectionEntity) }>
                            <Svg svg = { HighlightOffIcon } />
                            Reject
                        </Button>
                    </Actions>
                )),
            ]);
        });
    }

    return (
        <StyledLayout
            className = { 'QueuedCollections' }
            title = { 'Collections Waiting Approval' }
            bottomRightButtons = {
                dashboardMode === false ? null : (
                    <Button padding = { ButtonPadding.PADDING_48 } onClick = { onClickSeeAllCollections }>See All</Button>
                )
            } >
            { collectionEntities === null ? (
                <LoadingIndicator />
            ) : (
                <Table
                    legend={['Collection', 'Description', 'Floor Price', 'Action']}
                    widths={['25%', '25%', '10%', '40%']}
                    aligns={[ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT, ALIGN_RIGHT]}
                    tableState={queuedCollectionsStore.collectionsTableState}
                    onClickRow = { onClickCollectionRow }
                    showPaging = { dashboardMode === false }
                    rows={renderCollectionsRows()} />
            ) }
        </StyledLayout>
    )
}

export default inject((stores) => stores)(observer(QueuedCollections));
