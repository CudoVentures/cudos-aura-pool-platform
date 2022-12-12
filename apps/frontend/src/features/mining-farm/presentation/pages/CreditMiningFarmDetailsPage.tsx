import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { useNavigate } from 'react-router-dom';

import CreditMiningFarmDetailsPageState from '../stores/CreditMiningFarmDetailsPageStore';
import AppStore from '../../../../core/presentation/stores/AppStore';
import AppRoutes from '../../../app-routes/entities/AppRoutes';

import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';
import PageFooter from '../../../footer/presentation/components/PageFooter';
import PageAdminHeader from '../../../header/presentation/components/PageAdminHeader';
import NavRow, { createNavStep, NavStep } from '../../../../core/presentation/components/NavRow';
import StepFarmDetails from '../components/credit-farm/StepFarmDetails';
import StepReview from '../components/credit-farm/StepReview';
import StepSuccess from '../components/credit-farm/StepSuccess';
import LoadingIndicator from '../../../../core/presentation/components/LoadingIndicator';
import AnimationContainer from '../../../../core/presentation/components/AnimationContainer';
import Breadcrumbs, { createBreadcrumb } from '../../../../core/presentation/components/Breadcrumbs';

import '../styles/page-credit-mining-farm-details.css';

type Props = {
    creditMiningFarmDetailsPageStore?: CreditMiningFarmDetailsPageState;
    appStore?: AppStore;
}

function CreditMiningFarmDetailsPage({ creditMiningFarmDetailsPageStore, appStore }: Props) {
    const navigate = useNavigate();

    useEffect(() => {
        appStore.useLoading(() => {
            creditMiningFarmDetailsPageStore.init();
        });
    }, []);

    const navSteps: NavStep[] = [
        createNavStep(1, 'Farm Details', creditMiningFarmDetailsPageStore.isStepFarmDetails(), creditMiningFarmDetailsPageStore.isStepReview()),
        createNavStep(2, 'Finish', creditMiningFarmDetailsPageStore.isStepReview(), false),
    ];

    function onClickCreditMiningFarm() {
        navigate(AppRoutes.CREDIT_MINING_FARM);
    }

    function renderCreditHeading() {
        const content = creditMiningFarmDetailsPageStore.miningFarmEntity.isNew() === true ? (
            <>
                <div className={'H2 ExtraBold'}>Welcome to AuraPool</div>
                <div className={'B1'}>Follow the steps to create your Farm Profile</div>
            </>
        ) : (
            <>
                <div className={'H2 ExtraBold'}>Edit Farm Profile</div>
                <div className={'B1'}>Review and update your Farm Profile details and submit for review.</div>
            </>
        );

        return (
            <div className = { 'CreditHeading' } >{ content }</div>
        )
    }

    return (
        <PageLayoutComponent className = { 'PageCreditMiningFarmDetails' }>

            <PageAdminHeader />

            <div className = { 'PageContent PageContentDefaultPadding AppContent' } >

                { creditMiningFarmDetailsPageStore.miningFarmEntity === null && (
                    <LoadingIndicator />
                ) }

                { creditMiningFarmDetailsPageStore.miningFarmEntity !== null && (
                    <>
                        <Breadcrumbs crumbs={ [
                            createBreadcrumb('Farm Profile', onClickCreditMiningFarm),
                            createBreadcrumb('Farm Details'),
                        ] } />

                        {/* <StyledContainer className={'FormContainer FlexColumn'} containerWidth = { ContainerWidth.MEDIUM } > */}
                        <div className = { 'FormContainer' } >

                            {/* { creditMiningFarmDetailsPageStore.isStepSuccess() === false && (
                                <NavRow className = { 'StepsCnt' } navSteps={navSteps}/>
                            ) } */}

                            <AnimationContainer className = { 'Step StepDetails' } active = { creditMiningFarmDetailsPageStore.isStepFarmDetails() }>
                                <StepFarmDetails header = {
                                    <>
                                        <NavRow className = { 'StepsCnt' } navSteps={navSteps}/>
                                        { renderCreditHeading() }
                                    </>
                                } />
                            </AnimationContainer>

                            <AnimationContainer className = { 'Step StepReview' } active = { creditMiningFarmDetailsPageStore.isStepReview() }>
                                <StepReview
                                    header = {
                                        <>
                                            <NavRow className = { 'StepsCnt' } navSteps={navSteps}/>
                                            <div className = { 'CreditHeading' }>
                                                <div className={'H2 ExtraBold'}>Finish Registration</div>
                                                <div className={'B1'}>Review the filled information and submit for review.</div>
                                            </div>
                                        </>
                                    } />
                            </AnimationContainer>

                            <AnimationContainer className = { 'Step StepSuccess' } active = { creditMiningFarmDetailsPageStore.isStepSuccess() } >
                                <StepSuccess />
                            </AnimationContainer>

                            {/* </StyledContainer> */}
                        </div>
                    </>
                ) }

            </div>

            <PageFooter />

        </PageLayoutComponent>
    )

}

export default inject((stores) => stores)(observer(CreditMiningFarmDetailsPage));
