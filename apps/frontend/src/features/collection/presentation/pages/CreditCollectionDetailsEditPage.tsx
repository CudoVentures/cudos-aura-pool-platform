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
import LoadingIndicator from '../../../../core/presentation/components/LoadingIndicator';

import '../styles/page-credit-collection-details-edit.css';

type Props = {
    appStore?: AppStore;
    creditCollectionStore?: CreditCollectionStore;
}

function CreditCollectionDetailsEditPage({ appStore, creditCollectionStore }: Props) {
    const { collectionId } = useParams();

    const navigate = useNavigate();
    const collectionEntity = creditCollectionStore.collectionEntity;

    useEffect(() => {
        appStore.useLoading(async () => {
            await creditCollectionStore.initAsEdit(collectionId);
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
            className = { 'PageCreditCollectionDetailsEdit' }>

            <PageAdminHeader />

            <div className = { 'PageContent AppContent' } >
                {collectionEntity === null ? (
                    <LoadingIndicator />
                ) : (
                    <>
                        <Breadcrumbs crumbs={ [
                            createBreadcrumb('My Collections', onClickNavigateCreditMiningFarm),
                            createBreadcrumb('Collection', onClickNavigateCollection),
                            createBreadcrumb('Edit Collection'),
                        ] } />
                        <StyledContainer className={'FlexColumn BorderContainer'}>
                            {creditCollectionStore.isStepDetails() === true && (
                                <CreditCollectionDetailsStep />
                            )}
                        </StyledContainer>
                    </>
                ) }
            </div>

            <PageFooter />

        </PageLayoutComponent>
    )

}

export default inject((stores) => stores)(observer(CreditCollectionDetailsEditPage));
