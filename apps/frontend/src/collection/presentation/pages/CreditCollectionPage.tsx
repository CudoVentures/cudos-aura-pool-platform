import React, { useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { useNavigate, useParams } from 'react-router-dom';

import ProjectUtils from '../../../core/utilities/ProjectUtils';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import AppRoutes from '../../../app-routes/entities/AppRoutes';
import NftEntity from '../../../nft/entities/NftEntity';
import { CHAIN_DETAILS } from '../../../core/utilities/Constants';
import CreditCollectionPageStore from '../stores/CreditCollectionPageStore';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import MintPrivateSaleNftsModal from '../../../nft-presale/presentation/components/MintPrivateSaleNftsModal';
import MintPrivateSaleNftModalStore from '../../../nft-presale/presentation/stores/MintPrivateSaleNftModalStore';

import LaunchIcon from '@mui/icons-material/Launch';
import ProfileHeader from '../components/ProfileHeader';
import Breadcrumbs, { createBreadcrumb } from '../../../core/presentation/components/Breadcrumbs';
import PageLayout from '../../../core/presentation/components/PageLayout';
import Svg, { SvgSize } from '../../../core/presentation/components/Svg';
import PageHeader from '../../../layout/presentation/components/PageHeader';
import PageFooter from '../../../layout/presentation/components/PageFooter';
import LoadingIndicator from '../../../core/presentation/components/LoadingIndicator';
import Actions, { ActionsLayout } from '../../../core/presentation/components/Actions';
import Button, { ButtonColor, ButtonPadding } from '../../../core/presentation/components/Button';
import GridView from '../../../core/presentation/components/GridView';
import NftPreview from '../../../nft/presentation/components/NftPreview';
import DataGridLayout from '../../../core/presentation/components/DataGridLayout';
import AddIcon from '@mui/icons-material/Add';
import DataPreviewLayout, { createDataPreview } from '../../../core/presentation/components/DataPreviewLayout';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CollectionStatusBadge from '../components/CollectionStatusBadge';
import SearchIcon from '@mui/icons-material/Search';

import BorderColorIcon from '@mui/icons-material/BorderColor';
import '../styles/page-credit-collection.css';
import AlertStore from '../../../core/presentation/stores/AlertStore';
import Input, { InputType } from '../../../core/presentation/components/Input';
import { InputAdornment } from '@mui/material';
import NewLine from '../../../core/presentation/components/NewLine';

type Props = {
    walletStore?: WalletStore
    creditCollectionPageStore?: CreditCollectionPageStore
    accountSessionStore?: AccountSessionStore
    mintPrivateSaleNftsModalStore?: MintPrivateSaleNftModalStore
    alertStore?: AlertStore
}

function CreditCollectionPage({ creditCollectionPageStore, accountSessionStore, mintPrivateSaleNftsModalStore, alertStore }: Props) {
    const collectionEntity = creditCollectionPageStore.collectionEntity;
    const collectionDetailsEntity = creditCollectionPageStore.collectionDetailsEntity;
    const miningFarmEntity = creditCollectionPageStore.miningFarmEntity;
    const nftEntities = creditCollectionPageStore.nftEntities;

    const { collectionId } = useParams();
    const navigate = useNavigate();
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
        async function run() {
            await creditCollectionPageStore.init(collectionId);

            if (creditCollectionPageStore.hasAccess() === false) {
                navigate(AppRoutes.HOME);
            }
            setHasAccess(true);
        }

        setHasAccess(false);
        run();
    }, [collectionId]);

    function onClickNavigateMarketplace() {
        navigate(AppRoutes.MARKETPLACE)
    }

    function onClickExploreNfts() {
        navigate(AppRoutes.EXPLORE_NFTS)
    }

    function onClickFarmLink() {
        navigate(ProjectUtils.makeUrlMiningFarm(miningFarmEntity.id));
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

    function onClickMintGiveawayNfts() {
        alertStore.show('You are about to mint the GIVEAWAYS alongside corresponding users accounts. Continue with uploading the JSON data file?', () => {
            mintPrivateSaleNftsModalStore.showSignalForGiveawayNfts(collectionEntity)
        }, () => { });
    }

    function onClickMintPrivateSaleNfts() {
        alertStore.show('You are about to mint the PRIVATE SALE NFTs alongside corresponding users accounts. Continue with uploading the JSON data file?', () => {
            mintPrivateSaleNftsModalStore.showSignalForPrivateSaleNfts(collectionEntity)
        }, () => { });
    }

    return (
        <PageLayout
            className={'PageCreditCollection'}
            modals={(
                <>
                    <MintPrivateSaleNftsModal />
                </>
            )} >
            <PageHeader />

            { (collectionEntity === null || miningFarmEntity === null || nftEntities === null || hasAccess === false) ? (
                <LoadingIndicator />
            ) : (
                <div className={'PageContent AppContent'} >

                    <Breadcrumbs crumbs={[
                        createBreadcrumb('Marketplace', onClickExploreNfts),
                        createBreadcrumb('Collection Details'),
                    ]} />

                    <ProfileHeader
                        className={'CollectionImagesCnt'}
                        coverPictureUrl={collectionEntity.coverImgUrl}
                        profilePictureUrl={collectionEntity.profileImgUrl} />

                    {isCollectionEditable() === true && (
                        <Actions layout={ActionsLayout.LAYOUT_ROW_RIGHT}>
                            <Button
                                onClick={onClickCreditCollectionDetailsEdit} >
                                <Svg size={SvgSize.CUSTOM} svg={BorderColorIcon} />
                                Edit Collection Details
                            </Button>
                        </Actions>
                    )}

                    <div className={'FlexRow NameStatusRow'}>
                        <div className={'H2 CollectionHeadingName'}>{collectionEntity.name}</div>
                        <CollectionStatusBadge className={'CollectionStatusBadge'} collectionEntity={collectionEntity} />
                    </div>
                    <div className={'ProfileInfo Grid'}>
                        <div className={'FlexColumn B1'}>
                            <div className={'Clickable'} onClick={onClickFarmLink}>Collection Owner:  <b className={'ColorPrimary060'}>{miningFarmEntity.name}</b></div>
                            <div className={'CollectionDescription'}><NewLine text = { collectionEntity.description } /></div>
                        </div>
                        {collectionDetailsEntity !== null && (
                            <DataPreviewLayout dataPreviews={[
                                createDataPreview('Floor', collectionDetailsEntity.formatFloorPriceInCudos()),
                                createDataPreview('Volume', collectionDetailsEntity.formatVolumeInCudos()),
                                createDataPreview('Items', creditCollectionPageStore.gridViewState.getItemCount()),
                                createDataPreview('Owners', collectionDetailsEntity.owners),
                                createDataPreview('Total Hashing Power', collectionEntity.formatHashPowerInTh()),
                                createDataPreview('Secondary Resale Royalty', collectionEntity.formatRoyaltiesInPercentage()),
                                createDataPreview('Blockchain', CHAIN_DETAILS.CHAIN_NAME),
                                createDataPreview(
                                    'Address',
                                    <a href={ProjectUtils.makeUrlExplorer(collectionDetailsEntity.cudosAddress)} target='_blank' rel='noreferrer' className={'DataPreviewAddressCnt FlexRow'}>
                                        <div className={'Dots ColorPrimary060'}>{collectionDetailsEntity.cudosAddress}</div>
                                        <Svg svg={LaunchIcon} />
                                    </a>,
                                ),
                            ]} >
                                {accountSessionStore.isSuperAdmin() === true && (
                                    <>
                                        {collectionEntity.isStatusApproved() && (
                                            <Actions layout={ActionsLayout.LAYOUT_COLUMN_FULL} >
                                                <Button
                                                    padding={ButtonPadding.PADDING_48}
                                                    color={ButtonColor.SCHEME_4}
                                                    onClick={onClickMintGiveawayNfts} >
                                                    Mint Giveaways Nfts and Users
                                                </Button>
                                                <Button
                                                    padding={ButtonPadding.PADDING_48}
                                                    color={ButtonColor.SCHEME_4}
                                                    onClick={onClickMintPrivateSaleNfts} >
                                                    Mint Private Sale Nfts and Users
                                                </Button>
                                            </Actions>
                                        )}
                                        {collectionEntity.isStatusQueued() && (
                                            <Actions layout={ActionsLayout.LAYOUT_ROW_CENTER} >
                                                <Button
                                                    padding={ButtonPadding.PADDING_48}
                                                    color={ButtonColor.SCHEME_4}
                                                    onClick={creditCollectionPageStore.rejectCollection} >
                                                    <Svg svg={HighlightOffIcon} />
                                                    Reject Collection
                                                </Button>
                                                <Button
                                                    padding={ButtonPadding.PADDING_48}
                                                    onClick={creditCollectionPageStore.approveCollection} >
                                                    <Svg svg={CheckCircleOutlineIcon} />
                                                    Approve Collection
                                                </Button>
                                            </Actions>
                                        )}
                                    </>
                                )}
                            </DataPreviewLayout>
                        )}
                    </div>
                    <div className={'SectionDivider'} />
                    <div className={'FlexRow FlexSplit'}>
                        <div className={'H2 Bold'}>Collection Items</div>
                        {isCollectionEditable() === true && (
                            <Actions className={'StartRight'}>
                                <Button onClick={onClickAddMoreNfts} >
                                    <Svg svg={AddIcon} />
                                    Add More NFTs
                                </Button>
                            </Actions>
                        )}
                    </div>
                    <DataGridLayout className={'NftsCnt'}>

                        {nftEntities === null && (
                            <LoadingIndicator />
                        )}

                        {nftEntities !== null && (
                            <GridView
                                headerLeft = { (
                                    <>
                                        <Input
                                            inputType={InputType.TEXT}
                                            className={'SearchBar'}
                                            gray={true}
                                            value = {creditCollectionPageStore.nftFilterModel.searchString}
                                            onChange = { creditCollectionPageStore.onChangeSearchWord }
                                            placeholder = {'Search for NFT...'}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start" >
                                                    <Svg svg={SearchIcon} />
                                                </InputAdornment>,
                                            }} />
                                    </>
                                ) }
                                gridViewState={creditCollectionPageStore.gridViewState}
                                defaultContent={nftEntities.length === 0 ? <div className={'NoContentFound'}>No Nfts found</div> : null}>
                                {nftEntities.map((nftEntity: NftEntity) => {
                                    return (
                                        <NftPreview
                                            key={nftEntity.id}
                                            nftEntity={nftEntity}
                                            collectionName={collectionEntity.name} />
                                    )
                                })}
                            </GridView>
                        )}

                    </DataGridLayout>
                </div>
            )}
            <PageFooter />
        </PageLayout>

    )
}

export default inject((stores) => stores)(observer(CreditCollectionPage));
