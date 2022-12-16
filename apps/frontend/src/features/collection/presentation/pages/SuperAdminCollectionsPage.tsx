import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react'

import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent'
import PageSuperAdminHeader from '../../../header/presentation/components/PageSuperAdminHeader'
import ColumnLayout from '../../../../core/presentation/components/ColumnLayout';
import QueuedCollections from '../components/QueuedCollections';
import ViewCollectionModal from '../components/ViewCollectionModal';
import ChangePasswordModal from '../../../accounts/presentation/components/ChangePasswordModal';

import '../styles/page-super-admin-collections.css'
import StyledContainer from '../../../../core/presentation/components/StyledContainer';
import Input from '../../../../core/presentation/components/Input';
import InputAdornment from '@mui/material/InputAdornment/InputAdornment';
import Svg from '../../../../core/presentation/components/Svg';
import LoadingIndicator from '../../../../core/presentation/components/LoadingIndicator';
import Actions, { ActionsHeight, ActionsLayout } from '../../../../core/presentation/components/Actions';
import Button, { ButtonPadding } from '../../../../core/presentation/components/Button';
import TopCollections from '../components/TopCollections';
import SearchIcon from '@mui/icons-material/Search';
import SuperAdminCollectionsPageStore from '../stores/SuperAdminCollectionsPageStore';

type Props = {
    superAdminCollectionsPageStore: SuperAdminCollectionsPageStore
}

function SuperAdminCollectionsPage({ superAdminCollectionsPageStore }: Props) {

    useEffect(() => {
        superAdminCollectionsPageStore.init();
    }, []);

    const { collectionEntities, collectionDetailsMap, collectionFilterModel } = superAdminCollectionsPageStore;

    function onClickSeeAllCollections() {
        // TODO: lead where?
    }

    return (
        <PageLayoutComponent
            className = { 'PageSuperAdminCollections' }
            modals = {
                <>
                    <ChangePasswordModal />
                    <ViewCollectionModal />
                </>
            } >

            <PageSuperAdminHeader />

            <ColumnLayout className={'PageContent AppContent'} >
                <div className={'H1 ExtraBold'}>Collections</div>
                <QueuedCollections dashboardMode = { false } />
                <StyledContainer>
                    <div className={'TableHeaderRow FlexRow SpaceBetween'}>
                        <div className={'H3 Bold'}>Top Collections</div>
                        <Input
                            className={'SearchInput'}
                            placeholder={'Search Collections'}
                            value={collectionFilterModel ? collectionFilterModel.searchString : ''}
                            onChange={superAdminCollectionsPageStore.onChangeSearchWord}
                            InputProps={{
                                startAdornment: <InputAdornment position="start" >
                                    <Svg svg={SearchIcon}/>
                                </InputAdornment>,
                            }}
                        />
                    </div>
                    { collectionEntities === null ? (
                        <LoadingIndicator />
                    ) : (<TopCollections
                        topCollectionEntities={collectionEntities}
                        collectionDetailsMap={collectionDetailsMap} />
                    )}
                    <Actions
                        className = { 'SectionActions' }
                        layout={ActionsLayout.LAYOUT_ROW_CENTER}
                        height={ActionsHeight.HEIGHT_48}>
                        <Button
                            onClick={onClickSeeAllCollections}
                            padding={ButtonPadding.PADDING_24}>
                            See All Collections
                        </Button>
                    </Actions>
                </StyledContainer>
            </ColumnLayout>

        </PageLayoutComponent>
    )
}

export default inject((stores) => stores)(observer(SuperAdminCollectionsPage));
