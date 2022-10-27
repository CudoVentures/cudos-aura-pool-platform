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
import Breadcrumbs from '../../../../core/presentation/components/Breadcrumbs';
import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';
import PageHeader from '../../../header/presentation/components/PageHeader';
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

import BorderColorIcon from '@mui/icons-material/BorderColor';
import AddIcon from '@mui/icons-material/Add';
import SvgGridNoContent from '../../../../public/assets/vectors/grid-no-content.svg';
import SvgNoFarms from '../../../../public/assets/vectors/no-farm.svg';
import SettingsIcon from '@mui/icons-material/Settings';
import '../styles/page-mining-farm-credit.css';
import DataPreviewLayout, { createDataPreview } from '../../../../core/presentation/components/DataPreviewLayout';

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

    const crumbs = [
        { name: 'Marketplace', onClick: () => { navigate(AppRoutes.MARKETPLACE) } },
        { name: 'Explore Farms', onClick: () => { navigate(AppRoutes.EXPLORE_MINING_FARMS) } },
        { name: `Farm Owner: ${miningFarmEntity?.name ?? ''}`, onClick: () => {} },
    ]

    useEffect(() => {
        appStore.useLoading(async () => {
            await creditMiningFarmPageStore.init(farmId);
        });
    }, []);

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
            className = { 'PageMiningFarmCredit' } >
            <PageHeader />

            { creditMiningFarmPageStore.inited === false && (
                <LoadingIndicator />
            ) }

            <div className={'PageContent AppContent'} >
                { miningFarmEntity === null && (
                    <div className = { 'NoFarmCnt FlexSingleCenter' } >
                        <div className = { 'NoFarmLayout FlexColumn' } >
                            <Svg className = { 'SvgNoFarm' } svg = { SvgNoFarms } />
                            <div className = { 'Title H3 Bold' } >No Farm Profile</div>
                            <div className = { 'Subtitle' } > Looks like you haven’t registered your farm yet. </div>
                            <Actions>
                                <Button onClick = { onClickEditProfile } >
                                    <Svg svg = { AddIcon } />
                                    Register Farm
                                </Button>
                            </Actions>
                        </div>
                    </div>
                ) }

                { miningFarmEntity !== null && (
                    <>
                        { farmId !== undefined && (
                            <Breadcrumbs crumbs={crumbs}/>
                        ) }
                        <ProfileHeader coverPictureUrl={miningFarmEntity.coverImgUrl} profilePictureUrl={miningFarmEntity.profileImgUrl} />

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
                        <div className={'H2'}>{miningFarmEntity.name}</div>
                        <div className={'Grid GridColumns2'}>
                            <div className={'FarmDescription'}>{miningFarmEntity.description}</div>
                            {/* TODO: use real data */}
                            <DataPreviewLayout
                                dataPreviews = { [
                                    createDataPreview('Total Hashrate', '102.000 EH/s'),
                                    createDataPreview('Hashrate (1h average)', '80.345 EH/s'),
                                    createDataPreview('Active Workers', '1023'),
                                    createDataPreview('Collections Owned', creditMiningFarmPageStore.gridViewState.getItemCount()),
                                    createDataPreview('NFTs Owned', nftEntities.length),
                                    createDataPreview('Total NFTs Sold', '735'),
                                ] } />
                        </div>
                        <div className={'CollectionsOwnedHeader FlexRow'}>
                            <div className={'H2'}>Collections Owned</div>
                            <Actions height={ActionsHeight.HEIGHT_48} layout={ActionsLayout.LAYOUT_ROW_CENTER}>
                                <Button onClick={onClickCreateCollection} >
                                    <Svg svg={AddIcon}/>
                                Create Collection
                                </Button>
                            </Actions>
                        </div>
                        <DataGridLayout
                            header = { (
                                <div className={'GridFilterHeader'}>
                                    <div className={'LeftHeaderPart FlexRow'}>
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
                                    </div>
                                    <div></div>
                                    <Select
                                        onChange={creditMiningFarmPageStore.onChangeSortKey}
                                        value={collectionFilterModel.sortKey} >
                                        <MenuItem value = { CollectionFilterModel.SORT_KEY_NAME } > Name </MenuItem>
                                        <MenuItem value = { CollectionFilterModel.SORT_KEY_PRICE } > Price </MenuItem>
                                    </Select>
                                </div>
                            ) }>

                            { collectionEntities === null && (
                                <LoadingIndicator />
                            ) }

                            { collectionEntities !== null && (
                                <GridView
                                    gridViewState={creditMiningFarmPageStore.gridViewState}
                                    defaultContent={collectionEntities.length === 0 ? <EmptyGridContent /> : null} >
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

    function EmptyGridContent() {
        return (
            <div className={'NoContentFound FlexColumn'}>
                <Svg svg={SvgGridNoContent} />
                <div className={'H3 Bold'}>No collections in here</div>
                <div className={'B1'}>Looks like you haven’t created collections yet.</div>
                <Actions
                    layout={ActionsLayout.LAYOUT_COLUMN_CENTER}
                    height={ActionsHeight.HEIGHT_48}
                >
                    <Button onClick={onClickCreateCollection}>
                        <Svg svg={AddIcon} />
                        Create First Collection
                    </Button>
                </Actions>
            </div>
        )
    }
}

export default inject((stores) => stores)(observer(CreditMiningFarmPage));
