import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';

import SuperAdminApprovePageStore from '../stores/SuperAdminApprovePageStore';
import AppStore from '../../../../core/presentation/stores/AppStore';

import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';
import PageFooter from '../../../footer/presentation/components/PageFooter';
import Table, { createTableCell, createTableCellString, createTableRow } from '../../../../core/presentation/components/Table';
import { ALIGN_LEFT, ALIGN_RIGHT } from '../../../../core/presentation/components/TableDesktop';
import Checkbox from '../../../../core/presentation/components/Checkbox';
import Actions from '../../../../core/presentation/components/Actions';
import Button from '../../../../core/presentation/components/Button';
import PageSuperAdminHeader from '../../../header/presentation/components/PageSuperAdminHeader';

import '../styles/page-super-admin-approve.css';

type Props = {
    superAdminApprovePageStore?: SuperAdminApprovePageStore;
    appStore?: AppStore;
}

const TABLE_LEGEND = ['name', 'Select'];
const TABLE_WIDTHS = ['80%', '20%']
const TABLE_ALINGS = [ALIGN_LEFT, ALIGN_RIGHT];

function SuperAdminApprovePage({ superAdminApprovePageStore, appStore }: Props) {

    const miningFarmEntities = superAdminApprovePageStore.miningFarmEntities;
    const collectionEntities = superAdminApprovePageStore.collectionEntities;

    useEffect(() => {
        appStore.useLoading(() => {
            superAdminApprovePageStore.init();
        })
    }, []);

    function renderFarmsRows() {
        return miningFarmEntities.map((miningFarmEntity) => {
            return createTableRow([
                createTableCellString(miningFarmEntity.name),
                createTableCell((
                    <Checkbox
                        label={''}
                        value={superAdminApprovePageStore.isMiningFarmEntitySelected(miningFarmEntity.id)}
                        onChange={() => superAdminApprovePageStore.toggleMiningFarmSelection(miningFarmEntity.id)} />
                )),
            ])
        });
    }

    function renderCollectionsRows() {
        return collectionEntities.map((collectionEntity) => {
            return createTableRow([
                createTableCellString(collectionEntity.name),
                createTableCell((
                    <Checkbox
                        label={''}
                        value={superAdminApprovePageStore.isCollectionEntitySelected(collectionEntity.id)}
                        onChange={() => superAdminApprovePageStore.toggleCollectionSelection(collectionEntity.id)} />
                )),
            ])
        });
    }

    return (
        <PageLayoutComponent
            className = { 'PageSuperAdminApprove' }>

            <PageSuperAdminHeader />
            <div className = { 'PageContent AppContent' } >
                <div className={'FlexRow TableHeader'}>
                    <div className={'H2 Bold'}>Mining Farms of Approval</div>
                    <Actions>
                        <Button
                            disabled = { superAdminApprovePageStore.selectedMiningFarmEntities.size === 0 }
                            onClick={superAdminApprovePageStore.approveMiningFarms}>
                            Approve Selected Farms
                        </Button>
                    </Actions>
                </div>
                <Table
                    className={'New Farms'}
                    legend={TABLE_LEGEND}
                    widths={TABLE_WIDTHS}
                    aligns={TABLE_ALINGS}
                    tableState={superAdminApprovePageStore.miningFarmsTableState}
                    rows={renderFarmsRows()} />
                <div className={'FlexRow TableHeader'}>
                    <div className={'H1 Bold'}>Collections of Approval</div>
                    <Actions>
                        <Button
                            disabled = { superAdminApprovePageStore.selectedCollectionEntities.size === 0 }
                            onClick={superAdminApprovePageStore.approveCollections}>
                            Approve Selected Collections
                        </Button>
                    </Actions>
                </div>
                <Table
                    className={'New Collections'}
                    legend={TABLE_LEGEND}
                    widths={TABLE_WIDTHS}
                    aligns={TABLE_ALINGS}
                    tableState={superAdminApprovePageStore.collectionsTableState}
                    rows={renderCollectionsRows()} />
            </div>
            <PageFooter />
        </PageLayoutComponent>
    )

}

export default inject((stores) => stores)(observer(SuperAdminApprovePage));
