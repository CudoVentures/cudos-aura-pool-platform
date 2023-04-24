import React, { useEffect } from 'react'
import { inject, observer } from 'mobx-react';
import { useNavigate } from 'react-router-dom';

import AppRoutes from '../../../app-routes/entities/AppRoutes';
import MiningFarmEntity from '../../entities/MiningFarmEntity';
import QueuedMiningFarmsStore from '../stores/QueuedMiningFarmsStore'
import ViewMiningFarmModalStore from '../stores/ViewMiningFarmModalStore';
import AlertStore from '../../../core/presentation/stores/AlertStore';

import LoadingIndicator from '../../../core/presentation/components/LoadingIndicator';
import StyledLayout from '../../../core/presentation/components/StyledLayout';
import Table, { createTableCell, createTableCellString, createTableRow } from '../../../core/presentation/components/Table';
import { ALIGN_LEFT, ALIGN_RIGHT } from '../../../core/presentation/components/TableDesktop';
import Svg from '../../../core/presentation/components/Svg';
import Actions, { ActionsHeight } from '../../../core/presentation/components/Actions';
import Button, { ButtonColor, ButtonPadding, ButtonType } from '../../../core/presentation/components/Button';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import '../styles/queued-mining-farms.css';

type Props = {
    alertStore?: AlertStore;
    queuedMiningFarmsStore?: QueuedMiningFarmsStore;
    viewMiningFarmModalStore?: ViewMiningFarmModalStore;
    dashboardMode: boolean;
};

function QueuedMiningFarms({ alertStore, queuedMiningFarmsStore, viewMiningFarmModalStore, dashboardMode }: Props) {
    const navigate = useNavigate();
    const miningFarmEntities = queuedMiningFarmsStore.miningFarmEntities;

    useEffect(() => {
        queuedMiningFarmsStore.init(dashboardMode === true ? 8 : 12);
    }, [dashboardMode]);

    // this method does not exists because the super admin MUST set some params before approval
    // function onClickApprove(miningFarmEntity: MiningFarmEntity, e) {
    //     // queuedMiningFarmsStore.approveMiningFarm(miningFarmEntity);
    // }

    function onClickReject(miningFarmEntity: MiningFarmEntity, e) {
        e.stopPropagation();
        alertStore.show('You are about to reject a farm. Do you wish to continue', () => {
            queuedMiningFarmsStore.rejectMiningfarm(miningFarmEntity);
        }, () => {});
    }

    function onClickMiningFarmRow(i: number) {
        viewMiningFarmModalStore.showSignal(miningFarmEntities[i].clone(), () => {
            queuedMiningFarmsStore.fetchMiningFarms();
        });
    }

    function onClickSeeAllMiningFarms() {
        navigate(AppRoutes.SUPER_ADMIN_MINING_FARMS);
    }

    function renderMiningFarmsRows() {
        return miningFarmEntities.map((miningFarmEntity: MiningFarmEntity) => {
            return createTableRow([
                createTableCellString(miningFarmEntity.name),
                createTableCellString(miningFarmEntity.legalName),
                createTableCellString(queuedMiningFarmsStore.getManufacturersNames(miningFarmEntity)),
                createTableCellString(queuedMiningFarmsStore.getMinersNames(miningFarmEntity)),
                createTableCellString(queuedMiningFarmsStore.getEnergySourcesNames(miningFarmEntity)),
                createTableCellString(miningFarmEntity.formatHashPowerInTh()),
                createTableCell((
                    <Actions height = { ActionsHeight.HEIGHT_32 }>
                        <Button color = { ButtonColor.SCHEME_GREEN } type = { ButtonType.TEXT_INLINE } >
                            <Svg svg = { CheckCircleOutlineIcon } />
                            Approve
                        </Button>
                        <Button color = { ButtonColor.SCHEME_RED } type = { ButtonType.TEXT_INLINE } onClick = { onClickReject.bind(null, miningFarmEntity) }>
                            <Svg svg = { HighlightOffIcon } />
                            Reject
                        </Button>
                    </Actions>
                )),
            ])
        })
    }

    return (
        <StyledLayout
            className = { 'QueuedMiningFarms' }
            title = { 'Farms Waiting Approval' }
            bottomRightButtons = {
                dashboardMode === false ? null : (
                    <Button padding = { ButtonPadding.PADDING_48 } onClick = { onClickSeeAllMiningFarms }>See All</Button>
                )
            } >
            { miningFarmEntities === null ? (
                <LoadingIndicator />
            ) : (
                <Table
                    legend={['Farm Name', 'Legal Entity Name', 'Manufacturers', 'Miners', 'Energy Sources', 'Hashrate', 'Action']}
                    widths={['13%', '13%', '13%', '13%', '13%', '13%', '22%']}
                    aligns={[ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT, ALIGN_RIGHT]}
                    tableState={queuedMiningFarmsStore.miningFarmsTableState}
                    onClickRow = { onClickMiningFarmRow }
                    showPaging = { dashboardMode === false }
                    rows={renderMiningFarmsRows()} />
            ) }
        </StyledLayout>
    )
}

export default inject((stores) => stores)(observer(QueuedMiningFarms));
