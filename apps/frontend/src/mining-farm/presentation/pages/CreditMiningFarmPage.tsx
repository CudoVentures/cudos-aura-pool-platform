import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

import CreditMiningFarmPageStore from '../stores/CreditMiningFarmPageStore';
import VisitorStore from '../../../visitor/presentation/stores/VisitorStore';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import AppRoutes from '../../../app-routes/entities/AppRoutes';
import CollectionEntity from '../../../collection/entities/CollectionEntity';
import EditMiningFarmModal from '../components/EditMiningFarmModal';
import EditMiningFarmModalStore from '../stores/EditMiningFarmModalStore';
import ProjectUtils from '../../../core/utilities/ProjectUtils';

import { InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ProfileHeader from '../../../collection/presentation/components/ProfileHeader';
import Breadcrumbs, { createBreadcrumb } from '../../../core/presentation/components/Breadcrumbs';
import PageLayout from '../../../core/presentation/components/PageLayout';
import PageAdminHeader from '../../../layout/presentation/components/PageAdminHeader';
import PageFooter from '../../../layout/presentation/components/PageFooter';
import LoadingIndicator from '../../../core/presentation/components/LoadingIndicator';
import Actions, { ActionsHeight, ActionsLayout } from '../../../core/presentation/components/Actions';
import Button, { ButtonColor, ButtonPadding, ButtonType } from '../../../core/presentation/components/Button';
import GridView from '../../../core/presentation/components/GridView';
import CollectionPreview from '../../../collection/presentation/components/CollectionPreview';
import DataGridLayout from '../../../core/presentation/components/DataGridLayout';
import Svg, { SvgSize } from '../../../core/presentation/components/Svg';
import Input from '../../../core/presentation/components/Input';
import DataPreviewLayout, { createDataPreview } from '../../../core/presentation/components/DataPreviewLayout';
import PageHeader from '../../../layout/presentation/components/PageHeader';
import NoFarmView from '../components/NoFarmView';
import NoCollectionView from '../../../collection/presentation/components/NoCollectionView';
import StyledContainer from '../../../core/presentation/components/StyledContainer';
import Table, { createTableCell, createTableCellString, createTableRow } from '../../../core/presentation/components/Table';
import { ALIGN_CENTER, ALIGN_LEFT, ALIGN_RIGHT } from '../../../core/presentation/components/TableDesktop';
import ColumnLayout from '../../../core/presentation/components/ColumnLayout';
import MiningFarmStatusBadge from '../components/MiningFarmStatusBadge';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import '../styles/page-credit-mining-farm.css';
import AlertStore from '../../../core/presentation/stores/AlertStore';

type Props = {
    creditMiningFarmPageStore?: CreditMiningFarmPageStore,
    accountSessionStore?: AccountSessionStore
    editMiningFarmModalStore?: EditMiningFarmModalStore
    visitorStore?: VisitorStore
    alertStore?: AlertStore,
}

function CreditMiningFarmPage({ creditMiningFarmPageStore, accountSessionStore, editMiningFarmModalStore, visitorStore, alertStore }: Props) {
    const { farmId } = useParams();
    const navigate = useNavigate();

    const miningFarmEntity = creditMiningFarmPageStore.miningFarmEntity;
    const miningFarmDetailsEntity = creditMiningFarmPageStore.miningFarmDetailsEntity;
    const queuedCollectionEntities = creditMiningFarmPageStore.queuedCollectionEntities;
    const approvedCollectionEntities = creditMiningFarmPageStore.approvedCollectionEntities;
    const collectionFilterModel = creditMiningFarmPageStore.collectionFilterModel;

    useEffect(() => {
        async function run() {
            await creditMiningFarmPageStore.init(farmId);
            if (farmId !== undefined) {
                if (creditMiningFarmPageStore.miningFarmEntity !== null) {
                    visitorStore.signalVisitMiningFarm(creditMiningFarmPageStore.miningFarmEntity); // no need to wait for it
                }
            }
        }

        run();
    }, []);

    function onClickNavigateMarketplace() {
        navigate(AppRoutes.MARKETPLACE)
    }

    function onClickNavigateExploreMiningFarms() {
        navigate(AppRoutes.EXPLORE_MINING_FARMS)
    }

    function onClickProfileImages() {
        editMiningFarmModalStore.showSignalWithDefaultCallback(miningFarmEntity);
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

    function onClickViewCollection(collectionEntity: CollectionEntity) {
        navigate(ProjectUtils.makeUrlCollection(collectionEntity.id))
    }

    function onClickMintPresaleNfts() {
        alertStore.show('You are about to mint ALL presale NFTs.', () => {
            creditMiningFarmPageStore.createPresaleCollection();
        }, () => {});
    }

    function renderQueuedCollectionsRows() {
        return queuedCollectionEntities.map((collectionEntity: CollectionEntity) => {
            return createTableRow([
                createTableCell((
                    <div className = { 'FlexRow Bold' } >
                        <div className = { 'QueuedCollectionImg ImgCoverNode' } style = { ProjectUtils.makeBgImgStyle(collectionEntity.coverImgUrl) } />
                        { collectionEntity.name }
                    </div>
                )),
                createTableCellString(creditMiningFarmPageStore.getFloorPrice(collectionEntity.id)),
                createTableCell((
                    <Actions height = { ActionsHeight.HEIGHT_32 }>
                        <Button color = { ButtonColor.SCHEME_GREEN } type = { ButtonType.TEXT_INLINE } onClick = { creditMiningFarmPageStore.onClickApproveCollection.bind(creditMiningFarmPageStore, collectionEntity) }>
                            <Svg svg = { CheckCircleOutlineIcon } />
                            Approve
                        </Button>
                        <Button color = { ButtonColor.SCHEME_RED } type = { ButtonType.TEXT_INLINE } onClick = { creditMiningFarmPageStore.onClickRejectCollection.bind(creditMiningFarmPageStore, collectionEntity) }>
                            <Svg svg = { HighlightOffIcon } />
                            Reject
                        </Button>
                        <Button color = { ButtonColor.SCHEME_2 } type = { ButtonType.TEXT_INLINE } onClick = { onClickViewCollection.bind(null, collectionEntity) }>
                            View
                        </Button>
                    </Actions>
                )),
            ]);
        });
    }

    function renderActiveCollectionsRows() {
        return approvedCollectionEntities.map((collectionEntity: CollectionEntity) => {
            return createTableRow([
                createTableCell((
                    <div className = { 'FlexRow Bold' } >
                        <div className = { 'QueuedCollectionImg ImgCoverNode' } style = { ProjectUtils.makeBgImgStyle(collectionEntity.coverImgUrl) } />
                        { collectionEntity.name }
                    </div>
                )),
                createTableCellString(creditMiningFarmPageStore.getFloorPrice(collectionEntity.id)),
                createTableCell((
                    <Actions height = { ActionsHeight.HEIGHT_32 }>
                        <Button color = { ButtonColor.SCHEME_2 } type = { ButtonType.TEXT_INLINE } onClick = { onClickViewCollection.bind(null, collectionEntity) }>
                            View
                        </Button>
                    </Actions>
                )),
            ])
        });
    }

    function renderDefaultCollectionsView() {
        if (accountSessionStore.isSuperAdmin() === true) {
            return null;
        }

        const collectionEntities = creditMiningFarmPageStore.collectionEntities;
        return (
            <DataGridLayout
                className = { ' CollectionsCnt' }
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

                { collectionEntities === null ? (
                    <LoadingIndicator />
                ) : (
                    <GridView
                        gridViewState={creditMiningFarmPageStore.gridViewState}
                        defaultContent={collectionEntities.length === 0 ? <NoCollectionView /> : null} >
                        { collectionEntities.map((collectionEntity: CollectionEntity, index: number) => {
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
        )
    }

    function renderSuperAdminCollectionsView() {
        if (accountSessionStore.isSuperAdmin() === false) {
            return null;
        }

        return (
            <ColumnLayout>
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
                            showPaging = { true }
                            rows={renderQueuedCollectionsRows()} />
                    ) }
                </StyledContainer>
                <StyledContainer>
                    <div className={'B1 Bold'}>Active Collections</div>
                    { approvedCollectionEntities === null ? (
                        <LoadingIndicator />
                    ) : (
                        <Table
                            legend={['Collection', 'Floor Price', 'Action']}
                            widths={['34%', '51%', '15%']}
                            aligns={[ALIGN_LEFT, ALIGN_LEFT, ALIGN_RIGHT]}
                            tableState={creditMiningFarmPageStore.approvedCollectionsTableState}
                            showPaging = { true }
                            rows={renderActiveCollectionsRows()} />
                    ) }
                </StyledContainer>
            </ColumnLayout>
        )
    }

    return (
        <PageLayout
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
                            { accountSessionStore.isSuperAdmin() === true && (
                                <Actions height={ActionsHeight.HEIGHT_48} layout={ActionsLayout.LAYOUT_ROW_RIGHT}>
                                    <Button
                                        onClick={onClickMintPresaleNfts}
                                        color={ButtonColor.SCHEME_4} >
                                        <Svg size = { SvgSize.CUSTOM } svg={BorderColorIcon} />
                                        Create presale collection
                                    </Button>
                                </Actions>
                            ) }
                            <div className={'MiningFarmNameCnt FlexRow'}>
                                <span className = { 'H2 Bold' }>{miningFarmEntity.name}</span>
                                <MiningFarmStatusBadge className = { 'MiningFarmStatusBadge' } miningFarmEntity = { miningFarmEntity } />
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
                                        { miningFarmEntity.isQueued() === true && accountSessionStore.isSuperAdmin() === true && (
                                            <Actions layout={ActionsLayout.LAYOUT_ROW_CENTER} >
                                                <Button
                                                    padding={ButtonPadding.PADDING_48}
                                                    color={ButtonColor.SCHEME_4}
                                                    onClick={creditMiningFarmPageStore.rejectMiningFarm} >
                                                    <Svg svg={HighlightOffIcon}/>
                                                    Reject Farm
                                                </Button>
                                                {/* <Button
                                                    padding={ButtonPadding.PADDING_48}
                                                    onClick={creditMiningFarmPageStore.approveMiningFarm} >
                                                    <Svg svg={CheckCircleOutlineIcon}/>
                                                    Approve Farm
                                                </Button> */}
                                            </Actions>
                                        ) }
                                    </DataPreviewLayout>
                                ) }
                            </div>
                            { miningFarmEntity.isApproved() === true && (
                                <>
                                    <div className = { 'SectionDivider' } />
                                    <div className={'CollectionsHeader FlexRow'}>
                                        <div className={'H2 Bold'}>Collections Items</div>
                                        { accountSessionStore.isAdmin() === true && (
                                            <Actions height={ActionsHeight.HEIGHT_48} layout={ActionsLayout.LAYOUT_ROW_CENTER}>
                                                <Button onClick={onClickCreateCollection} >
                                                    <Svg svg={AddIcon}/>
                                                    Create Collection
                                                </Button>
                                            </Actions>
                                        ) }
                                    </div>
                                    { renderDefaultCollectionsView() }
                                    { renderSuperAdminCollectionsView() }
                                </>
                            ) }
                        </>
                    ) }
                </div>
            )}
            <PageFooter />
        </PageLayout>
    )
}

export default inject((stores) => stores)(observer(CreditMiningFarmPage));
