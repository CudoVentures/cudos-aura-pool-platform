import React from 'react';
import { inject, observer } from 'mobx-react';
import { Link, useNavigate } from 'react-router-dom';

import S from '../../../core/utilities/Main';
import WalletSelectModalStore, { ProgressSteps } from '../stores/WalletSelectModalStore';
import WalletStore, { SessionStorageWalletOptions } from '../../../ledger/presentation/stores/WalletStore';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import AppRoutes from '../../../app-routes/entities/AppRoutes';
import AlertStore from '../../../core/presentation/stores/AlertStore';
import KycStore from '../../../kyc/presentation/stores/KycStore';

import InputAdornment from '@mui/material/InputAdornment/InputAdornment';
import ModalWindow from '../../../core/presentation/components/ModalWindow';
import Svg, { SvgSize } from '../../../core/presentation/components/Svg';
import NavRow, { createNavStep, NavStep } from '../../../core/presentation/components/NavRow';
import Actions from '../../../core/presentation/components/Actions';
import Button, { ButtonColor, ButtonType } from '../../../core/presentation/components/Button';
import AnimationContainer from '../../../core/presentation/components/AnimationContainer';
import Input from '../../../core/presentation/components/Input';
import InfoBlueBox from '../../../core/presentation/components/InfoBlueBox';

import SvgWavesLoading from '../../../public/assets/vectors/waves-loading.svg';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import '../styles/wallet-select-modal.css';

type Props = {
    walletSelectModalStore?: WalletSelectModalStore;
    walletStore?: WalletStore;
    accountSessionStore?: AccountSessionStore;
    kycStore?: KycStore;
    alertStore?: AlertStore;
}

function WalletSelectModal({ walletSelectModalStore, walletStore, accountSessionStore, kycStore, alertStore }: Props) {

    const navigate = useNavigate();

    async function onClickToggleKeplr() {
        await tryConnect(SessionStorageWalletOptions.KEPLR);
    }

    async function onClickToggleCosmostation() {
        await tryConnect(SessionStorageWalletOptions.COSMOSTATION);
    }

    async function tryConnect(walletType: SessionStorageWalletOptions) {
        walletSelectModalStore.markAsWalletConnecting(walletType);
        try {
            await walletStore.connectWallet(walletType);
        } catch (e) {
            console.log(e);
        }

        if (walletStore.isConnected() === true) {
            const userMatch = walletSelectModalStore.isModeUser() && accountSessionStore.doesAddressMatchAgainstSessionUserIfAny(walletStore.getAddress());
            const adminMatch = walletSelectModalStore.isModeAdmin() && accountSessionStore.doesAddressMatchAgainstSessionAdminIfAny(walletStore.getAddress());
            const superAdminMatch = walletSelectModalStore.isModeSuperAdmin() && accountSessionStore.isSuperAdmin();
            if (userMatch || adminMatch || superAdminMatch) {
                walletSelectModalStore.markAsWalletConnectedSuccessfully();
            } else {
                walletSelectModalStore.markAsWalletError();
                walletStore.disconnect();
            }
        } else {
            walletSelectModalStore.markAsWalletError();
        }
    }

    async function register() {
        if (walletSelectModalStore.isModeUser() === true) {
            const address = walletStore.getAddress()
            await accountSessionStore.loginWithWallet(address, walletStore.getName(), walletSelectModalStore.signature, walletSelectModalStore.sequence, walletSelectModalStore.accountNumber);
        }

        walletSelectModalStore.onFinish?.(walletSelectModalStore.signature, walletSelectModalStore.sequence, walletSelectModalStore.accountNumber);
    }

    async function sendIdentityTx() {
        walletSelectModalStore.markIdentityTxWaiting();

        try {
            const signature = await walletStore.signNonceMsg();
            walletSelectModalStore.signature = signature;
            walletSelectModalStore.markIdentityTxDoneSuccessfully();
        } catch (ex) {
            alertStore.show(ex.message);
            walletSelectModalStore.markIdentityTxError();
        }
    }

    async function onClickBack() {
        switch (walletSelectModalStore.progressStep) {
            case ProgressSteps.SIGN:
                walletSelectModalStore.moveToProgressStepConnectWallet();
                break;
            case ProgressSteps.KYC:
                walletSelectModalStore.moveToProgressStepSign();
                break;
            default:
        }
    }

    async function onClickNext() {
        switch (walletSelectModalStore.progressStep) {
            case ProgressSteps.CONNECT_WALLET:
                if (walletSelectModalStore.isModeUser() === true) {
                    if (accountSessionStore.isLoggedIn() === false) {
                        walletSelectModalStore.moveToProgressStepSign();
                    } else if (kycStore.isAnyVerificationNotStarted() === true) {
                        walletSelectModalStore.moveToProgressStepKyc();
                    } else {
                        walletSelectModalStore.hide();
                    }
                } else if (walletSelectModalStore.isModeAdmin() === true) {
                    if (accountSessionStore.isLoggedIn() === false) {
                        walletSelectModalStore.moveToProgressStepSign();
                    } else {
                        walletSelectModalStore.hide();
                    }
                } else if (walletSelectModalStore.isModeSuperAdmin() === true) {
                    walletSelectModalStore.hide();
                }
                break;
            case ProgressSteps.SIGN:
                if (walletSelectModalStore.isIdentityTxDoneSuccessfully() === false) {
                    sendIdentityTx();
                } else {
                    await register();
                    if (walletSelectModalStore.isModeUser() === true) {
                        if (kycStore.isAnyVerificationNotStarted() === true) {
                            walletSelectModalStore.moveToProgressStepKyc();
                        } else {
                            walletSelectModalStore.hide();
                        }
                    } else if (walletSelectModalStore.isModeAdmin() === true) {
                        walletSelectModalStore.hide();
                    }
                }
                break;
            case ProgressSteps.KYC:
                walletSelectModalStore.hide();
                navigate(AppRoutes.KYC);
                break;
            default:
        }
    }

    function onClickSkip() {
        walletSelectModalStore.hide();
    }

    function onClickLogin() {
        walletSelectModalStore.hide();
        navigate(AppRoutes.LOGIN);
    }

    async function onClickLogout() {
        await accountSessionStore.logout();
        walletSelectModalStore.hide();
        navigate(AppRoutes.HOME);
    }

    function renderNavSteps(): NavStep[] {
        let stepsCounter = 0;
        return walletSelectModalStore.progressSteps.map((progressStep) => {
            switch (progressStep) {
                case ProgressSteps.CONNECT_WALLET:
                    return createNavStep(++stepsCounter, 'Connect Wallet', walletSelectModalStore.isProgressStepConnectWallet() === true, walletSelectModalStore.isProgressStepConnectWallet() === false);
                case ProgressSteps.SIGN:
                    return createNavStep(++stepsCounter, 'Sign a transaction', walletSelectModalStore.isProgressStepSign() === true, walletSelectModalStore.isProgressStepKyc());
                case ProgressSteps.KYC:
                    return createNavStep(++stepsCounter, 'Verify Account', walletSelectModalStore.isProgressStepKyc(), false);
                default:
                    return null;
            }
        })
    }

    function renderLoading(title, subtitle) {
        return (
            <div className = { 'LoadingSection' } >
                <Svg className = { 'WavesLoading' } svg = { SvgWavesLoading } size = { SvgSize.CUSTOM } />
                <div className = { 'LoadingTitle H1 ExtraBold' } >{ title }</div>
                <div className = { 'LoadingSubtitle' } > { subtitle } </div>
            </div>
        )
    }

    function renderIdentityTxEndAdornment() {
        if (walletSelectModalStore.isIdentityTxDoneSuccessfully() === true) {
            return (
                <InputAdornment position = 'end' >
                    <Svg className = { 'IconInputAdornment IconInputAdornmentSuccess' } svg = { CheckIcon } size = { SvgSize.CUSTOM } />
                </InputAdornment>
            )
        }

        if (walletSelectModalStore.isIdentityTxError() === true) {
            return (
                <InputAdornment position = 'end' >
                    <Svg className = { 'IconInputAdornment IconInputAdornmentError' } svg = { ClearIcon } size = { SvgSize.CUSTOM } />
                </InputAdornment>
            )
        }

        return null
    }

    return (
        <ModalWindow
            className = { 'SelectWalletPopup' }
            modalStore = { walletSelectModalStore } >
            <NavRow
                className = { 'ModalWalletNavRow' }
                navSteps = { renderNavSteps() } />

            <AnimationContainer className = { 'ProgressStep ProgressStepConnectWallet FlexColumn' } active = { walletSelectModalStore.isProgressStepConnectWallet() } >
                <AnimationContainer active = {walletSelectModalStore.isWalletConnecting() === false } >
                    <div className = { 'H3 Bold' } >Connect Your Wallet</div>

                    <div className = { 'ModalWalletSubtitle' } >
                        Select your preferred wallet to connect with.<br />
                        By connecting your wallet you are agreeing to Aura Pool’s <Link to = { AppRoutes.TERMS_AND_CONDITIONS } target="_blank" rel="noopener noreferrer" className = { 'ColorPrimary060' }>terms of use</Link>
                    </div>

                    <div className = { `ConnectButton FlexRow Transition H3 SemiBold ${S.CSS.getClassName(walletSelectModalStore.isKeplrConnectedSuccessfully(), 'ConnectButtonSuccess')} ${S.CSS.getClassName(walletSelectModalStore.isKeplrError(), 'ConnectButtonError')}` } onClick = { onClickToggleKeplr } >
                        <img className = { 'WalletIcon' } src={'/assets/img/keplr-icon.png'} />
                        <div className = { 'FlexColumn' }>
                            Connect to Keplr
                            { walletSelectModalStore.isKeplrError() === true && (
                                <div className = { 'WalletErrorLabel' } >There was an error connecting to the wallet.</div>
                            ) }
                        </div>
                        <Svg className = { 'IconWalletConnectionStatus' } size = { SvgSize.CUSTOM } svg = { walletSelectModalStore.isWalletConnectedSuccessfully() === true ? CheckIcon : ClearIcon } />
                    </div>
                    <div className = { `ConnectButton FlexRow Transition H3 SemiBold ${S.CSS.getClassName(walletSelectModalStore.isCosmostationConnectedSuccessfully(), 'ConnectButtonSuccess')} ${S.CSS.getClassName(walletSelectModalStore.isCosmostationError(), 'ConnectButtonError')}` } onClick = { onClickToggleCosmostation } >
                        <img className = { 'WalletIcon' } src={'/assets/img/cosmostation-icon.png'} />
                        <div className = { 'FlexColumn' } >
                            Connect to Cosmostation
                            { walletSelectModalStore.isCosmostationError() === true && (
                                <div className = { 'WalletErrorLabel' } >There was an error connecting to the wallet.</div>
                            ) }
                        </div>
                        <Svg className = { 'IconWalletConnectionStatus' } size = { SvgSize.CUSTOM } svg = { walletSelectModalStore.isWalletConnectedSuccessfully() === true ? CheckIcon : ClearIcon } />
                    </div>
                </AnimationContainer>

                <AnimationContainer active = {walletSelectModalStore.isWalletConnecting() } >
                    { renderLoading(
                        'Connecting', (
                            <>
                              Please don’t close this window.<br />It will be ready in a second.
                            </>
                        ),
                    ) }
                </AnimationContainer>
            </AnimationContainer>

            <AnimationContainer className = { 'ProgressStep ProgressStepSign FlexColumn' } active = { walletSelectModalStore.isProgressStepSign() } >
                <AnimationContainer active = { walletSelectModalStore.isIdentityTxWaiting() === false }>
                    <div className = { 'H3 Bold' } >
                        Sign a transaction
                    </div>

                    <div className = { 'ModalWalletSubtitle' } >
                        Sign a transaction in order to ensure that this wallet belongs to you. You will NOT be charged and no actual transaction will be executed on the chain.
                    </div>

                    <Input
                        label={'You wallet address'}
                        value={walletStore.getAddress()}
                        InputProps = { {
                            endAdornment: renderIdentityTxEndAdornment(),
                        } } />
                </AnimationContainer>
                <AnimationContainer active = { walletSelectModalStore.isIdentityTxWaiting() === true }>
                    { renderLoading(
                        'Processing', (
                            <>
                              Please don’t close this window.<br />It will be ready in a second.
                            </>
                        ),
                    ) }
                </AnimationContainer>
            </AnimationContainer>

            <AnimationContainer className = { 'ProgressStep ProgressStepKyc FlexColumn' } active = { walletSelectModalStore.isProgressStepKyc() } >
                <div className = { 'H3 Bold' } >
                    Verify your account
                    <InfoBlueBox
                        className = { 'KycInfo' }
                        text = { 'You can skip this step for now, but you won’t be able to purchase an NFT until you have been verified.' } />
                </div>
            </AnimationContainer>

            { walletSelectModalStore.isWalletConnecting() === false && walletSelectModalStore.isIdentityTxWaiting() === false && (
                <div className = { 'ModalWalletFooter B2 SemiBold FlexSplit' } >
                    { walletSelectModalStore.isProgressStepConnectWallet() === true ? (
                        <div className = { 'WalletInfo FlexColumn' }>
                            <div>Can’t see your wallet here?</div>
                            <a className={'ColorPrimary060'} href = { '' }>Learn more about wallets</a>
                        </div>
                    ) : (
                        <>
                            { walletSelectModalStore.hasBackStep() === true && (
                                <Actions>
                                    <Button type = { ButtonType.TEXT_INLINE } onClick = { onClickBack }>
                                        <Svg svg = { ArrowBackIcon } />
                                        Back
                                    </Button>
                                </Actions>
                            ) }
                        </>
                    ) }
                    <Actions className = { 'StartRight' } >
                        { walletSelectModalStore.hasNextStep() === true ? (
                            <>
                                { walletSelectModalStore.isProgressStepKyc() === true && (
                                    <Button type = { ButtonType.TEXT_INLINE } color = { ButtonColor.SCHEME_3 } onClick = { onClickSkip }>Skip</Button>
                                ) }
                                <Button onClick = { onClickNext }>
                                    { walletSelectModalStore.isProgressStepKyc() === false ? (
                                        'Next Step'
                                    ) : (
                                        'Start Verification'
                                    ) }
                                </Button>
                            </>
                        ) : (
                            <>
                                { accountSessionStore.isLoggedIn() === true && (
                                    <>
                                        { accountSessionStore.isUser() === true ? (
                                            <Button onClick = { onClickLogout }>Logout with current account</Button>
                                        ) : (
                                            <Button onClick = { onClickLogin }>Log in with other account</Button>
                                        ) }
                                    </>
                                ) }
                            </>
                        ) }
                    </Actions>
                </div>
            ) }
        </ModalWindow>
    )
}

export default inject((stores) => stores)(observer(WalletSelectModal));
