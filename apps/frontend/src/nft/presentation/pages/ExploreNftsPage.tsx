import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { useNavigate } from 'react-router-dom';

import NftEntity from '../../entities/NftEntity';
import ExploreNftsPageStore from '../stores/ExploreNftsPageStore';
import AppRoutes from '../../../app-routes/entities/AppRoutes';

import InputAdornment from '@mui/material/InputAdornment/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Input, { InputType } from '../../../core/presentation/components/Input';
import PageLayout from '../../../core/presentation/components/PageLayout';
import Svg from '../../../core/presentation/components/Svg';
import PageHeader from '../../../layout/presentation/components/PageHeader';
import PageFooter from '../../../layout/presentation/components/PageFooter';
import GridView from '../../../core/presentation/components/GridView';
import NftPreview from '../components/NftPreview';
import LoadingIndicator from '../../../core/presentation/components/LoadingIndicator';
import ExplorePageLayout from '../../../core/presentation/components/ExplorePageLayout';
import DataGridLayout from '../../../core/presentation/components/DataGridLayout';
import NavRowTabs, { createNavRowTab } from '../../../core/presentation/components/NavRowTabs';

import '../styles/page-explore-nfts.css';

type Props = {
    exploreNftsPageStore?: ExploreNftsPageStore;
}

function ExploreNftsPage({ exploreNftsPageStore }: Props) {
    const navigate = useNavigate();

    useEffect(() => {
        async function run() {
            exploreNftsPageStore.init();
        }

        run();
    }, [])

    const nftFilterModel = exploreNftsPageStore.nftFilterModel;

    function onClickExploreCollections() {
        navigate(AppRoutes.EXPLORE_COLLECTIONS)
    }

    function onClickExploreMiningFarms() {
        navigate(AppRoutes.EXPLORE_MINING_FARMS);
    }

    return (
        <PageLayout className = { 'PageExploreNfts' } >

            <PageHeader />

            <div className={'PageContent AppContent'} >

                <ExplorePageLayout
                    header = { (
                        <>
                            <div className={'H2 Bold'}>Explore AuraPool</div>
                            <NavRowTabs navTabs = {[
                                createNavRowTab('NFTs', true),
                                createNavRowTab('Collections', false, onClickExploreCollections),
                                createNavRowTab('Farms', false, onClickExploreMiningFarms),
                            ]} />
                        </>
                    ) }>

                    <DataGridLayout
                        headerLeft = { (
                            <>
                                <Input
                                    inputType={InputType.TEXT}
                                    className={'SearchBar'}
                                    value = {nftFilterModel.searchString}
                                    onChange = { exploreNftsPageStore.onChangeSearchWord }
                                    placeholder = {'Search for NFT...'}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start" >
                                            <Svg svg={SearchIcon} />
                                        </InputAdornment>,
                                    }} />
                            </>
                        ) } >

                        { exploreNftsPageStore.nftEntities === null && (
                            <LoadingIndicator />
                        ) }

                        { exploreNftsPageStore.nftEntities !== null && (
                            <GridView
                                gridViewState={exploreNftsPageStore.gridViewState}
                                defaultContent={exploreNftsPageStore.nftEntities.length === 0 ? <div className={'NoContentFound'}>No Nfts found</div> : null}>
                                {exploreNftsPageStore.nftEntities.map(
                                    (nftEntity: NftEntity, index: number) => {
                                        return (
                                            <NftPreview
                                                key={index}
                                                nftEntity={nftEntity}
                                                collectionName={exploreNftsPageStore.getCollectioName(nftEntity.collectionId)} />
                                        )
                                    },
                                )}
                            </GridView>
                        ) }

                    </DataGridLayout>

                </ExplorePageLayout>

            </div>

            <PageFooter />

        </PageLayout>
    )

}

export default inject((stores) => stores)(observer(ExploreNftsPage));
