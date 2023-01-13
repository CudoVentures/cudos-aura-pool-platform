import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { useNavigate, useParams } from 'react-router-dom';

import CreditCollectionStore from '../stores/CreditCollectionStore';
import AppRoutes from '../../../app-routes/entities/AppRoutes';

import PageLayout from '../../../core/presentation/components/PageLayout';
import PageFooter from '../../../layout/presentation/components/PageFooter';
import PageAdminHeader from '../../../layout/presentation/components/PageAdminHeader';
import StyledContainer from '../../../core/presentation/components/StyledContainer';
import Breadcrumbs, { createBreadcrumb } from '../../../core/presentation/components/Breadcrumbs';
import CreditCollectionSuccessModal from '../components/credit-collection/CreditCollectionSuccessModal';
import CreditCollectionAddNftsStep from '../components/credit-collection/CreditCollectionAddNftsStep';
import CreditCollectionFinishStep from '../components/credit-collection/CreditCollectionFinishStep';
import LoadingIndicator from '../../../core/presentation/components/LoadingIndicator';
import ColumnLayout from '../../../core/presentation/components/ColumnLayout';

import '../styles/page-credit-collection-details-add-nfts.css';

type Props = {
    creditCollectionStore?: CreditCollectionStore;
}

function CreditCollectionDetailsAddNftsPage({ creditCollectionStore }: Props) {
    const { collectionId } = useParams();

    const navigate = useNavigate();
    const collectionEntity = creditCollectionStore.collectionEntity;

    useEffect(() => {
        async function run() {
            await creditCollectionStore.initAsAddNfts(collectionId);
        }

        run();
    }, []);

    function onClickNavigateCreditMiningFarm() {
        navigate(AppRoutes.CREDIT_MINING_FARM)
    }

    function onClickNavigateCollection() {
        navigate(`${AppRoutes.CREDIT_COLLECTION}/${collectionEntity.id}`)
    }

    return (
        <PageLayout
            modals = {
                <>
                    <CreditCollectionSuccessModal />
                </>
            }
            className = { 'PageCreditCollectionDetailsAddNfts' }>

            <PageAdminHeader />

            <ColumnLayout className = { 'PageContent PageContentDefaultPadding AppContent' } >
                {collectionEntity === null ? (
                    <LoadingIndicator />
                ) : (
                    <>
                        <Breadcrumbs crumbs={ [
                            createBreadcrumb('My Collections', onClickNavigateCreditMiningFarm),
                            createBreadcrumb('Collection', onClickNavigateCollection),
                            createBreadcrumb('Add NFTs'),
                        ] } />
                        <StyledContainer>
                            {creditCollectionStore.isStepAddNfts() === true && (
                                <CreditCollectionAddNftsStep />
                            )}
                            {creditCollectionStore.isStepFinish() && (
                                <CreditCollectionFinishStep />
                            )}
                        </StyledContainer>
                    </>
                ) }
            </ColumnLayout>

            <PageFooter />

        </PageLayout>
    )

}

export default inject((stores) => stores)(observer(CreditCollectionDetailsAddNftsPage));
