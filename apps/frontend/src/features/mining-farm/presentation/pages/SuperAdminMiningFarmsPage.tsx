import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react'

import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent'
import PageSuperAdminHeader from '../../../header/presentation/components/PageSuperAdminHeader'
import ColumnLayout from '../../../../core/presentation/components/ColumnLayout';
import ChangePasswordModal from '../../../accounts/presentation/components/ChangePasswordModal';
import ViewMiningFarmModal from '../components/ViewMiningFarmModal';
import QueuedMiningFarms from '../components/QueuedMiningFarms';
import SearchIcon from '@mui/icons-material/Search';
import '../styles/page-super-admin-mining-farms.css'
import StyledContainer from '../../../../core/presentation/components/StyledContainer';
import Input from '../../../../core/presentation/components/Input';
import { InputAdornment } from '@mui/material';
import LoadingIndicator from '../../../../core/presentation/components/LoadingIndicator';
import SuperAdminMningFarmsPageStore from '../stores/SuperAdminMningFarmsPageStore';
import Svg from '../../../../core/presentation/components/Svg';
import Table, { createTableCell, createTableCellString, createTableRow } from '../../../../core/presentation/components/Table';
import { ALIGN_LEFT } from '../../../../core/presentation/components/TableDesktop';
import ProjectUtils from '../../../../core/utilities/ProjectUtils';

type Props = {
    superAdminMiningFarmsPageStore: SuperAdminMningFarmsPageStore;
}

function SuperAdminMiningFarmsPage({ superAdminMiningFarmsPageStore }: Props) {
    useEffect(() => {
        superAdminMiningFarmsPageStore.init();
    }, []);

    const { tableState, miningFarmFilterModel, miningFarmEntities, miningFarmDetailsEntities } = superAdminMiningFarmsPageStore;

    function renderAllFarmsRows() {
        return miningFarmEntities.map((miningFarmEntity) => createTableRow([
            createTableCell((
                <div className={'FlexRow FarmNameImageCell'}>
                    <div className={'FarmImage'} style={ProjectUtils.makeBgImgStyle(miningFarmEntity.profileImgUrl)} />
                    <div className={'FarmName'}>{miningFarmEntity.name}</div>
                </div>
            )),
            createTableCell((
                <div className={'FlexColumn FarmVolumeCell'}>
                    <div className={'VolumeCudos'}>3,4K CUDOS</div>
                    <div className={'VolumeDollars'}>$1.4M <span className={'Error60'}>-39.1%</span></div>
                </div>
            )),
            createTableCell((
                <div className={'FlexColumn FloorPrice'}>
                    <div className={'PriceCudos'}>1K CUDOS</div>
                    <div className={'PriceDollars'}>$0.5M</div>
                </div>
            )),
            createTableCellString(miningFarmEntity.formatHashPowerInTh()),
        ]))
    }

    return (
        <PageLayoutComponent
            className = { 'PageSuperAdminMiningFarms' }
            modals = { (
                <>
                    <ChangePasswordModal />
                    <ViewMiningFarmModal />
                </>
            ) } >

            <PageSuperAdminHeader />
            <ColumnLayout className={'PageContent AppContent'} >
                <div className={'H1 ExtraBold'}>Farms</div>
                <QueuedMiningFarms dashboardMode = { false } />
                <StyledContainer>
                    <div className={'TableHeaderRow FlexRow SpaceBetween'}>
                        <div className={'H3 Bold'}>All Farms ({tableState.tableFilterState.total})</div>
                        <Input
                            className={'SearchInput'}
                            placeholder={'Search Farms'}
                            value={miningFarmFilterModel.searchString}
                            onChange={superAdminMiningFarmsPageStore.onChangeSearchWord}
                            InputProps={{
                                startAdornment: <InputAdornment position="start" >
                                    <Svg svg={SearchIcon}/>
                                </InputAdornment>,
                            }}
                        />
                    </div>
                    { miningFarmEntities === null ? (
                        <LoadingIndicator />
                    ) : (
                        <Table
                            className={'WalletEventTable'}
                            legend={['Farm', '24H Volume', 'Floor Price', 'Total Hashrate']}
                            widths={['25%', '15%', '15%', '45%']}
                            aligns={[ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT]}
                            tableState={tableState}
                            rows={renderAllFarmsRows()} />
                    )}
                </StyledContainer>
            </ColumnLayout>

        </PageLayoutComponent>
    )
}

export default inject((stores) => stores)(observer(SuperAdminMiningFarmsPage));
