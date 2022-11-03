import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { useNavigate, useParams } from 'react-router-dom';

import ProjectUtils from '../../../../core/utilities/ProjectUtils';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import AppRoutes from '../../../app-routes/entities/AppRoutes';
import NftEntity from '../../../nft/entities/NftEntity';
import NftFilterModel from '../../../nft/utilities/NftFilterModel';
import { CollectionStatus } from '../../entities/CollectionEntity';
import { CHAIN_DETAILS } from '../../../../core/utilities/Constants';
import CreditCollectionPageStore from '../stores/CreditCollectionPageStore';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';

import { MenuItem } from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import ProfileHeader from '../components/ProfileHeader';
import Breadcrumbs, { createBreadcrumb } from '../../../../core/presentation/components/Breadcrumbs';
import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';
import Svg from '../../../../core/presentation/components/Svg';
import PageHeader from '../../../header/presentation/components/PageHeader';
import PageFooter from '../../../footer/presentation/components/PageFooter';
import LoadingIndicator from '../../../../core/presentation/components/LoadingIndicator';
import Select from '../../../../core/presentation/components/Select';
import Actions, { ActionsHeight, ActionsLayout } from '../../../../core/presentation/components/Actions';
import Button, { ButtonPadding, ButtonType } from '../../../../core/presentation/components/Button';
import GridView from '../../../../core/presentation/components/GridView';
import NftPreview from '../../../nft/presentation/components/NftPreview';
import DataGridLayout from '../../../../core/presentation/components/DataGridLayout';
import AddIcon from '@mui/icons-material/Add';
import DataPreviewLayout, { createDataPreview } from '../../../../core/presentation/components/DataPreviewLayout';

import '../styles/page-credit-collection.css';

type Props = {
    walletStore?: WalletStore
    creditCollectionPageStore?: CreditCollectionPageStore
    accountSessionStore?: AccountSessionStore
}

function CreditCollectionPage({ creditCollectionPageStore, accountSessionStore, walletStore }: Props) {
    const collectionEntity = creditCollectionPageStore.collectionEntity;
    const miningFarmEntity = creditCollectionPageStore.miningFarmEntity;
    const nftEntities = creditCollectionPageStore.nftEntities;

    const nftFilterModel = creditCollectionPageStore.nftFilterModel;

    const { collectionId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        async function run() {
            await creditCollectionPageStore.init(collectionId);
        }
        run();
    }, []);

    function onClickNavigateMarketplace() {
        navigate(AppRoutes.MARKETPLACE)
    }

    function onClickFarmLink() {
        navigate(`${AppRoutes.CREDIT_MINING_FARM}/${miningFarmEntity.id}`)
    }

    function isCollectionEditable() {
        const adminEntity = accountSessionStore.accountEntity;
        if (miningFarmEntity !== null && adminEntity !== null) {
            return miningFarmEntity.accountId === adminEntity.accountId && collectionEntity.status === CollectionStatus.NOT_SUBMITTED;
        }

        return false
    }

    function onClickAddMoreNfts() {
        navigate(`${AppRoutes.CREDIT_COLLECTION_NFTS}/${collectionEntity.id}`);
    }

    return (
        <PageLayoutComponent className = { 'PageCreditCollection' }>
            <PageHeader />

            { collectionEntity === null && (
                <LoadingIndicator />
            ) }

            { collectionEntity !== null && (
                <div className={'PageContent AppContent'} >

                    <Breadcrumbs crumbs={ [
                        createBreadcrumb('Marketplace', onClickNavigateMarketplace),
                        createBreadcrumb('Collection Details'),
                    ] } />

                    <ProfileHeader
                        className = { 'CollectionImagesCnt' }
                        coverPictureUrl={collectionEntity.coverImgUrl}
                        profilePictureUrl={collectionEntity.profileImgUrl} />

                    <div className={'H2 CollectionHeadingName'}>{collectionEntity.name}</div>

                    <div className={'ProfileInfo Grid'}>
                        <div className={'FlexColumn B1'}>
                            <div className={'Clickable'} onClick={onClickFarmLink}>Farm Owner:  <b>{miningFarmEntity.name}</b></div>
                            <div className={'CollectionDescription'}>{collectionEntity.description}</div>
                        </div>
                        <DataPreviewLayout dataPreviews={[
                            createDataPreview('Floor', creditCollectionPageStore.getFloorNftPrice()),
                            createDataPreview('Volume', creditCollectionPageStore.getNftVolume()),
                            createDataPreview('Items', nftEntities.length),
                            createDataPreview('Owners', creditCollectionPageStore.getOwnersCount()),
                            createDataPreview('Total Hashing Power', collectionEntity.hashRateDisplay()),
                            createDataPreview('Blockchain', CHAIN_DETAILS.CHAIN_NAME[walletStore.selectedNetwork]),
                            createDataPreview(
                                'Address',
                                <div className={'FlexRow'}>
                                    <div className={'Dots'}>{collectionEntity.ownerAddress}</div>
                                    <Svg svg={LaunchIcon}
                                        className={'SVG Icon Clickable '}
                                        onClick={() => ProjectUtils.copyText(collectionEntity.ownerAddress)} />
                                </div>,
                            ),
                        ]} />
                    </div>
                    <div className = { 'SectionDivider' } />
                    <div className={'FlexRow FlexSplit'}>
                        <div className={'H2 Bold'}>Collection Items</div>
                        { isCollectionEditable() === true && (
                            <Actions className = { 'StartRight' }>
                                <Button onClick={onClickAddMoreNfts} >
                                    <Svg svg={AddIcon}/>
                                    Add More NFTs
                                </Button>
                            </Actions>
                        )}
                    </div>
                    <DataGridLayout
                        className = { 'NftsCnt' }
                        headerLeft = { (
                            <>
                                <Select
                                    onChange={creditCollectionPageStore.onChangeSortKey}
                                    value={nftFilterModel.sortKey} >
                                    <MenuItem value = { NftFilterModel.SORT_KEY_NAME } > Name </MenuItem>
                                    <MenuItem value = { NftFilterModel.SORT_KEY_POPULAR } > Popular </MenuItem>
                                </Select>

                            </>
                        ) }
                        headerRight = {
                            <Actions
                                layout={ActionsLayout.LAYOUT_ROW_RIGHT}
                                height={ActionsHeight.HEIGHT_48} >
                                {/* TODO: show all filters */}
                                <Button
                                    padding={ButtonPadding.PADDING_24}
                                    type={ButtonType.ROUNDED}>
                                    All Filters
                                </Button>
                            </Actions>
                        } >

                        { nftEntities === null && (
                            <LoadingIndicator />
                        ) }

                        { nftEntities !== null && (
                            <GridView
                                gridViewState={creditCollectionPageStore.gridViewState}
                                defaultContent={nftEntities.length === 0 ? <div className={'NoContentFound'}>No Nfts found</div> : null}>
                                { nftEntities.map((nftEntity: NftEntity) => {
                                    return (
                                        <NftPreview
                                            key={nftEntity.id}
                                            nftEntity={nftEntity}
                                            collectionName={collectionEntity.name} />
                                    )
                                }) }
                            </GridView>
                        ) }

                    </DataGridLayout>
                </div>
            ) }
            <PageFooter />
        </PageLayoutComponent>

    )
}

export default inject((stores) => stores)(observer(CreditCollectionPage));
