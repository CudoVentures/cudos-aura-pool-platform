import React, { useRef } from 'react';
import { inject, observer } from 'mobx-react';
// import * as Onfido from 'onfido-sdk-ui';
import { init as OnfidoInit } from 'onfido-sdk-ui/dist/onfido.min';
import { runInAction } from 'mobx';
import { Region } from '@onfido/api';
import { useNavigate } from 'react-router-dom';

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
import AppRoutes from '../../../app-routes/entities/AppRoutes';

import '../styles/page-kyc.css';
import 'onfido-sdk-ui/dist/style.css';
import S from '../../../core/utilities/Main';

type Props = {
    kycStore?: KycStore;
    alertStore?: AlertStore;
}

function KycPage({ kycStore, alertStore }: Props) {
    const navigate = useNavigate();
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

    function onClickMarketplace() {
        navigate(AppRoutes.MARKETPLACE);
    }

    function onClickStartLightCheck() {
        runWorkflow(S.INT_FALSE);
    }

    function onClickStartFullCheck() {
        runWorkflow(S.INT_TRUE);
    }

    function onClickStartLightCheckForced() {
        alertStore.show('Do you want to start the progress again', () => {
            onClickStartLightCheck();
        }, () => { });
    }

    function onClickStartFullCheckForced() {
        alertStore.show('Do you want to start the progress again', () => {
            onClickStartFullCheck();
        }, () => { });
    }

    async function runWorkflow(runFullWorkflow: number) {
        if (validationState.getIsErrorPresent() === true) {
            validationState.setShowErrors(true);
            return;
        }

        const token = await kycStore.creditKycAndGetToken();
        const workflowRunId = await kycStore.createWorkflowRun(runFullWorkflow);
        const onfidoInstance = OnfidoInit({
            token,
            region: Region.EU,
            // steps: ['welcome', 'document', 'data', 'complete'],
            useWorkflow: true,
            workflowRunId,
            onComplete: async (data) => {
                onfidoMount.current.classList.remove('Active');
                try {
                    alertStore.show('You have successfully submitted your verification request.', () => {
                        onClickMarketplace()
                        window.location.reload();
                    });
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
                <Button disabled={disabled} onClick={onClickStartLightCheck} > Complete light check </Button>
            )
        }

        if (kycEntity.isLightStatusInProgress() === true) {
            return (
                <Button disabled={disabled} color={ButtonColor.SCHEME_2} onClick={onClickStartLightCheckForced} > Light verification is in progress </Button>
            )
        }

        if (kycEntity.isLightStatusCompletedFailed() === true) {
            return (
                <Button disabled={disabled} color={ButtonColor.SCHEME_RED} onClick={onClickStartLightCheck} > There was a problem. Submit your documents again. </Button>
            )
        }

        return (
            <Button disabled={disabled} color={ButtonColor.SCHEME_GREEN} > You have passed light verification </Button>
        )
    }

    function renderFullButton() {
        if (kycEntity === null) {
            return null;
        }

        if (kycEntity.isFullStatusNotStarted() === true) {
            return (
                <Button onClick={onClickStartFullCheck} > Complete detailed check </Button>
            )
        }

        if (kycEntity.isFullStatusInProgress() === true) {
            return (
                <Button color={ButtonColor.SCHEME_2} onClick={onClickStartFullCheckForced} > Detailed verification is in progress </Button>
            )
        }

        if (kycEntity.isFullStatusCompletedFailed() === true) {
            return (
                <Button color={ButtonColor.SCHEME_RED} onClick={onClickStartFullCheck} > There was a problem. Submit your documents again. </Button>
            )
        }

        return (
            <Button color={ButtonColor.SCHEME_GREEN} > You have passed detailed verification </Button>
        )
    }

    return (
        <PageLayout className={'PageKyc'}>

            <PageHeader />

            <div className={'PageContent AppContent'} >

                <AuthBlockLayout
                    title={'KYC'}
                    subtitle={(
                        <ul className = { 'KycInfo' }>
                            <li>
                                <strong>Light check (under $1k):</strong> only first and last name are required, no other details needed. We will look up your internet service provider address to determine your location as well.
                            </li>
                            <li>
                                <strong>Detailed check (required for over $1k total spend):</strong> in addition to the above, you will need to provide further documentation.
                            </li>
                        </ul>
                    )}
                    content={(
                        <>
                            {kycEntity === null ? (
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
                                        onChange={onChangeLastName} />
                                </>
                            )}

                        </>
                    )}
                    actions={(
                        <>
                            {renderLightButton()}
                            {renderFullButton()}
                        </>
                    )} />

            </div>

            <PageFooter />

            <div ref={onfidoMount} id="onfido-mount" className={'FlexSingleCenter ActiveDisplayHidden'} />

        </PageLayout>
    )
}

export default inject((stores) => stores)(observer(KycPage));
