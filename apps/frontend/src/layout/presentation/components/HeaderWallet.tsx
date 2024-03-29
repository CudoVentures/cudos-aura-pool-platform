import React, { useState } from 'react'
import { inject, observer } from 'mobx-react';
import { useNavigate } from 'react-router-dom';

import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import ProjectUtils from '../../../core/utilities/ProjectUtils';
import { CHAIN_DETAILS } from '../../../core/utilities/Constants';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import WalletSelectModalStore from '../stores/WalletSelectModalStore';
import AppRoutes from '../../../app-routes/entities/AppRoutes';
import SnackStore from '../../../core/presentation/stores/SnackStore';

import Svg from '../../../core/presentation/components/Svg';
import Actions, { ActionsHeight, ActionsLayout } from '../../../core/presentation/components/Actions';
import Button, { ButtonRadius } from '../../../core/presentation/components/Button';
import Popover from '../../../core/presentation/components/Popover';

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import LaunchIcon from '@mui/icons-material/Launch';
import '../styles/header-wallet.css'
import S from '../../../core/utilities/Main';

type Props = {
    accountSessionStore?: AccountSessionStore;
    walletStore?: WalletStore;
    walletSelectModalStore?: WalletSelectModalStore;
    snackStore?: SnackStore;
}

function HeaderWallet({ accountSessionStore, walletStore, walletSelectModalStore, snackStore }: Props) {

    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    function onClickCopyAddress() {
        try {
            ProjectUtils.copyText(walletStore.getAddress());
            snackStore.showSuccess('Address is copied to the clipboard');
        } catch (ex) {
            snackStore.showError('There was an error copying the address to the clipboard');
        }
    }

    function onClickAddressMenu(event) {
        setAnchorEl(event.target.parentNode.parentNode);
    }

    async function onClickDisconnect() {
        await accountSessionStore.logout();
        navigate(AppRoutes.HOME);
        handleClose();
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
        <>
            { accountSessionStore.isLoggedIn() === true && (
                <div className = { 'HeaderWalletSeparator' } />
            ) }
            <div className = { 'HeaderWallet FlexRow' } >
                {accountSessionStore.isLoggedInAndWalletConnected() === true ? (
                    <>
                        <div className={'FlexRow BalanceRow B2'}>
                            <Svg svg={AccountBalanceWalletIcon} className={ 'Secondary' }/>
                            <div className={'SemiBold'}>Balance:</div>
                            <div className={'Bold'}>{walletStore.formatBalance()}</div>
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
                                <div
                                    className={`ProfilePicture ${S.CSS.getClassName(accountSessionStore.userEntity?.hasProfileImg() === false, 'Empty')}`}
                                    style={ accountSessionStore.userEntity?.hasProfileImg() === true ? ProjectUtils.makeBgImgStyle(accountSessionStore.userEntity.profileImgUrl) : null } />
                                <div className={'Address B2'}>{ProjectUtils.shortenAddressString(walletStore.getAddress(), 20)}</div>
                                <div className={'ButtonRow FlexRow'}>
                                    <div className={'SvgButton FlexRow'}>
                                        <Svg className={'Clickable'} svg={FileCopyIcon} onClick={onClickCopyAddress}/>
                                    </div>
                                    <div className={'SvgButton FlexRow'}>
                                        <a href={`${CHAIN_DETAILS.EXPLORER_URL}/accounts/${walletStore.getAddress()}`} target={'_blank'} rel="noreferrer"><Svg svg={LaunchIcon} /></a>
                                    </div>
                                </div>
                                <Actions layout={ActionsLayout.LAYOUT_COLUMN_FULL} height={ActionsHeight.HEIGHT_48}>
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
        </>
    )

}

export default inject((stores) => stores)(observer(HeaderWallet));
