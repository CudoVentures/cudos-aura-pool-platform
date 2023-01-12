import React from 'react';

import PageLayout from '../../../core/presentation/components/PageLayout';

import '../styles/not-found-page.css';

export default function NotFoundPage() {

    return (
        <PageLayout className = { 'NotFoundPage' } >
            <div className = { 'H1 FlexSingleCenter' } >Page not found</div>
        </PageLayout>
    )

}
