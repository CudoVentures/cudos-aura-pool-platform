import React, { useState } from 'react';
import { inject, observer } from 'mobx-react';

import AccountSessionStore from '../stores/AccountSessionStore';

import Input from '../../../../core/presentation/components/Input';
import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';
import PageFooter from '../../../footer/presentation/components/PageFooter';
import PageAdminHeader from '../../../header/presentation/components/PageAdminHeader';
import Button from '../../../../core/presentation/components/Button';
import LoadingIndicator from '../../../../core/presentation/components/LoadingIndicator';
import AuthBlockLayout from '../components/AuthBlockLayout';

import '../styles/page-bitcoin-confirm.css';

type Props = {
    accountSessionStore?: AccountSessionStore;
}

function BitcoinConfirmPage({ accountSessionStore }: Props) {

    const [loading, setLoading] = useState(false);
    const [bitcoinAddress, setBitcoinAddress] = useState('');

    function onClickConfirmBitcoinAddress() {
        // TO DO: submit a tx
        setLoading(true);
        accountSessionStore.confirmBitcoinAddress();
        setLoading(false);
    }

    return (
        <PageLayoutComponent className = { 'PageBitcoinConfirm' } >

            <PageAdminHeader />

            <div className = { 'PageContent AppContent' } >

                <AuthBlockLayout
                    title = { 'Confirm bitcoin address' }
                    subtitle = { 'Fill your bitcoin address' }
                    content = { (
                        <Input
                            label={'Bitcoin address'}
                            placeholder={'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'}
                            value={bitcoinAddress}
                            onChange={setBitcoinAddress} />
                    ) }
                    actions = { (
                        <Button onClick={loading === true ? null : onClickConfirmBitcoinAddress}>
                            {loading === true ? <LoadingIndicator /> : 'Confirm'}
                        </Button>
                    ) } />

            </div>

            <PageFooter />

        </PageLayoutComponent>
    )

}

export default inject((stores) => stores)(observer(BitcoinConfirmPage));
