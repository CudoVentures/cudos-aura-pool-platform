import React from 'react';
import { useNavigate } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

import AppRoutes from '../../../app-routes/entities/AppRoutes';
import AccountSessionStore from '../stores/AccountSessionStore';
import AlertStore from '../../../core/presentation/stores/AlertStore';

import Button from '../../../core/presentation/components/Button';
import PageLayout from '../../../core/presentation/components/PageLayout';
import PageFooter from '../../../layout/presentation/components/PageFooter';
import PageAdminHeader from '../../../layout/presentation/components/PageAdminHeader';
import AuthBlockLayout from '../components/AuthBlockLayout';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import '../styles/page-email-verification-confirmation.css';

type Props = {
    alertStore?: AlertStore;
    accountSessionStore?: AccountSessionStore;
}

function EmailVerificationConfirmationPage({ alertStore, accountSessionStore }: Props) {

    const navigate = useNavigate();

    async function onClickHome() {
        navigate(AppRoutes.HOME);
    }

    return (
        <PageLayout className = { 'PageEmailVerificationConfirmation' }>

            <PageAdminHeader />

            <div className = { 'PageContent AppContent' } >

                <AuthBlockLayout
                    confirmationTitle = { 'Email was verified!' }
                    confirmationTitleSvg = { CheckCircleIcon }
                    subtitle = { 'Congratulations, your email was verified. Start with creating your farm. ' }
                    actions = { (
                        <Button onClick = { onClickHome } >
                            To Farm Profile
                        </Button>
                    ) } />

            </div>

            <PageFooter />

        </PageLayout>
    )
}

export default inject((stores) => stores)(observer(EmailVerificationConfirmationPage));
