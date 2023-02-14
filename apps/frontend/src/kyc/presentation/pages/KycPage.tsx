import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import * as Onfido from 'onfido-sdk-ui';
import { runInAction } from 'mobx';

import AppRoutes from '../../../app-routes/entities/AppRoutes';
import ValidationState from '../../../core/presentation/stores/ValidationState';
import KycStore from '../stores/KycStore';
import AlertStore from '../../../core/presentation/stores/AlertStore';

import Input from '../../../core/presentation/components/Input';
import Button, { ButtonColor } from '../../../core/presentation/components/Button';
import PageLayout from '../../../core/presentation/components/PageLayout';
import PageFooter from '../../../layout/presentation/components/PageFooter';
import AuthBlockLayout from '../../../accounts/presentation/components/AuthBlockLayout';
import PageHeader from '../../../layout/presentation/components/PageHeader';
import LoadingIndicator from '../../../core/presentation/components/LoadingIndicator';

import '../styles/page-kyc.css';
import S from '../../../core/utilities/Main';

type Props = {
    kycStore?: KycStore;
    alertStore?: AlertStore;
}

function KycPage({ kycStore, alertStore }: Props) {
    // const navigate = useNavigate();
    const validationState = useRef(new ValidationState()).current;
    const firstNameValidation = useRef(validationState.addEmptyValidation('Empty first name')).current;
    const lastNameValidation = useRef(validationState.addEmptyValidation('Empty last name')).current;
    const onfidoMount = useRef(null);

    const kycEntity = kycStore.kycEntity;

    function onChangeFirstName(value) {
        runInAction(() => {
            kycEntity.firstName = value;
        });
    }

    function onChangeLastName(value) {
        runInAction(() => {
            kycEntity.lastName = value;
        });
    }

    // function onClickMarketplace() {
    //     navigate(AppRoutes.MARKETPLACE);
    // }

    function onClickStartLightCheck() {
        runWorkflow(S.INT_FALSE);
    }

    function onClickStartFullCheck() {
        runWorkflow(S.INT_TRUE);
    }

    async function runWorkflow(runFullWorkflow: number) {
        if (validationState.getIsErrorPresent() === true) {
            validationState.setShowErrors(true);
            return;
        }

        const token = await kycStore.creditKycAndGetToken();
        const onfidoInstance = Onfido.init({
            token,
            region: 'US',
            steps: ['welcome', 'document', 'data', 'complete'],
            useWorkflow: true,
            onComplete: async (data) => {
                onfidoMount.current.classList.remove('Active');
                try {
                    await kycStore.createWorkflowRun(runFullWorkflow);
                    alertStore.show('You have started your verification');
                } catch (ex) {
                    console.log(ex);
                    alertStore.show(`There was an error during your verification${ex.message}`);
                }
                onfidoInstance.tearDown();
            },
            onError: (e) => {
                console.log(e);
                onfidoMount.current.classList.remove('Active');
                alertStore.show(`There was an error during your verification${e.message}`);
                onfidoInstance.tearDown();
            },
            onUserExit: () => {
                onfidoMount.current.classList.remove('Active');
                onfidoInstance.tearDown();
            },
        });
        onfidoMount.current.classList.add('Active');
    }

    function renderLightButton() {
        if (kycEntity === null) {
            return null;
        }

        const disabled = kycEntity.isFullStatusNotStarted() === false;

        if (kycEntity.isLightStatusNotStarted() === true) {
            return (
                <Button disabled = { disabled } onClick ={ onClickStartLightCheck } > Complete light check </Button>
            )
        }

        if (kycEntity.isLightStatusInProgress() === true) {
            return (
                <Button disabled = { disabled } color = { ButtonColor.SCHEME_2 } > Light verification is in progress </Button>
            )
        }

        if (kycEntity.isLightStatusCompletedFailed() === true) {
            return (
                <Button disabled = { disabled } color = { ButtonColor.SCHEME_RED } onClick = { onClickStartLightCheck } > There was a problem. Submit your documents again. </Button>
            )
        }

        return (
            <Button disabled = { disabled } color = { ButtonColor.SCHEME_GREEN } > You have passed light verification </Button>
        )
    }

    function renderFullButton() {
        if (kycEntity === null) {
            return null;
        }

        if (kycEntity.isFullStatusNotStarted() === true) {
            return (
                <Button onClick={ onClickStartFullCheck } > Complete detailed check </Button>
            )
        }

        if (kycEntity.isFullStatusInProgress() === true) {
            return (
                <Button color = { ButtonColor.SCHEME_2 } > Detailed verification is in progress </Button>
            )
        }

        if (kycEntity.isFullStatusCompletedFailed() === true) {
            return (
                <Button color = { ButtonColor.SCHEME_RED } onClick = { onClickStartFullCheck } > There was a problem. Submit your documents again. </Button>
            )
        }

        return (
            <Button color = { ButtonColor.SCHEME_GREEN } > You have passed detailed verification </Button>
        )
    }

    return (
        <PageLayout className = { 'PageKyc' }>

            <PageHeader />

            <div className = { 'PageContent AppContent' } >

                <AuthBlockLayout
                    title = { 'KYC' }
                    subtitle = { 'We need to collect a little bit more information about you before your purchase. Our platform is design two have 2 levels of verification - light and detailed. The light can be used for total puchases up to $1000. If you exeed this limit you must do the detailed one.' }
                    content = { (
                        <>
                            { kycEntity === null ? (
                                <LoadingIndicator />
                            ) : (
                                <>
                                    <Input
                                        label={'First name'}
                                        inputValidation={firstNameValidation}
                                        value={kycEntity.firstName}
                                        onChange={onChangeFirstName} />
                                    <Input
                                        label={'Last name'}
                                        inputValidation={lastNameValidation}
                                        value={kycEntity.lastName}
                                        onChange={onChangeLastName}/>
                                </>
                            ) }

                        </>
                    ) }
                    actions = { (
                        <>
                            { renderLightButton() }
                            { renderFullButton() }
                        </>
                    ) } />

            </div>

            <PageFooter />

            <div ref = { onfidoMount } id="onfido-mount" className = { 'FlexSingleCenter ActiveDisplayHidden' } />

        </PageLayout>
    )
}

export default inject((stores) => stores)(observer(KycPage));
