import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { useNavigate } from 'react-router-dom';

import ProjectUtils from '../../../core/utilities/ProjectUtils';
import CollectionEntity from '../../entities/CollectionEntity';
import ApprovedCollectionsStore from '../stores/ApprovedCollectionsStore';
import ViewCollectionModalStore from '../stores/ViewCollectionModalStore';

import Actions, { ActionsHeight } from '../../../core/presentation/components/Actions';
import Button, { ButtonColor, ButtonType } from '../../../core/presentation/components/Button';
import LoadingIndicator from '../../../core/presentation/components/LoadingIndicator';
import StyledLayout from '../../../core/presentation/components/StyledLayout';
import Table, { createTableCell, createTableCellString, createTableRow } from '../../../core/presentation/components/Table';
import { ALIGN_LEFT, ALIGN_RIGHT } from '../../../core/presentation/components/TableDesktop';
import Svg from '../../../core/presentation/components/Svg';

import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import '../styles/queued-collections.css';

type Props = {
    approvedCollectionsStore?: ApprovedCollectionsStore;
    viewCollectionModalStore?: ViewCollectionModalStore;
    dashboardMode: boolean;
}

function ApprovedCollections({ approvedCollectionsStore, viewCollectionModalStore, dashboardMode }: Props) {
    const collectionEntities = approvedCollectionsStore.collectionEntities;

    useEffect(() => {
        approvedCollectionsStore.init(dashboardMode === true ? 8 : 12);
    }, [dashboardMode]);

    function onClickCollectionRow(i: number) {
        viewCollectionModalStore.showSignal(collectionEntities[i]);
    }

    // function onClickDelete(collectionEntity: CollectionEntity, e) {
    //     e.stopPropagation();
    //     approvedCollectionsStore.deleteCollection(collectionEntity);
    // }

    function renderCollectionsRows() {
        return collectionEntities.map((collectionEntity) => {
            const collectionDetailsEntity = approvedCollectionsStore.getCollectionDetails(collectionEntity.id);
            return createTableRow([
                createTableCell((
                    <div className={'FlexRow Bold'} >
                        <div className={'QueuedCollectionImg ImgCoverNode'} style={ProjectUtils.makeBgImgStyle(collectionEntity.coverImgUrl)} />
                        {collectionEntity.name}
                    </div>
                )),
                createTableCellString(collectionEntity.getFormattedDescription()),
                createTableCellString(collectionDetailsEntity?.formatFloorPriceInCudos() ?? ''),
                // createTableCell((
                //     <Actions height={ActionsHeight.HEIGHT_32}>
                //         <Button color={ButtonColor.SCHEME_RED} type={ButtonType.TEXT_INLINE} onClick={onClickDelete.bind(null, collectionEntity)}>
                //             <Svg svg={DeleteForeverIcon} />
                //             Delete collection
                //         </Button>
                //     </Actions>
                // )),
            ]);
        });
    }

    return (
        <StyledLayout
            className={'ApprovedCollections'}
            title={'Approved Collections'} >
            {collectionEntities === null ? (
                <LoadingIndicator />
            ) : (
                <Table
                    legend={['Collection', 'Description', 'Floor Price']}
                    widths={['45%', '45%', '10%']}
                    aligns={[ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT]}
                    tableState={approvedCollectionsStore.collectionsTableState}
                    onClickRow={onClickCollectionRow}
                    showPaging={dashboardMode === false}
                    rows={renderCollectionsRows()} />
            )}
        </StyledLayout>
    )
}

export default inject((stores) => stores)(observer(ApprovedCollections));
