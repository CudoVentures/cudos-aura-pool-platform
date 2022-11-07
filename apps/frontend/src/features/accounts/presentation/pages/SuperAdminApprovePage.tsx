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
import ViewCollectionModal from '../../../collection/presentation/components/ViewCollectionModal';
import ViewMiningFarmModal from '../../../mining-farm/presentation/components/ViewMiningFarmModal';
import ViewCollectionModalStore from '../../../collection/presentation/stores/ViewCollectionModalStore';
import ViewMiningFarmModalStore from '../../../mining-farm/presentation/stores/ViewMiningFarmModalStore';

type Props = {
    appStore?: AppStore;
    superAdminApprovePageStore?: SuperAdminApprovePageStore;
    viewMiningFarmModalStore?: ViewMiningFarmModalStore;
    viewCollectionModalStore?: ViewCollectionModalStore;
}

const TABLE_LEGEND = ['name', 'Select'];
const TABLE_WIDTHS = ['80%', '20%']
const TABLE_ALINGS = [ALIGN_LEFT, ALIGN_RIGHT];

function SuperAdminApprovePage({ appStore, superAdminApprovePageStore, viewMiningFarmModalStore, viewCollectionModalStore }: Props) {

    const miningFarmEntities = superAdminApprovePageStore.miningFarmEntities;
    const collectionEntities = superAdminApprovePageStore.collectionEntities;

    useEffect(() => {
        appStore.useLoading(() => {
            superAdminApprovePageStore.init();
        })
    }, []);

    function onClickMiningFarmRow(i: number) {
        viewMiningFarmModalStore.showSignal(miningFarmEntities[i]);
    }

    function onClickSelectMiningFarm(miningFarmEntity, value, e) {
        e.stopPropagation();
        superAdminApprovePageStore.toggleMiningFarmSelection(miningFarmEntity.id);
    }

    function onClickCollectionRow(i: number) {
        viewCollectionModalStore.showSignal(collectionEntities[i]);
    }

    function onClickSelectCollection(collectionEntity, value, e) {
        e.stopPropagation();
        superAdminApprovePageStore.toggleCollectionSelection(collectionEntity.id)
    }

    function renderFarmsRows() {
        return miningFarmEntities.map((miningFarmEntity) => {
            return createTableRow([
                createTableCellString(miningFarmEntity.name),
                createTableCell((
                    <Checkbox
                        label={''}
                        value={superAdminApprovePageStore.isMiningFarmEntitySelected(miningFarmEntity.id)}
                        onChange={onClickSelectMiningFarm.bind(null, miningFarmEntity)} />
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
                        onChange={onClickSelectCollection.bind(null, collectionEntity)} />
                )),
            ])
        });
    }

    return (
        <PageLayoutComponent
            className = { 'PageSuperAdminApprove' }
            modals = { (
                <>
                    <ViewCollectionModal />
                    <ViewMiningFarmModal />
                </>
            ) }>

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
                    onClickRow = { onClickMiningFarmRow }
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
                    onClickRow = { onClickCollectionRow }
                    rows={renderCollectionsRows()} />
            </div>
            <PageFooter />
        </PageLayoutComponent>
    )

}

export default inject((stores) => stores)(observer(SuperAdminApprovePage));
