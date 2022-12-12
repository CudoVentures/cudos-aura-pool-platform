import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { useNavigate, useParams } from 'react-router-dom';

import ProjectUtils from '../../../../core/utilities/ProjectUtils';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import AppRoutes from '../../../app-routes/entities/AppRoutes';
import NftEntity from '../../../nft/entities/NftEntity';
import { CHAIN_DETAILS } from '../../../../core/utilities/Constants';
import CreditCollectionPageStore from '../stores/CreditCollectionPageStore';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';

import LaunchIcon from '@mui/icons-material/Launch';
import ProfileHeader from '../components/ProfileHeader';
import Breadcrumbs, { createBreadcrumb } from '../../../../core/presentation/components/Breadcrumbs';
import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';
import Svg, { SvgSize } from '../../../../core/presentation/components/Svg';
import PageHeader from '../../../header/presentation/components/PageHeader';
import PageFooter from '../../../footer/presentation/components/PageFooter';
import LoadingIndicator from '../../../../core/presentation/components/LoadingIndicator';
import Actions, { ActionsLayout } from '../../../../core/presentation/components/Actions';
import Button from '../../../../core/presentation/components/Button';
import GridView from '../../../../core/presentation/components/GridView';
import NftPreview from '../../../nft/presentation/components/NftPreview';
import DataGridLayout from '../../../../core/presentation/components/DataGridLayout';
import AddIcon from '@mui/icons-material/Add';
import DataPreviewLayout, { createDataPreview } from '../../../../core/presentation/components/DataPreviewLayout';

import BorderColorIcon from '@mui/icons-material/BorderColor';
import '../styles/page-credit-collection.css';

type Props = {
    walletStore?: WalletStore
    creditCollectionPageStore?: CreditCollectionPageStore
    accountSessionStore?: AccountSessionStore
}

function CreditCollectionPage({ creditCollectionPageStore, accountSessionStore, walletStore }: Props) {
    const collectionEntity = creditCollectionPageStore.collectionEntity;
    const collectionDetailsEntity = creditCollectionPageStore.collectionDetailsEntity;
    const miningFarmEntity = creditCollectionPageStore.miningFarmEntity;
    const nftEntities = creditCollectionPageStore.nftEntities;

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
            return miningFarmEntity.accountId === adminEntity.accountId && collectionEntity.isEditable();
        }

        return false
    }

    function onClickAddMoreNfts() {
        navigate(`${AppRoutes.CREDIT_COLLECTION_DETAILS_ADD_NFTS}/${collectionEntity.id}`);
    }

    function onClickCreditCollectionDetailsEdit() {
        navigate(`${AppRoutes.CREDIT_COLLECTION_DETAILS_EDIT}/${collectionEntity.id}`);
    }

    return (
        <PageLayoutComponent className = { 'PageCreditCollection' }>
            <PageHeader />

            { collectionEntity === null || miningFarmEntity === null || nftEntities === null ? (
                <LoadingIndicator />
            ) : (
                <div className={'PageContent AppContent'} >

                    <Breadcrumbs crumbs={ [
                        createBreadcrumb('Marketplace', onClickNavigateMarketplace),
                        createBreadcrumb('Collection Details'),
                    ] } />

                    <ProfileHeader
                        className = { 'CollectionImagesCnt' }
                        coverPictureUrl={collectionEntity.coverImgUrl}
                        profilePictureUrl={collectionEntity.profileImgUrl} />

                    { isCollectionEditable() === true && (
                        <Actions layout={ActionsLayout.LAYOUT_ROW_RIGHT}>
                            <Button
                                onClick={onClickCreditCollectionDetailsEdit} >
                                <Svg size = { SvgSize.CUSTOM } svg={BorderColorIcon} />
                                Edit Collection Details
                            </Button>
                        </Actions>
                    ) }

                    <div className={'FlexRow NameStatusRow'}>
                        <div className={'H2 CollectionHeadingName'}>{collectionEntity.name}</div>
                        {collectionEntity.isStatusQueued() === true && (
                            <div className={'ReviewBadge'}>Under Review</div>
                        )}
                        {collectionEntity.isStatusRejected() === true && (
                            <div className={'RejectedBadge'}>Rejected</div>
                        )}
                    </div>
                    <div className={'ProfileInfo Grid'}>
                        <div className={'FlexColumn B1'}>
                            <div className={'Clickable'} onClick={onClickFarmLink}>Farm Owner:  <b className={ 'ColorPrimaryBlue' }>{miningFarmEntity.name}</b></div>
                            <div className={'CollectionDescription'}>{collectionEntity.description}</div>
                        </div>
                        { collectionDetailsEntity !== null && (
                            <DataPreviewLayout dataPreviews={[
                                createDataPreview('Floor', collectionDetailsEntity.formatFloorPriceInCudos()),
                                createDataPreview('Volume', collectionDetailsEntity.formatVolumeInCudos()),
                                createDataPreview('Items', creditCollectionPageStore.gridViewState.getItemCount()),
                                createDataPreview('Owners', collectionDetailsEntity.owners),
                                createDataPreview('Total Hashing Power', collectionEntity.formatHashPowerInTh()),
                                createDataPreview('Blockchain', CHAIN_DETAILS.CHAIN_NAME),
                                createDataPreview(
                                    'Address',
                                    <div className={'FlexRow'}>
                                        <div className={'Dots ColorPrimaryBlue'}>{collectionDetailsEntity.cudosAddress}</div>
                                        <Svg svg={LaunchIcon}
                                            className={'SVG Icon Clickable '}
                                            onClick={() => ProjectUtils.copyText(collectionDetailsEntity.cudosAddress)} />
                                    </div>,
                                ),
                            ]} />
                        )}
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
                    <DataGridLayout className = { 'NftsCnt' } >

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
            )}
            <PageFooter />
        </PageLayoutComponent>

    )
}

export default inject((stores) => stores)(observer(CreditCollectionPage));
