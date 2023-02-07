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
import Button from '../../../core/presentation/components/Button';
import PageLayout from '../../../core/presentation/components/PageLayout';
import PageFooter from '../../../layout/presentation/components/PageFooter';
import AuthBlockLayout from '../../../accounts/presentation/components/AuthBlockLayout';
import PageHeader from '../../../layout/presentation/components/PageHeader';
import LoadingIndicator from '../../../core/presentation/components/LoadingIndicator';

import '../styles/page-kyc.css';

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

    function onKeyUp(e) {
        if (e.key === 'Enter') {
            onClickCheck();
        }
    }

    function onClickMarketplace() {
        navigate(AppRoutes.MARKETPLACE);
    }

    async function onClickCheck() {
        if (validationState.getIsErrorPresent() === true) {
            validationState.setShowErrors(true);
            return;
        }

        const token = await kycStore.creditKycAndGetToken();
        try {
            if (kycStore.isVerificationNotStarted() === true || kycStore.isVerificationFailed() === true) {
                Onfido.init({
                    token,
                    region: 'US',
                    steps: ['welcome', 'document', 'complete'],
                    onComplete: async (data) => {
                        onfidoMount.current.classList.remove('Active');
                        await kycStore.createCheck();
                        alertStore.show('You have started your verification');
                    },
                    onError: (e) => {
                        console.log(e);
                        onfidoMount.current.classList.remove('Active');
                        alertStore.show(`There was an error during your verification${e.message}`);
                    },
                    onUserExit: () => {
                        onfidoMount.current.classList.remove('Active');
                    },
                });
                onfidoMount.current.classList.add('Active');
            }
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <PageLayout className = { 'PageKyc' }>

            <PageHeader />

            <div className = { 'PageContent AppContent' } >

                { kycStore.isVerificationSuccessful() === true && (
                    <AuthBlockLayout
                        title = { 'KYC' }
                        subtitle = { 'You are verified' }
                        content = { (
                            <>
                            </>
                        ) }
                        actions = { (
                            <>
                                <Button onClick={ onClickMarketplace } >
                                    Marketplace
                                </Button>
                            </>
                        ) } />
                ) }

                { kycStore.isVerificationInProgress() === true && (
                    <AuthBlockLayout
                        title = { 'KYC' }
                        subtitle = { 'You are being verified' }
                        content = { (
                            <>
                            </>
                        ) }
                        actions = { (
                            <>
                                <Button onClick={ onClickMarketplace } >
                                    Marketplace
                                </Button>
                            </>
                        ) } />
                ) }

                { kycStore.isVerificationFailed() === true && (
                    <AuthBlockLayout
                        title = { 'KYC' }
                        subtitle = { 'Your verification has failed' }
                        content = { (
                            <>
                            </>
                        ) }
                        actions = { (
                            <>
                                <Button onClick={ onClickMarketplace } >
                                    Marketplace
                                </Button>
                            </>
                        ) } />
                ) }

                { kycStore.isVerificationNotStarted() === true && (
                    <AuthBlockLayout
                        title = { 'KYC' }
                        subtitle = { '' }
                        // subtitle = { 'Fill your credentials in order to access your account' }
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
                                            onChange={onChangeFirstName}
                                            onKeyUp= { onKeyUp } />
                                        <Input
                                            label={'Last name'}
                                            inputValidation={lastNameValidation}
                                            value={kycEntity.lastName}
                                            onChange={onChangeLastName}
                                            onKeyUp = { onKeyUp } />
                                    </>
                                ) }

                            </>
                        ) }
                        actions = { (
                            <>
                                <Button onClick={ onClickCheck } >
                                    Continue
                                </Button>
                            </>
                        ) } />
                ) }

            </div>

            <PageFooter />

            <div ref = { onfidoMount } id="onfido-mount" className = { 'FlexSingleCenter ActiveDisplayHidden' } />

        </PageLayout>
    )
}

export default inject((stores) => stores)(observer(KycPage));
