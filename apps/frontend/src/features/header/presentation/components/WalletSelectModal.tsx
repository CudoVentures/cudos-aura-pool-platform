import React from 'react';
import { inject, observer } from 'mobx-react';

import WalletSelectModalStore from '../stores/WalletSelectModalStore';
import WalletStore, { SessionStorageWalletOptions } from '../../../ledger/presentation/stores/WalletStore';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';

import ModalWindow from '../../../../core/presentation/components/ModalWindow';
import Svg from '../../../../core/presentation/components/Svg';

import FlashOnIcon from '@mui/icons-material/FlashOn';
import '../styles/wallet-select-modal.css';

type Props = {
    walletSelectModalStore?: WalletSelectModalStore;
    walletStore?: WalletStore
    accountSessionStore?: AccountSessionStore
}

function WalletSelectModal({ walletSelectModalStore, walletStore, accountSessionStore }: Props) {
    async function onClickToggleKeplr() {
        await tryConnect(SessionStorageWalletOptions.KEPLR);
    }

    async function onClickToggleCosmostation() {
        await tryConnect(SessionStorageWalletOptions.COSMOSTATION);
    }

    async function tryConnect(walletType: SessionStorageWalletOptions) {
        if (accountSessionStore.isSuperAdmin() === true) {
            throw Error('Super admins should not have wallets for now');
        }

        await walletStore.connectWallet(walletType);

        if (accountSessionStore.isAdmin() === true) {
            await accountSessionStore.loadSessionAccountsAndSync();
        } else {
            await accountSessionStore.login('', '', walletStore.getAddress(), walletStore.getName(), '');
        }

        walletSelectModalStore.hide();
    }

    return (
        <ModalWindow
            className = { 'SelectWalletPopup' }
            modalStore = { walletSelectModalStore } >
            <div className = { 'SelectWalletContent FlexColumn' }>
                <div className = { 'ModalHeader FlexRow B2 Bold'}>
                    <Svg svg={FlashOnIcon} />
                    Connect Wallet
                </div>
                <div className = { 'H2 ExtraBold' } >
                    <span className={ 'ColorPrimary' }>Connect</span> Your Wallet
                </div>

                <div className = { 'B1' } >
                    Select your prefered wallet to connect with.
                </div>

                <div className = { 'WalletOptions FlexColumn' } >
                    <div className = { 'ConnectButton FlexRow Transition H3 SemiBold' } onClick = { onClickToggleKeplr } >
                        <img className = { 'WalletIcon' } src={'/assets/img/keplr-icon.png'} />
                        Connect to Keplr
                    </div>
                    <div className = { 'ConnectButton FlexRow Transition H3 SemiBold' } onClick = { onClickToggleCosmostation } >
                        <img className = { 'WalletIcon' } src={'/assets/img/cosmostation-icon.png'} />
                        Connect to Cosmostation
                    </div>
                </div>

                <div className = { 'Footer FlexColumn B2 SemiBold' } >
                    <div>Can’t see your wallet here?</div>
                    <a className={'ColorPrimary'} href = { '' }>Learn more about wallets</a>
                </div>
            </div>
        </ModalWindow>
    )
}

export default inject((stores) => stores)(observer(WalletSelectModal));
