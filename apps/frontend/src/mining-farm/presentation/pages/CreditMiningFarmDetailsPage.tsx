import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { useNavigate } from 'react-router-dom';

import CreditMiningFarmDetailsPageState from '../stores/CreditMiningFarmDetailsPageStore';
import AppRoutes from '../../../app-routes/entities/AppRoutes';

import PageLayout from '../../../core/presentation/components/PageLayout';
import PageFooter from '../../../layout/presentation/components/PageFooter';
import PageAdminHeader from '../../../layout/presentation/components/PageAdminHeader';
import NavRow, { createNavStep, NavStep } from '../../../core/presentation/components/NavRow';
import StepFarmDetails from '../components/credit-farm/StepFarmDetails';
import StepReview from '../components/credit-farm/StepReview';
import StepSuccess from '../components/credit-farm/StepSuccess';
import LoadingIndicator from '../../../core/presentation/components/LoadingIndicator';
import AnimationContainer from '../../../core/presentation/components/AnimationContainer';
import Breadcrumbs, { createBreadcrumb } from '../../../core/presentation/components/Breadcrumbs';

import '../styles/page-credit-mining-farm-details.css';

type Props = {
    creditMiningFarmDetailsPageStore?: CreditMiningFarmDetailsPageState;
}

function CreditMiningFarmDetailsPage({ creditMiningFarmDetailsPageStore }: Props) {
    const navigate = useNavigate();

    useEffect(() => {
        async function run() {
            creditMiningFarmDetailsPageStore.init();
        }

        run();
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
                <div className={'H2 ExtraBold'}>Welcome to CUDOS Markets</div>
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
        <PageLayout className = { 'PageCreditMiningFarmDetails' }>

            <PageAdminHeader />

            <div className = { 'PageContent PageContentDefaultPadding AppContent' } >

                { creditMiningFarmDetailsPageStore.miningFarmEntity === null && (
                    <LoadingIndicator />
                ) }

                { creditMiningFarmDetailsPageStore.miningFarmEntity !== null && (
                    <>
                        {creditMiningFarmDetailsPageStore.miningFarmEntity.isNew() === false && (<Breadcrumbs crumbs={
                            [
                                createBreadcrumb('Farm Profile', onClickCreditMiningFarm),
                                createBreadcrumb('Farm Details'),
                            ] } />)}

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

        </PageLayout>
    )

}

export default inject((stores) => stores)(observer(CreditMiningFarmDetailsPage));
