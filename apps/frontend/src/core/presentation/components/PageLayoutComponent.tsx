import React from 'react';

import Dimmer from './Dimmer';
import DisableActions from './DisableActions';
import PageLoadingIndicator from './PageLoadingIndicator';
import Alert from './Alert';
import WalletSelectModal from '../../../features/header/presentation/components/WalletSelectModal';
import Snack from './Snack';

import '../styles/main.css';
import '../styles/content.css';
import '../styles/fonts.css';
import '../styles/page-layout-component.css';

type Props = {
    className?: string;
    modals?: any | any[],
    alert?: React.Component | null,
    snack?: React.Component | null,
}

export default function PageLayoutComponent({ className, modals, alert, snack, children }: React.PropsWithChildren < Props >) {
    return (
        <div className = { `ReactBody ${className}` } >

            <div className = { 'Page Transition' } >
                { children }
            </div>

            <Dimmer />
            {
                <>
                    {modals}
                    <WalletSelectModal />
                </>
            }
            { alert }
            { snack }
            <DisableActions />
            <PageLoadingIndicator />
        </div>
    )
}

PageLayoutComponent.defaultProps = {
    className: '',
    modals: null,
    alert: <Alert />,
    snack: <Snack />,
};
