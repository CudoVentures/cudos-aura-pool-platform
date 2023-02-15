import React from 'react';

import PageLayout from '../../../core/presentation/components/PageLayout';
import PageFooter from '../../../layout/presentation/components/PageFooter';
import PageHeader from '../../../layout/presentation/components/PageHeader';
import StyledContainer from '../../../core/presentation/components/StyledContainer';

import '../styles/page-terms-and-conditions.css';

export default function TermsAndConditionsPage() {

    return (
        <PageLayout className = { 'PageTermsAndConditions' }>

            <PageHeader />

            <div className = { 'PageContent PageContentDefaultPadding AppContent' } >

                <StyledContainer>

                </StyledContainer>

            </div>

            <PageFooter />

        </PageLayout>
    )
}
