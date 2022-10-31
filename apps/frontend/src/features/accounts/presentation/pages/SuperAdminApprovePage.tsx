import React, { useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';

import SuperAdminApprovePageStore from '../stores/SuperAdminApprovePageStore';
import AppStore from '../../../../core/presentation/stores/AppStore';
import TableCell from '../../../../core/entities/TableCell';

import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';
import PageFooter from '../../../footer/presentation/components/PageFooter';
import Table from '../../../../core/presentation/components/Table';
import { ALIGN_CENTER, ALIGN_LEFT } from '../../../../core/presentation/components/TableDesktop';
import Checkbox from '../../../../core/presentation/components/Checkbox';
import TableRow from '../../../../core/entities/TableRow';
import Actions, { ActionsHeight, ActionsLayout } from '../../../../core/presentation/components/Actions';
import Button, { ButtonRadius } from '../../../../core/presentation/components/Button';
import PageSuperAdminHeader from '../../../header/presentation/components/PageSuperAdminHeader';

import '../styles/page-super-admin-approve.css';

type Props = {
    superAdminApprovePageStore?: SuperAdminApprovePageStore;
    appStore?: AppStore;
}

const TABLE_LEGEND = ['name', 'Select'];
const TABLE_WIDTHS = ['80%', '20%']
const TABLE_ALINGS = [
    ALIGN_LEFT,
    ALIGN_CENTER,
]

function SuperAdminApprovePage({ superAdminApprovePageStore, appStore }: Props) {

    const miningFarmEntities = superAdminApprovePageStore.miningFarmEntities;
    const collectionEntities = superAdminApprovePageStore.collectionEntities;

    useEffect(() => {
        appStore.useLoading(() => {
            superAdminApprovePageStore.init();
        })
    }, []);

    function renderFarmsRows() {
        const rows = [];

        miningFarmEntities.forEach((miningFarmEntity) => {
            const rowCells = [];
            rowCells.push(new TableCell(miningFarmEntity.name, 0));
            rowCells.push(new TableCell(
                <Checkbox
                    label={''}
                    value={superAdminApprovePageStore.isMiningFarmEntitySelected(miningFarmEntity.id)}
                    onChange={() => superAdminApprovePageStore.toggleMiningFarmSelection(miningFarmEntity.id)}
                />,
                0,
            ));
            rows.push(new TableRow(rowCells));
        })

        return rows;
    }

    function renderCollectionsRows() {
        const rows = [];

        collectionEntities.forEach((collectionEntity) => {
            const rowCells = [];
            rowCells.push(new TableCell(collectionEntity.name, 0));
            rowCells.push(new TableCell(
                <Checkbox
                    label={''}
                    value={superAdminApprovePageStore.isCollectionEntitySelected(collectionEntity.id)}
                    onChange={() => superAdminApprovePageStore.toggleCollectionSelection(collectionEntity.id)}
                />,
                0,
            ));
            rows.push(new TableRow(rowCells));
        })

        return rows;
    }

    return (
        <PageLayoutComponent
            className = { 'PageSuperAdminApprove' }>

            <PageSuperAdminHeader />
            <div className = { 'PageContent AppContent' } >
                <div className={'FlexRow TableHeader'}>
                    <div className={'H2 Bold'}>Mining Farms of Approval</div>
                    <Actions layout={ActionsLayout.LAYOUT_ROW_CENTER} height={ActionsHeight.HEIGHT_48}>
                        <Button radius={ButtonRadius.RADIUS_16} onClick={superAdminApprovePageStore.approveMiningFarms}>Approve Selected Farms</Button>
                    </Actions>
                </div>
                <Table
                    className={'New Farms'}
                    legend={TABLE_LEGEND}
                    widths={TABLE_WIDTHS}
                    aligns={TABLE_ALINGS}
                    tableState={superAdminApprovePageStore.miningFarmsTableState}
                    rows={renderFarmsRows()}
                />
                <div className={'FlexRow TableHeader'}>
                    <div className={'H1 Bold'}>Collections of Approval</div>
                    <Actions layout={ActionsLayout.LAYOUT_ROW_CENTER} height={ActionsHeight.HEIGHT_48}>
                        <Button radius={ButtonRadius.RADIUS_16} onClick={superAdminApprovePageStore.approveCollections}>Approve Selected Collections</Button>
                    </Actions>
                </div>
                <Table
                    className={'New Collections'}
                    legend={TABLE_LEGEND}
                    widths={TABLE_WIDTHS}
                    aligns={TABLE_ALINGS}
                    tableState={superAdminApprovePageStore.collectionsTableState}
                    rows={renderCollectionsRows()}
                />
            </div>
            <PageFooter />
        </PageLayoutComponent>
    )

}

export default inject((stores) => stores)(observer(SuperAdminApprovePage));
