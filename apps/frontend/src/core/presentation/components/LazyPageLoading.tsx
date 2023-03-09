import React, { Suspense } from 'react';

import LoadingIndicator from './LoadingIndicator';

import '../styles/lazy-page-loading-component.css';

export default function LazyPageLoading({ children }: React.PropsWithChildren) {
    return (
        <Suspense fallback = { <LoadingIndicator className = { 'LazyPageLoadingIndicator' } size = { '64px' } /> } >
            { children }
        </Suspense>
    )
}
