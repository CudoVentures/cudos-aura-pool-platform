import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import * as Onfido from 'onfido-sdk-ui';

import AppRoutes from '../../../app-routes/entities/AppRoutes';
import ValidationState from '../../../core/presentation/stores/ValidationState';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import KycStore from '../stores/KycStore';

import { InputAdornment } from '@mui/material';
import Input from '../../../core/presentation/components/Input';
import Svg from '../../../core/presentation/components/Svg';
import Button, { ButtonType } from '../../../core/presentation/components/Button';
import PageLayout from '../../../core/presentation/components/PageLayout';
import PageFooter from '../../../layout/presentation/components/PageFooter';
import PageAdminHeader from '../../../layout/presentation/components/PageAdminHeader';

import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import '../styles/page-kyc.css';
import AuthBlockLayout from '../../../accounts/presentation/components/AuthBlockLayout';
import { runInAction } from 'mobx';
import PageHeader from '../../../layout/presentation/components/PageHeader';
import LoadingIndicator from '../../../core/presentation/components/LoadingIndicator';

type Props = {
    accountSessionStore?: AccountSessionStore;
    kycStore?: KycStore;
}

function KycPage({ accountSessionStore, kycStore }: Props) {
    const navigate = useNavigate();
    const validationState = useRef(new ValidationState()).current;
    const firstNameValidation = useRef(validationState.addEmptyValidation('Empty first name')).current;
    const lastNameValidation = useRef(validationState.addEmptyValidation('Empty last name')).current;

    const kycEntity = kycStore.kycEntity;

    useEffect(() => {
        kycStore.inited = false;
        kycStore.init();
    }, []);

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
            if (kycEntity.hasRegisteredApplicant() === false) {
                if (kycEntity.isVerified() === false) {
                    Onfido.init({
                        token,
                        region: 'US',
                        steps: ['welcome', 'document', 'complete'],
                        onComplete: async (data) => {
                            document.getElementById('onfido-mount').classList.remove('Active');
                            console.log('Everything is complete', data);
                            console.log('Everything is complete', data.data, data.poa);
                            await kycStore.creditCheck();
                        },
                        onError: (e) => {
                            console.log(e);
                            document.getElementById('onfido-mount').classList.remove('Active');
                        },
                        onUserExit: () => {
                            document.getElementById('onfido-mount').classList.remove('Active');
                        },
                    });
                    document.getElementById('onfido-mount').classList.add('Active');
                }
            } else {
                await kycStore.creditCheck();
            }
        } catch (e) {
            console.log(e);
        }

    }

    return (
        <PageLayout className = { 'PageKyc' }>

            <PageHeader />

            <div className = { 'PageContent AppContent' } >

                { kycStore.isVerified() === true && (
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

                { kycStore.isVerifycationInProgress() === true && (
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

                { kycStore.isVerified() === false && kycStore.isVerifycationInProgress() === false && (
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

            <div id="onfido-mount" className = { 'FlexSingleCenter ActiveDisplayHidden' } />

        </PageLayout>
    )
}

export default inject((stores) => stores)(observer(KycPage));
