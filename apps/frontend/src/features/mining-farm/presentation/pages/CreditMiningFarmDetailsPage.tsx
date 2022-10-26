import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';

import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';
import PageFooter from '../../../footer/presentation/components/PageFooter';
import PageAdminHeader from '../../../header/presentation/components/PageAdminHeader';

import '../styles/page-credit-mining-farm-details.css';
import NavRow, { createNavStep, NavStep } from '../../../../core/presentation/components/NavRow';
import StepFarmDetails from '../components/credit-farm/StepFarmDetails';
import CreditMiningFarmDetailsPageState from '../stores/CreditMiningFarmDetailsPageStore';
import AppStore from '../../../../core/presentation/stores/AppStore';
import StepReview from '../components/credit-farm/StepReview';
import StepSuccess from '../components/credit-farm/StepSuccess';
import StyledContainer, { ContainerWidth } from '../../../../core/presentation/components/StyledContainer';
import LoadingIndicator from '../../../../core/presentation/components/LoadingIndicator';
import AnimationContainer from '../../../../core/presentation/components/AnimationContainer';

type Props = {
    creditMiningFarmDetailsPageStore?: CreditMiningFarmDetailsPageState;
    appStore?: AppStore;
}

function CreditMiningFarmDetailsPage({ creditMiningFarmDetailsPageStore, appStore }: Props) {
    useEffect(() => {
        appStore.useLoading(() => {
            creditMiningFarmDetailsPageStore.init();
        });
    }, []);

    const navSteps: NavStep[] = [
        createNavStep(1, 'Farm Details', creditMiningFarmDetailsPageStore.isStepFarmDetails(), creditMiningFarmDetailsPageStore.isStepReview()),
        createNavStep(2, 'Finish', creditMiningFarmDetailsPageStore.isStepReview(), false),
    ];

    function CreditHeading() {
        if (creditMiningFarmDetailsPageStore.miningFarmEntity.isNew() === true) {
            return (<>
                <div className={'H3 Bold FullLine'}>Welcome to AuraPool</div>
                <div className={'B1 FullLine'}>Follow the steps to create your Farm Profile</div>
            </>)
        }

        return (<>
            <div className={'H3 Bold FullLine'}>Edit Farm Profile</div>
            <div className={'B1 FullLine'}>Review and update your Farm Profile details and submit for review.</div>
        </>)
    }

    return (
        <PageLayoutComponent className = { 'PageCreditMiningFarmDetails' }>

            <PageAdminHeader />

            <div className = { 'PageContent AppContent' } >

                { creditMiningFarmDetailsPageStore.miningFarmEntity === null && (
                    <LoadingIndicator />
                ) }

                { creditMiningFarmDetailsPageStore.miningFarmEntity !== null && (
                    <StyledContainer className={'FormContainer FlexColumn'} containerWidth = { ContainerWidth.MEDIUM } >

                        <div className = { 'NavRow' } >
                            { creditMiningFarmDetailsPageStore.isStepSuccess() === false && (
                                <NavRow navSteps={navSteps}/>
                            ) }
                        </div>

                        <AnimationContainer className = { 'Step StepDetails' } active = { creditMiningFarmDetailsPageStore.isStepFarmDetails() }>
                            <CreditHeading />
                            <StepFarmDetails />
                        </AnimationContainer>

                        <AnimationContainer className = { 'Step StepReview' } active = { creditMiningFarmDetailsPageStore.isStepReview() }>
                            <StepReview />
                        </AnimationContainer>

                        <AnimationContainer className = { 'Step StepSuccess' } active = { creditMiningFarmDetailsPageStore.isStepSuccess() } >
                            <StepSuccess />
                        </AnimationContainer>

                    </StyledContainer>
                ) }

            </div>

            <PageFooter />

        </PageLayoutComponent>
    )

}

export default inject((stores) => stores)(observer(CreditMiningFarmDetailsPage));
