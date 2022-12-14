import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

import CreditMiningFarmPageStore from '../stores/CreditMiningFarmPageStore';
import VisitorStore from '../../../visitor/presentation/stores/VisitorStore';
import AppStore from '../../../../core/presentation/stores/AppStore';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import AppRoutes from '../../../app-routes/entities/AppRoutes';
import CollectionEntity from '../../../collection/entities/CollectionEntity';
import EditMiningFarmModal from '../components/EditMiningFarmModal';
import EditMiningFarmModalStore from '../stores/EditMiningFarmModalStore';
import ProjectUtils from '../../../../core/utilities/ProjectUtils';

import { InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ProfileHeader from '../../../collection/presentation/components/ProfileHeader';
import Breadcrumbs, { createBreadcrumb } from '../../../../core/presentation/components/Breadcrumbs';
import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';
import PageAdminHeader from '../../../header/presentation/components/PageAdminHeader';
import PageFooter from '../../../footer/presentation/components/PageFooter';
import LoadingIndicator from '../../../../core/presentation/components/LoadingIndicator';
import Actions, { ActionsHeight, ActionsLayout } from '../../../../core/presentation/components/Actions';
import Button, { ButtonColor, ButtonPadding, ButtonRadius, ButtonType } from '../../../../core/presentation/components/Button';
import GridView from '../../../../core/presentation/components/GridView';
import CollectionPreview from '../../../collection/presentation/components/CollectionPreview';
import DataGridLayout from '../../../../core/presentation/components/DataGridLayout';
import Svg, { SvgSize } from '../../../../core/presentation/components/Svg';
import Input from '../../../../core/presentation/components/Input';
import DataPreviewLayout, { createDataPreview } from '../../../../core/presentation/components/DataPreviewLayout';
import PageHeader from '../../../header/presentation/components/PageHeader';
import NoFarmView from '../components/NoFarmView';
import NoCollectionView from '../../../collection/presentation/components/NoCollectionView';
import StyledContainer from '../../../../core/presentation/components/StyledContainer';
import Table, { createTableCell, createTableCellString, createTableRow } from '../../../../core/presentation/components/Table';
import { ALIGN_CENTER, ALIGN_LEFT, ALIGN_RIGHT } from '../../../../core/presentation/components/TableDesktop';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import SvgMiningFarmStatusReview from '../../../../public/assets/vectors/mining-farm-status-review.svg';
import SvgMiningFarmStatusApproved from '../../../../public/assets/vectors/mining-farm-status-approved.svg';
import '../styles/page-credit-mining-farm.css';

type Props = {
    appStore?: AppStore
    creditMiningFarmPageStore?: CreditMiningFarmPageStore,
    accountSessionStore?: AccountSessionStore
    editMiningFarmModalStore?: EditMiningFarmModalStore
    visitorStore?: VisitorStore
}

function CreditMiningFarmPage({ appStore, creditMiningFarmPageStore, accountSessionStore, editMiningFarmModalStore, visitorStore }: Props) {
    const { farmId } = useParams();
    const navigate = useNavigate();

    const miningFarmEntity = creditMiningFarmPageStore.miningFarmEntity;
    const miningFarmDetailsEntity = creditMiningFarmPageStore.miningFarmDetailsEntity;
    const activeCollectionEntities = creditMiningFarmPageStore.collectionEntities;
    const collectionFilterModel = creditMiningFarmPageStore.collectionFilterModel;
    const queuedCollectionEntities = creditMiningFarmPageStore.queuedCollectionEntities;

    useEffect(() => {
        appStore.useLoading(async () => {
            await creditMiningFarmPageStore.init(farmId);
            if (farmId !== undefined) {
                if (creditMiningFarmPageStore.miningFarmEntity !== null) {
                    visitorStore.signalVisitMiningFarm(creditMiningFarmPageStore.miningFarmEntity); // no need to wait for it
                }
            }
        });
    }, []);

    function onClickNavigateMarketplace() {
        navigate(AppRoutes.MARKETPLACE)
    }

    function onClickNavigateExploreMiningFarms() {
        navigate(AppRoutes.EXPLORE_MINING_FARMS)
    }

    function onClickProfileImages() {
        editMiningFarmModalStore.showSignal(miningFarmEntity);
    }

    function onClickEditProfile() {
        navigate(AppRoutes.CREDIT_MINING_FARM_DETAILS);
    }

    function onClickCreateCollection() {
        navigate(AppRoutes.CREDIT_COLLECTION_DETAILS_CREATE);
    }

    function onClickAccountSettings() {
        navigate(AppRoutes.CREDIT_ACCOUNT_SETTINGS);
    }

    function onClickQueuedCollectionRow(index) {
        console.log(index)
    }

    function onClickActiveCollectionRow(index) {
        console.log(index)
    }

    function renderQueuedCollectionsRows() {
        const rows = [];

        queuedCollectionEntities.forEach((collectionEntity: CollectionEntity) => {
            rows.push(
                createTableRow([
                    createTableCell((
                        <div className = { 'FlexRow Bold' } >
                            <div className = { 'QueuedCollectionImg ImgCoverNode' } style = { ProjectUtils.makeBgImgStyle(collectionEntity.coverImgUrl) } />
                            { collectionEntity.name }
                        </div>
                    )),
                    createTableCellString(creditMiningFarmPageStore.getFloorPrice(collectionEntity.id)),
                    createTableCell((
                        <Actions height = { ActionsHeight.HEIGHT_32 }>
                            <Button color = { ButtonColor.SCHEME_GREEN } type = { ButtonType.TEXT_INLINE } onClick = { () => creditMiningFarmPageStore.onClickApproveCollection(collectionEntity) }>
                                <Svg svg = { CheckCircleOutlineIcon } />
                            Approve
                            </Button>
                            <Button color = { ButtonColor.SCHEME_RED } type = { ButtonType.TEXT_INLINE } onClick = { () => creditMiningFarmPageStore.onClickRejectCollection(collectionEntity) }>
                                <Svg svg = { HighlightOffIcon } />
                            Reject
                            </Button>
                        </Actions>
                    )),
                ]),
            )
        });

        return rows;
    }

    function renderActiveCollectionsRows() {
        const rows = [];

        activeCollectionEntities.forEach((collectionEntity: CollectionEntity) => {
            rows.push(
                createTableRow([
                    createTableCell((
                        <div className = { 'FlexRow Bold' } >
                            <div className = { 'QueuedCollectionImg ImgCoverNode' } style = { ProjectUtils.makeBgImgStyle(collectionEntity.coverImgUrl) } />
                            { collectionEntity.name }
                        </div>
                    )),
                    createTableCellString(creditMiningFarmPageStore.getFloorPrice(collectionEntity.id)),
                ]),
            )
        })

        return rows;
    }

    return (
        <PageLayoutComponent
            modals = {
                <>
                    <EditMiningFarmModal />
                </>
            }
            className = { 'PageCreditMiningFarm' } >

            { accountSessionStore.isAdmin() === true ? (
                <PageAdminHeader />
            ) : (
                <PageHeader />
            ) }

            { creditMiningFarmPageStore.inited === false && (
                <LoadingIndicator />
            ) }
            { creditMiningFarmPageStore.inited === true && (
                <div className={'PageContent AppContent'} >
                    { accountSessionStore.isAdmin() === true && miningFarmEntity === null && (
                        <NoFarmView />
                    ) }

                    { accountSessionStore.isAdmin() === false && miningFarmEntity === null && (
                        <LoadingIndicator />
                    ) }

                    { miningFarmEntity && (
                        <>
                            { farmId !== undefined && (
                                <Breadcrumbs crumbs={ [
                                    createBreadcrumb('Marketplace', onClickNavigateMarketplace),
                                    createBreadcrumb('Explore Farms', onClickNavigateExploreMiningFarms),
                                    createBreadcrumb(`Farm Owner: ${miningFarmEntity?.name ?? ''}`),
                                ] } />
                            ) }

                            <ProfileHeader
                                className = { 'FarmImagesCnt' }
                                coverPictureUrl={miningFarmEntity.coverImgUrl}
                                profilePictureUrl={miningFarmEntity.profileImgUrl} />

                            { accountSessionStore.isAdmin() === true && accountSessionStore.accountEntity.accountId === miningFarmEntity.accountId && (
                                <Actions height={ActionsHeight.HEIGHT_48} layout={ActionsLayout.LAYOUT_ROW_RIGHT}>
                                    <Button
                                        onClick={onClickProfileImages}
                                        color={ButtonColor.SCHEME_4} >
                                        <Svg size = { SvgSize.CUSTOM } svg={BorderColorIcon} />
                                    Profile images
                                    </Button>
                                    <Button
                                        onClick={onClickEditProfile}
                                        color={ButtonColor.SCHEME_4} >
                                        <Svg size = { SvgSize.CUSTOM } svg={BorderColorIcon} />
                                    Edit Farm Details
                                    </Button>
                                    <Button
                                        onClick={onClickAccountSettings}
                                        color={ButtonColor.SCHEME_4} >
                                        <Svg size = { SvgSize.CUSTOM } svg={SettingsIcon} />
                                    Account settings
                                    </Button>
                                </Actions>
                            ) }
                            <div className={'MiningFarmNameCnt FlexRow'}>
                                <span className = { 'H2 Bold' }>{miningFarmEntity.name}</span>
                                { miningFarmEntity.isQueued() === true && (
                                    <div className = { 'StatusBadge FlexRow Bold ReviewBadge' } >
                                        <Svg svg = { SvgMiningFarmStatusReview } />
                                        Under review
                                    </div>
                                ) }
                                { miningFarmEntity.isRejected() === true && (
                                    <div className = { 'StatusBadge FlexRow Bold RejectedBadge' } >
                                        <Svg svg = { HighlightOffIcon } />
                                        Rejected
                                    </div>
                                ) }
                                { miningFarmEntity.isApproved() === true && (
                                    <div className = { 'StatusBadge FlexRow Bold ApprovedBadge' } >
                                        <Svg svg = { SvgMiningFarmStatusApproved } />
                                        Verified
                                    </div>
                                ) }
                            </div>
                            <div className={'MiningFarmDataCnt Grid GridColumns2'}>
                                <div className={'FarmDescription'}>{miningFarmEntity.description}</div>
                                { miningFarmDetailsEntity !== null && (
                                    <DataPreviewLayout
                                        dataPreviews = { [
                                            createDataPreview('Total Hashrate', `${miningFarmEntity.formatHashPowerInTh()}`),
                                            createDataPreview('Hashrate (1h average)', miningFarmDetailsEntity.formatHashPowerInTh()),
                                            createDataPreview('Active Workers', miningFarmDetailsEntity.activeWorkers),
                                            createDataPreview('Collections Owned', creditMiningFarmPageStore.gridViewState.getItemCount()),
                                            createDataPreview('NFTs Owned', miningFarmDetailsEntity.nftsOwned),
                                            createDataPreview('Total NFTs Sold', miningFarmDetailsEntity.totalNftsSold),
                                        ] } >
                                        {miningFarmEntity?.isQueued() && accountSessionStore.isSuperAdmin()
                                        && (<Actions layout={ActionsLayout.LAYOUT_ROW_ENDS} >
                                            <Button
                                                radius={ButtonRadius.RADIUS_16}
                                                padding={ButtonPadding.PADDING_48}
                                                color={ButtonColor.SCHEME_2}
                                                onClick={creditMiningFarmPageStore.rejectMiningFarm}
                                            >
                                                <Svg svg={HighlightOffIcon}/>
                                                Reject Farm
                                            </Button>
                                            <Button
                                                radius={ButtonRadius.RADIUS_16}
                                                padding={ButtonPadding.PADDING_48}
                                                onClick={creditMiningFarmPageStore.approveMiningFarm}
                                            >
                                                <Svg svg={CheckCircleOutlineIcon}/>
                                                Approve Farm
                                            </Button>
                                        </Actions>)
                                        }
                                    </DataPreviewLayout>
                                ) }
                            </div>
                            { miningFarmEntity.isApproved() === true && (
                                <>
                                    {accountSessionStore.isSuperAdmin() === true && (
                                        <>
                                            <div className = { 'SectionDivider' } />
                                            <div className={'CollectionsOwnedHeader FlexRow'}>
                                                <div className={'H2 Bold'}>Collections Owned</div>
                                                { accountSessionStore.isAdmin() === true && (
                                                    <Actions height={ActionsHeight.HEIGHT_48} layout={ActionsLayout.LAYOUT_ROW_CENTER}>
                                                        <Button onClick={onClickCreateCollection} >
                                                            <Svg svg={AddIcon}/>
                                            Create Collection
                                                        </Button>
                                                    </Actions>
                                                ) }
                                            </div>
                                            <DataGridLayout
                                                className = { 'CollectionsCnt' }
                                                headerLeft = { (
                                                    <>
                                                        <Input
                                                            className={'SearchBar'}
                                                            value = {collectionFilterModel.searchString}
                                                            onChange = { creditMiningFarmPageStore.onChangeSearchWord }
                                                            placeholder = {'Search Collections name'}
                                                            InputProps={{
                                                                startAdornment: <InputAdornment position="start" >
                                                                    <Svg svg={SearchIcon} />
                                                                </InputAdornment>,
                                                            }} />
                                                    </>
                                                ) } >

                                                { activeCollectionEntities === null && (
                                                    <LoadingIndicator />
                                                ) }

                                                { activeCollectionEntities !== null && (
                                                    <GridView
                                                        gridViewState={creditMiningFarmPageStore.gridViewState}
                                                        defaultContent={activeCollectionEntities.length === 0 ? <NoCollectionView /> : null} >
                                                        { activeCollectionEntities.map((collectionEntity: CollectionEntity, index: number) => {
                                                            return (
                                                                <CollectionPreview
                                                                    key={index}
                                                                    collectionEntity={collectionEntity}
                                                                    miningFarmName={miningFarmEntity.name}
                                                                    displayStatus = { true } />
                                                            )
                                                        }) }
                                                    </GridView>
                                                ) }

                                            </DataGridLayout>
                                        </>
                                    )}
                                    {accountSessionStore.isSuperAdmin() === true && (
                                        <div className={'FlexColumn AdminTablesHolder'}>
                                            <div className={'H2 Bold'}>Collection Items</div>
                                            <StyledContainer>
                                                <div className={'B1 Bold'}>Collections Pending Approval</div>
                                                { queuedCollectionEntities === null ? (
                                                    <LoadingIndicator />
                                                ) : (
                                                    <Table
                                                        legend={['Collection', 'Floor Price', 'Action']}
                                                        widths={['34%', '33%', '33%']}
                                                        aligns={[ALIGN_LEFT, ALIGN_CENTER, ALIGN_RIGHT]}
                                                        tableState={creditMiningFarmPageStore.queuedCollectionsTableState}
                                                        onClickRow = { onClickQueuedCollectionRow }
                                                        showPaging = { true }
                                                        rows={renderQueuedCollectionsRows()} />
                                                ) }
                                            </StyledContainer>
                                            <StyledContainer>
                                                <div className={'B1 Bold'}>Active Collections ({creditMiningFarmPageStore.gridViewState.getItemCount()})</div>
                                                { activeCollectionEntities === null ? (
                                                    <LoadingIndicator />
                                                ) : (
                                                    <Table
                                                        legend={['Collection', 'Floor Price']}
                                                        widths={['34%', '66%']}
                                                        aligns={[ALIGN_LEFT, ALIGN_LEFT]}
                                                        tableState={creditMiningFarmPageStore.gridViewState.tableState}
                                                        onClickRow = { onClickActiveCollectionRow }
                                                        showPaging = { true }
                                                        rows={renderActiveCollectionsRows()} />
                                                ) }
                                            </StyledContainer>
                                        </div>
                                    )}
                                </>
                            ) }
                        </>
                    ) }
                </div>
            )}
            <PageFooter />
        </PageLayoutComponent>
    )
}

export default inject((stores) => stores)(observer(CreditMiningFarmPage));
