import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { useNavigate } from 'react-router-dom';

import CreditCollectionStore from '../stores/CreditCollectionStore';
import AppStore from '../../../../core/presentation/stores/AppStore';
import AppRoutes from '../../../app-routes/entities/AppRoutes';

import PageLayout from '../../../../core/presentation/components/PageLayout';
import PageFooter from '../../../layout/presentation/components/PageFooter';
import PageAdminHeader from '../../../layout/presentation/components/PageAdminHeader';
import StyledContainer from '../../../../core/presentation/components/StyledContainer';
import Breadcrumbs, { createBreadcrumb } from '../../../../core/presentation/components/Breadcrumbs';
import CreditCollectionSuccessModal from '../components/credit-collection/CreditCollectionSuccessModal';
import CreditCollectionDetailsStep from '../components/credit-collection/CreditCollectionDetailsStep';
import CreditCollectionAddNftsStep from '../components/credit-collection/CreditCollectionAddNftsStep';
import CreditCollectionFinishStep from '../components/credit-collection/CreditCollectionFinishStep';
import ColumnLayout from '../../../../core/presentation/components/ColumnLayout';

import '../styles/page-credit-collection-details-create.css';

type Props = {
    appStore?: AppStore;
    creditCollectionStore?: CreditCollectionStore;
}

function CreditCollectionDetailsCreatePage({ appStore, creditCollectionStore }: Props) {

    const navigate = useNavigate();
    const collectionEntity = creditCollectionStore.collectionEntity;

    useEffect(() => {
        appStore.useLoading(async () => {
            await creditCollectionStore.initAsCreate();
        })
    }, []);

    function onClickNavigateCreditMiningFarm() {
        navigate(AppRoutes.CREDIT_MINING_FARM)
    }

    return (
        <PageLayout
            modals = {
                <>
                    <CreditCollectionSuccessModal />
                </>
            }
            className = { 'PageCreditCollectionDetailsCreate' }>

            <PageAdminHeader />

            <ColumnLayout className = { 'PageContent PageContentDefaultPadding AppContent' } >
                <Breadcrumbs crumbs={ [
                    createBreadcrumb('My Collections', onClickNavigateCreditMiningFarm),
                    createBreadcrumb('Create Collection'),
                ] } />
                <StyledContainer>
                    {collectionEntity !== null && (
                        <>
                            {creditCollectionStore.isStepDetails() === true && (
                                <CreditCollectionDetailsStep />
                            )}
                            {creditCollectionStore.isStepAddNfts() === true && (
                                <CreditCollectionAddNftsStep />
                            )}
                            {creditCollectionStore.isStepFinish() && (
                                <CreditCollectionFinishStep />
                            )}
                        </>
                    )}
                </StyledContainer>
            </ColumnLayout>

            <PageFooter />

        </PageLayout>
    )

}

export default inject((stores) => stores)(observer(CreditCollectionDetailsCreatePage));
