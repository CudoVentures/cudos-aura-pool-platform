import React, { useState } from 'react'
import { inject, observer } from 'mobx-react';

import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import ProjectUtils from '../../../core/utilities/ProjectUtils';
import { CHAIN_DETAILS } from '../../../core/utilities/Constants';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import WalletSelectModalStore from '../stores/WalletSelectModalStore';

import Svg from '../../../core/presentation/components/Svg';
import Actions, { ActionsHeight, ActionsLayout } from '../../../core/presentation/components/Actions';
import Button, { ButtonRadius } from '../../../core/presentation/components/Button';
import Popover from '../../../core/presentation/components/Popover';

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import LaunchIcon from '@mui/icons-material/Launch';
import '../styles/header-wallet.css'

type Props = {
    accountSessionStore?: AccountSessionStore;
    walletStore?: WalletStore;
    walletSelectModalStore?: WalletSelectModalStore;
}

function HeaderWallet({ accountSessionStore, walletStore, walletSelectModalStore }: Props) {

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    function onClickCopyAddress() {
        ProjectUtils.copyText(walletStore.getAddress())
    }

    function onClickAddressMenu(event) {
        setAnchorEl(event.target.parentNode.parentNode);
    }

    async function onClickDisconnect() {
        await accountSessionStore.logout();
        setAnchorEl(null);
    }

    function handleClose() {
        setAnchorEl(null);
    }

    async function onClickConnectWallet() {
        await walletStore.tryConnect();
        if (walletStore.isConnected() === true) {
            if (accountSessionStore.doesAddressMatchAgainstSessionAccount(walletStore.getAddress()) === true) {
                return;
            }

            await walletStore.disconnect();
        }

        if (accountSessionStore.isSuperAdmin() === true) {
            walletSelectModalStore.showSignalAsSuperAdmin();
            return;
        }

        if (accountSessionStore.isAdmin() === true) {
            walletSelectModalStore.showSignalAsAdmin(null);
            return;
        }

        walletSelectModalStore.showSignalAsUser();
    }

    return (
        <div className = { 'HeaderWallet FlexRow' } >
            {accountSessionStore.isLoggedInAndWalletConnected() === true ? (
                <>
                    <div className={'FlexRow BalanceRow B2'}>
                        <Svg svg={AccountBalanceWalletIcon} className={ 'Secondary' }/>
                        <div className={'SemiBold'}>Balance:</div>
                        <div className={'Bold PrimaryColor'}>{walletStore.formatBalance()}</div>
                    </div>
                    <div className={'FlexRow AddressRow'}>
                        <div className={'Bold'}>{ProjectUtils.shortenAddressString(walletStore.getAddress(), 20)}</div>
                        <Svg className={'Clickable'} onClick={onClickAddressMenu} svg={MoreVertIcon} />
                    </div>

                    <Popover
                        open={anchorEl !== null}
                        anchorEl={anchorEl}
                        onClose={handleClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }} >
                        <div className={'HeaderWalletAddressPopover FlexColumn'}>
                            <div className={'Address B2'}>{ProjectUtils.shortenAddressString(walletStore.getAddress(), 20)}</div>
                            <div className={'ButtonRow FlexRow'}>
                                <Svg className={'Clickable'} svg={FileCopyIcon} onClick={onClickCopyAddress}/>
                                <a href={`${CHAIN_DETAILS.EXPLORER_URL}/accounts/${walletStore.getAddress()}`} target={'_blank'} rel="noreferrer"><Svg svg={LaunchIcon} /></a>
                            </div>
                            <Actions layout={ActionsLayout.LAYOUT_COLUMN_CENTER} height={ActionsHeight.HEIGHT_48}>
                                <Button radius={ButtonRadius.RADIUS_16} onClick={onClickDisconnect}>Logout</Button>
                            </Actions>
                        </div>
                    </Popover>
                </>
            ) : (
                <>
                    <Actions height={ActionsHeight.HEIGHT_48}>
                        <Button onClick={onClickConnectWallet}>Connect Wallet</Button>
                    </Actions>
                </>
            )
            }
        </div>
    )

}

export default inject((stores) => stores)(observer(HeaderWallet));
