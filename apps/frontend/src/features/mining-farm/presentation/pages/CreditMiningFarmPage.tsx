import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

import SearchIcon from '@mui/icons-material/Search';
import CreditMiningFarmPageStore from '../stores/CreditMiningFarmPageStore';
import AppStore from '../../../../core/presentation/stores/AppStore';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import AppRoutes from '../../../app-routes/entities/AppRoutes';
import CollectionEntity from '../../../collection/entities/CollectionEntity';
import EditMiningFarmModal from '../components/EditMiningFarmModal';
import EditMiningFarmModalStore from '../stores/EditMiningFarmModalStore';
import CollectionFilterModel, { CollectionHashPowerFilter } from '../../../collection/utilities/CollectionFilterModel';

import { InputAdornment, MenuItem } from '@mui/material';
import ProfileHeader from '../../../collection/presentation/components/ProfileHeader';
import Breadcrumbs, { createBreadcrumb } from '../../../../core/presentation/components/Breadcrumbs';
import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';
import PageAdminHeader from '../../../header/presentation/components/PageAdminHeader';
import PageFooter from '../../../footer/presentation/components/PageFooter';
import LoadingIndicator from '../../../../core/presentation/components/LoadingIndicator';
import Select from '../../../../core/presentation/components/Select';
import Actions, { ActionsHeight, ActionsLayout } from '../../../../core/presentation/components/Actions';
import Button, { ButtonColor } from '../../../../core/presentation/components/Button';
import GridView from '../../../../core/presentation/components/GridView';
import CollectionPreview from '../../../collection/presentation/components/CollectionPreview';
import DataGridLayout from '../../../../core/presentation/components/DataGridLayout';
import Svg, { SvgSize } from '../../../../core/presentation/components/Svg';
import Input from '../../../../core/presentation/components/Input';
import DataPreviewLayout, { createDataPreview } from '../../../../core/presentation/components/DataPreviewLayout';
import PageHeader from '../../../header/presentation/components/PageHeader';
import NoFarmView from '../components/NoFarmView';
import NoCollectionView from '../../../collection/presentation/components/NoCollectionView';

import BorderColorIcon from '@mui/icons-material/BorderColor';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import '../styles/page-credit-mining-farm.css';

type Props = {
    appStore?: AppStore
    creditMiningFarmPageStore?: CreditMiningFarmPageStore,
    accountSessionStore?: AccountSessionStore
    editMiningFarmModalStore?: EditMiningFarmModalStore
}

function CreditMiningFarmPage({ appStore, creditMiningFarmPageStore, accountSessionStore, editMiningFarmModalStore }: Props) {
    const { farmId } = useParams();
    const navigate = useNavigate();

    const miningFarmEntity = creditMiningFarmPageStore.miningFarmEntity;
    const collectionEntities = creditMiningFarmPageStore.collectionEntities;
    const nftEntities = creditMiningFarmPageStore.nftEntities;
    const collectionFilterModel = creditMiningFarmPageStore.collectionFilterModel;

    useEffect(() => {
        appStore.useLoading(async () => {
            await creditMiningFarmPageStore.init(farmId);
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
        navigate(AppRoutes.CREDIT_COLLECTION_DETAILS);
    }

    function onClickAccountSettings() {
        navigate(AppRoutes.CREDIT_ACCOUNT_SETTINGS);
    }

    return (
        <PageLayoutComponent
            modals = {
                <>
                    <EditMiningFarmModal />
                </>
            }
            className = { 'PageCreditMiningFarm' } >

            { accountSessionStore.isAdmin() === true && (
                <PageAdminHeader />
            ) }
            { accountSessionStore.isAdmin() === false && (
                <PageHeader />
            ) }

            { creditMiningFarmPageStore.inited === false && (
                <LoadingIndicator />
            ) }

            <div className={'PageContent AppContent'} >
                { accountSessionStore.isAdmin() === true && miningFarmEntity === null && (
                    <NoFarmView />
                ) }

                { accountSessionStore.isAdmin() === false && miningFarmEntity === null && (
                    <LoadingIndicator />
                ) }

                { miningFarmEntity !== null && (
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
                                    color={ButtonColor.SCHEME_3} >
                                    <Svg size = { SvgSize.CUSTOM } svg={BorderColorIcon} />
                                    Profile images
                                </Button>
                                <Button
                                    onClick={onClickEditProfile}
                                    color={ButtonColor.SCHEME_3} >
                                    <Svg size = { SvgSize.CUSTOM } svg={BorderColorIcon} />
                                    Edit Farm Details
                                </Button>
                                <Button
                                    onClick={onClickAccountSettings}
                                    color={ButtonColor.SCHEME_3} >
                                    <Svg size = { SvgSize.CUSTOM } svg={SettingsIcon} />
                                    Account settings
                                </Button>
                            </Actions>
                        ) }
                        <div className={'TheMiningFarmName H2 Bold'}>{miningFarmEntity.name}</div>
                        <div className={'ThePageMiningFarmData Grid GridColumns2'}>
                            <div className={'FarmDescription'}>{miningFarmEntity.description}</div>
                            <DataPreviewLayout
                                dataPreviews = { [
                                    createDataPreview('Total Hashrate', `${miningFarmEntity.hashRateTh} TH/s`),
                                    createDataPreview('Hashrate (1h average)', '80.345 EH/s'),
                                    createDataPreview('Active Workers', '1023'),
                                    createDataPreview('Collections Owned', creditMiningFarmPageStore.gridViewState.getItemCount()),
                                    createDataPreview('NFTs Owned', nftEntities.length),
                                    createDataPreview('Total NFTs Sold', '735'),
                                ] } />
                        </div>
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
                                    <Select
                                        label={'Hashing Power'}
                                        onChange={creditMiningFarmPageStore.onChangeHashPowerFilter}
                                        value={collectionFilterModel.hashPowerFilter} >
                                        <MenuItem value = { CollectionHashPowerFilter.NONE } >All </MenuItem>
                                        <MenuItem value = { CollectionHashPowerFilter.BELOW_1000_EH } > Below 1000 EH/s </MenuItem>
                                        <MenuItem value = { CollectionHashPowerFilter.BELOW_2000_EH } > Below 2000 EH/s </MenuItem>
                                        <MenuItem value = { CollectionHashPowerFilter.ABOVE_2000_EH } > Above 2000 EH/s </MenuItem>
                                    </Select>
                                </>
                            ) }
                            headerRight = { (
                                <Select
                                    onChange={creditMiningFarmPageStore.onChangeSortKey}
                                    value={collectionFilterModel.sortKey} >
                                    <MenuItem value = { CollectionFilterModel.SORT_KEY_NAME } > Name </MenuItem>
                                    <MenuItem value = { CollectionFilterModel.SORT_KEY_PRICE } > Price </MenuItem>
                                </Select>
                            ) } >

                            { collectionEntities === null && (
                                <LoadingIndicator />
                            ) }

                            { collectionEntities !== null && (
                                <GridView
                                    gridViewState={creditMiningFarmPageStore.gridViewState}
                                    defaultContent={collectionEntities.length === 0 ? <NoCollectionView /> : null} >
                                    { collectionEntities.map((collectionEntity: CollectionEntity, index: number) => {
                                        return (
                                            <CollectionPreview
                                                key={index}
                                                collectionEntity={collectionEntity}
                                                miningFarmName={creditMiningFarmPageStore.getMiningFarmName(collectionEntity.farmId)} />
                                        )
                                    }) }
                                </GridView>
                            ) }

                        </DataGridLayout>
                    </>
                ) }
            </div>

            <PageFooter />
        </PageLayoutComponent>
    )
}

export default inject((stores) => stores)(observer(CreditMiningFarmPage));
