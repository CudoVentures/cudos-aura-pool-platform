import React, { useRef, useState } from 'react';
import { inject, observer } from 'mobx-react';

import AccountSessionStore from '../stores/AccountSessionStore';
import ValidationState from '../../../../core/presentation/stores/ValidationState';

import Input from '../../../../core/presentation/components/Input';
import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';
import PageFooter from '../../../footer/presentation/components/PageFooter';
import PageAdminHeader from '../../../header/presentation/components/PageAdminHeader';
import Button from '../../../../core/presentation/components/Button';
import AuthBlockLayout from '../components/AuthBlockLayout';

import '../styles/page-bitcoin-confirm.css';

type Props = {
    accountSessionStore?: AccountSessionStore;
}

function BitcoinConfirmPage({ accountSessionStore }: Props) {
    const validationState = useRef(new ValidationState()).current;
    const validationBitcoin = useRef(validationState.addBitcoinAddressValidation('Invalid address')).current;

    const [bitcoinAddress, setBitcoinAddress] = useState('');

    function onClickConfirmBitcoinAddress() {
        if (validationState.getIsErrorPresent() === true) {
            validationState.setShowErrors(true);
            return;
        }
        // TO DO: submit a tx
        accountSessionStore.confirmBitcoinAddress();
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
                            inputValidation={validationBitcoin}
                            onChange={setBitcoinAddress} />
                    ) }
                    actions = { (
                        <Button onClick={onClickConfirmBitcoinAddress}>Confirm</Button>
                    ) } />

            </div>

            <PageFooter />

        </PageLayoutComponent>
    )

}

export default inject((stores) => stores)(observer(BitcoinConfirmPage));
