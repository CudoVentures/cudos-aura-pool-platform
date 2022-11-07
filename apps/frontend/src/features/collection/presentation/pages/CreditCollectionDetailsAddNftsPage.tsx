import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { useNavigate, useParams } from 'react-router-dom';

import CreditCollectionStore from '../stores/CreditCollectionStore';
import AppStore from '../../../../core/presentation/stores/AppStore';
import AppRoutes from '../../../app-routes/entities/AppRoutes';

import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';
import PageFooter from '../../../footer/presentation/components/PageFooter';
import PageAdminHeader from '../../../header/presentation/components/PageAdminHeader';
import StyledContainer from '../../../../core/presentation/components/StyledContainer';
import Breadcrumbs, { createBreadcrumb } from '../../../../core/presentation/components/Breadcrumbs';
import CreditCollectionSuccessModal from '../components/credit-collection/CreditCollectionSuccessModal';
import CreditCollectionDetailsStep from '../components/credit-collection/CreditCollectionDetailsStep';
import CreditCollectionAddNftsStep from '../components/credit-collection/CreditCollectionAddNftsStep';
import CreditCollectionFinishStep from '../components/credit-collection/CreditCollectionFinishStep';
import LoadingIndicator from '../../../../core/presentation/components/LoadingIndicator';

import '../styles/page-credit-collection-details-add-nfts.css';

type Props = {
    appStore?: AppStore;
    creditCollectionStore?: CreditCollectionStore;
}

function CreditCollectionDetailsAddNftsPage({ appStore, creditCollectionStore }: Props) {
    const { collectionId } = useParams();

    const navigate = useNavigate();
    const collectionEntity = creditCollectionStore.collectionEntity;

    useEffect(() => {
        appStore.useLoading(async () => {
            await creditCollectionStore.initAsAddNfts(collectionId);
        })
    }, []);

    function onClickNavigateCreditMiningFarm() {
        navigate(AppRoutes.CREDIT_MINING_FARM)
    }

    function onClickNavigateCollection() {
        navigate(`${AppRoutes.CREDIT_COLLECTION}/${collectionEntity.id}`)
    }

    return (
        <PageLayoutComponent
            modals = {
                <>
                    <CreditCollectionSuccessModal />
                </>
            }
            className = { 'PageCreditCollectionDetailsAddNfts' }>

            <PageAdminHeader />

            <div className = { 'PageContent AppContent' } >
                {collectionEntity === null ? (
                    <LoadingIndicator />
                ) : (
                    <>
                        <Breadcrumbs crumbs={ [
                            createBreadcrumb('My Collections', onClickNavigateCreditMiningFarm),
                            createBreadcrumb('Collection', onClickNavigateCollection),
                            createBreadcrumb('Add NFTs'),
                        ] } />
                        <StyledContainer className={'FlexColumn BorderContainer'}>
                            {creditCollectionStore.isStepAddNfts() === true && (
                                <CreditCollectionAddNftsStep />
                            )}
                            {creditCollectionStore.isStepFinish() && (
                                <CreditCollectionFinishStep />
                            )}
                        </StyledContainer>
                    </>
                ) }
            </div>

            <PageFooter />

        </PageLayoutComponent>
    )

}

export default inject((stores) => stores)(observer(CreditCollectionDetailsAddNftsPage));
