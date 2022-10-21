import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { useNavigate, useParams } from 'react-router-dom';

import ProjectUtils from '../../../../core/utilities/ProjectUtils';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import AppRoutes from '../../../app-routes/entities/AppRoutes';
import NftEntity from '../../../nft/entities/NftEntity';
import NftFilterModel from '../../../nft/utilities/NftFilterModel';
import { CollectionStatus } from '../../entities/CollectionEntity';

import { MenuItem } from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import ProfileHeader from '../components/ProfileHeader';
import Breadcrumbs from '../../../../core/presentation/components/Breadcrumbs';
import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';
import Svg from '../../../../core/presentation/components/Svg';
import PageHeader from '../../../header/presentation/components/PageHeader';
import PageFooter from '../../../footer/presentation/components/PageFooter';
import LoadingIndicator from '../../../../core/presentation/components/LoadingIndicator';
import Select from '../../../../core/presentation/components/Select';
import Actions, { ActionsHeight, ActionsLayout } from '../../../../core/presentation/components/Actions';
import Button, { BUTTON_PADDING, BUTTON_RADIUS, BUTTON_TYPE } from '../../../../core/presentation/components/Button';
import GridView from '../../../../core/presentation/components/GridView';
import NftPreview from '../../../nft/presentation/components/NftPreview';
import DataGridLayout from '../../../../core/presentation/components/DataGridLayout';
import AddIcon from '@mui/icons-material/Add';

import '../styles/page-collection-credit-component.css';
import CreditCollectionPageStore from '../stores/CreditCollectionPageStore';

type Props = {
    creditCollectionPageStore?: CreditCollectionPageStore
    accountSessionStore?: AccountSessionStore
}

function creditCollectionPage({ creditCollectionPageStore, accountSessionStore }: Props) {
    const collectionEntity = creditCollectionPageStore.collectionEntity;
    const miningFarmEntity = creditCollectionPageStore.miningFarmEntity;
    const nftFilterModel = creditCollectionPageStore.nftFilterModel;

    const { collectionId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        async function run() {
            await creditCollectionPageStore.init(collectionId);
        }
        run();
    }, []);

    // TODO: get crumbs from router
    const crumbs = [
        { name: 'Marketplace', onClick: () => { navigate(AppRoutes.MARKETPLACE) } },
        { name: 'Collection Details', onClick: () => {} },
    ]

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
        navigate(`${AppRoutes.ADD_NFTS_TO_COLLECTION}/${collectionEntity.id}`);
    }

    return (
        <PageLayoutComponent
            className = { 'PageCollectionCredit' }>
            <PageHeader />

            { collectionEntity === null && (
                <LoadingIndicator />
            ) }

            { collectionEntity !== null && (
                <div className={'PageContent AppContent'} >
                    <Breadcrumbs crumbs={crumbs} />
                    <ProfileHeader coverPictureUrl={collectionEntity.coverImgUrl} profilePictureUrl={collectionEntity.profileImgUrl} />
                    <div className={'Heading2 CollectionHeadingName'}>{collectionEntity.name}</div>
                    <div className={'ProfileInfo Grid'}>
                        <div className={'FlexColumn B1'}>
                            <div className={'Clickable'} onClick={onClickFarmLink}>Farm Owner:  <b>{miningFarmEntity.name}</b></div>
                            <div className={'CollectionDescription'}>{collectionEntity.description}</div>
                        </div>
                        {/* // TODO: fill correct values */}
                        <div className={'FlexColumn InfoBox'}>
                            <div className={'FlexRow CollectionInfoRow'}>
                                <div className={'CollectionInfoLabel'}>Floor</div>
                                <div className={'CollectionInfoValue'}>{collectionEntity.priceDisplay()}</div>
                            </div>
                            <div className={'FlexRow CollectionInfoRow'}>
                                <div className={'CollectionInfoLabel'}>Volume</div>
                                <div className={'CollectionInfoValue'}>{collectionEntity.volume.toFixed(1)} CUDOS</div>
                            </div>
                            <div className={'FlexRow CollectionInfoRow'}>
                                <div className={'CollectionInfoLabel'}>Items</div>
                                <div className={'CollectionInfoValue'}>{collectionEntity.items}</div>
                            </div>
                            <div className={'FlexRow CollectionInfoRow'}>
                                <div className={'CollectionInfoLabel'}>Owners</div>
                                <div className={'CollectionInfoValue'}>{collectionEntity.owners}</div>
                            </div>
                            <div className={'FlexRow CollectionInfoRow'}>
                                <div className={'CollectionInfoLabel'}>Total Hashing Power</div>
                                <div className={'CollectionInfoValue'}>{collectionEntity.hashRateDisplay()}</div>
                            </div>
                            <div className={'HorizontalSeparator'}></div>
                            <div className={'FlexRow CollectionInfoRow'}>
                                <div className={'CollectionInfoLabel'}>Blockchain</div>
                                <div className={'CollectionInfoValue'}>CUDOS</div>
                            </div>
                            <div className={'FlexRow CollectionInfoRow'}>
                                <div className={'CollectionInfoLabel'}>Address</div>
                                <div className={'CollectionInfoValue'}>
                                    {ProjectUtils.shortenAddressString(collectionEntity.ownerAddress, 25)}
                                    <Svg svg={LaunchIcon}
                                        className={'SVG Icon Clickable '}
                                        onClick={() => ProjectUtils.copyText(collectionEntity.ownerAddress)} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={'GridHeader FlexRow'}>
                        <div className={'H2 Bold'}>NFTs in Collection</div>
                        {isCollectionEditable() && (<Actions height={ActionsHeight.HEIGHT_48} layout={ActionsLayout.LAYOUT_ROW_CENTER}>
                            <Button
                                radius={BUTTON_RADIUS.RADIUS_16}
                                onClick={onClickAddMoreNfts}
                            >
                                <Svg svg={AddIcon}/>
                                Add More NFTs
                            </Button>
                        </Actions>)}
                    </div>
                    <DataGridLayout
                        header = { (
                            <>
                                <Select
                                    onChange={creditCollectionPageStore.onChangeSortKey}
                                    value={nftFilterModel.sortKey} >
                                    <MenuItem value = { NftFilterModel.SORT_KEY_NAME } > Name </MenuItem>
                                    <MenuItem value = { NftFilterModel.SORT_KEY_PRICE } > Price </MenuItem>
                                </Select>
                                <Actions
                                    layout={ActionsLayout.LAYOUT_ROW_RIGHT}
                                    height={ActionsHeight.HEIGHT_48} >
                                    {/* TODO: show all filters */}
                                    <Button
                                        padding={BUTTON_PADDING.PADDING_24}
                                        type={BUTTON_TYPE.ROUNDED}>
                                    All Filters
                                    </Button>
                                </Actions>
                            </>
                        ) } >

                        { creditCollectionPageStore.nftEntities === null && (
                            <LoadingIndicator />
                        ) }

                        { creditCollectionPageStore.nftEntities !== null && (
                            <GridView
                                gridViewState={creditCollectionPageStore.gridViewState}
                                defaultContent={<div className={'NoContentFound'}>No Nfts found</div>}>
                                { creditCollectionPageStore.nftEntities.map((nftEntity: NftEntity) => {
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

export default inject((stores) => stores)(observer(creditCollectionPage));
