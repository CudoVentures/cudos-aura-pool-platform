import React, { useRef } from 'react';
import { inject, observer } from 'mobx-react';
import { useNavigate } from 'react-router-dom';

import S from '../../../../core/utilities/Main';
import WalletSelectModalStore, { ProgressSteps } from '../stores/WalletSelectModalStore';
import WalletStore, { SessionStorageWalletOptions } from '../../../ledger/presentation/stores/WalletStore';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import ValidationState from '../../../../core/presentation/stores/ValidationState';
import AppRoutes from '../../../app-routes/entities/AppRoutes';

import { InputAdornment } from '@mui/material';
import ModalWindow from '../../../../core/presentation/components/ModalWindow';
import Svg, { SvgSize } from '../../../../core/presentation/components/Svg';
import NavRow, { createNavStep, NavStep } from '../../../../core/presentation/components/NavRow';
import Actions from '../../../../core/presentation/components/Actions';
import Button, { ButtonColor, ButtonType } from '../../../../core/presentation/components/Button';
import AnimationContainer from '../../../../core/presentation/components/AnimationContainer';
import Input from '../../../../core/presentation/components/Input';
import InfoGrayBox from '../../../../core/presentation/components/InfoGrayBox';

import SvgWavesLoading from '../../../../public/assets/vectors/waves-loading.svg';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import '../styles/wallet-select-modal.css';

type Props = {
    walletSelectModalStore?: WalletSelectModalStore;
    walletStore?: WalletStore
    accountSessionStore?: AccountSessionStore
}

function WalletSelectModal({ walletSelectModalStore, walletStore, accountSessionStore }: Props) {

    const navigate = useNavigate();
    const validationState = useRef(new ValidationState()).current;
    const validationBitcoin = useRef(validationState.addBitcoinAddressValidation('Invalid address')).current;

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

        walletSelectModalStore.markAsWalletConnecting(walletType);
        await walletStore.connectWallet(walletType);
        if (walletStore.isConnected() === true) {
            const userMatch = walletSelectModalStore.isModeUser() && accountSessionStore.doesAddressMatchAgainstSessionUserIfAny(walletStore.getAddress());
            const adminMatch = walletSelectModalStore.isModeAdmin() && accountSessionStore.doesAddressMatchAgainstSessionAdminIfAny(walletStore.getAddress());
            if (userMatch || adminMatch) {
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

    async function sendBitcoinAddressTx() {
        walletSelectModalStore.markBitcoinAddressTxWaiting();
        setTimeout(() => {
            walletSelectModalStore.markBitcoinAddressTxDoneSuccessfully();
        }, 2000);
    }

    async function sendIdentityTx() {
        walletSelectModalStore.markIdentityTxWaiting();
        try {
            const { signature, sequence, accountNumber } = await walletStore.signNonceMsg();
            walletSelectModalStore.signature = signature;
            walletSelectModalStore.sequence = sequence;
            walletSelectModalStore.accountNumber = accountNumber;
            walletSelectModalStore.markIdentityTxDoneSuccessfully();
        } catch (ex) {
            walletSelectModalStore.markIdentityTxError();
        }
    }

    function onChangeBitcoinAddress(value) {
        walletSelectModalStore.bitcoinAddress = value;
    }

    function onClickBack() {
        switch (walletSelectModalStore.progressStep) {
            case ProgressSteps.BTC:
                walletSelectModalStore.moveToProgressStepConnectWallet();
                break;
            case ProgressSteps.SIGN:
                walletSelectModalStore.moveToProgressStepBtc();
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
                    walletSelectModalStore.moveToProgressStepBtc();
                } else if (walletSelectModalStore.isModeAdmin() === true) {
                    walletSelectModalStore.moveToProgressStepSign();
                }
                break;
            case ProgressSteps.BTC:
                if (walletSelectModalStore.isBitcoinAddressTxDoneSuccessfully() === false) {
                    if (validationState.getIsErrorPresent() === true) {
                        validationState.setShowErrors(true);
                        return;
                    }
                    sendBitcoinAddressTx();
                } else {
                    walletSelectModalStore.moveToProgressStepSign();
                }
                break;
            case ProgressSteps.SIGN:
                if (walletSelectModalStore.isIdentityTxDoneSuccessfully() === false) {
                    sendIdentityTx();
                } else {
                    await register();
                    if (walletSelectModalStore.isModeUser() === true) {
                        walletSelectModalStore.moveToProgressStepKyc();
                    } else if (walletSelectModalStore.isModeAdmin() === true) {
                        walletSelectModalStore.hide();
                    }
                }
                break;
            case ProgressSteps.KYC:
                walletSelectModalStore.hide();
                break;
            default:
        }
    }

    function onClickSkip() {
        walletSelectModalStore.hide();
    }

    function onClickLogin() {
        navigate(AppRoutes.LOGIN);
    }

    function renderNavSteps(): NavStep[] {
        if (walletSelectModalStore.isModeUser() === true) {
            return [
                createNavStep(1, 'Connect Wallet', walletSelectModalStore.isProgressStepConnectWallet() === true, walletSelectModalStore.isProgressStepConnectWallet() === false),
                createNavStep(2, 'Set BTC Address', walletSelectModalStore.isProgressStepBtc() === true, walletSelectModalStore.isProgressStepSign() || walletSelectModalStore.isProgressStepKyc()),
                createNavStep(3, 'Sign a transaction', walletSelectModalStore.isProgressStepSign() === true, walletSelectModalStore.isProgressStepKyc()),
                createNavStep(4, 'Verify Account', walletSelectModalStore.isProgressStepKyc(), false),
            ]
        }

        if (walletSelectModalStore.isModeAdmin() === true) {
            const steps = [createNavStep(1, 'Connect Wallet', walletSelectModalStore.isProgressStepConnectWallet() === true, walletSelectModalStore.isProgressStepConnectWallet() === false)];
            if (accountSessionStore.isAdmin() === false) {
                steps.push(
                    createNavStep(2, 'Sign a transaction', walletSelectModalStore.isProgressStepSign() === true, false),
                )
            }
            return steps;
        }

        return [];
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

    function renderBitcoinAddressTxEndAdornment() {
        if (walletSelectModalStore.isBitcoinAddressTxDoneSuccessfully() === true) {
            return (
                <InputAdornment position = 'end' >
                    <Svg className = { 'IconInputAdornment IconInputAdornmentSuccess' } svg = { CheckIcon } size = { SvgSize.CUSTOM } />
                </InputAdornment>
            )
        }

        if (walletSelectModalStore.isBitcoinAddressTxError() === true) {
            return (
                <InputAdornment position = 'end' >
                    <Svg className = { 'IconInputAdornment IconInputAdornmentError' } svg = { ClearIcon } size = { SvgSize.CUSTOM } />
                </InputAdornment>
            )
        }

        return null
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
                    <div className = { 'H3 Bold' } >
                    Connect Your Wallet
                    </div>

                    <div className = { 'ModalWalletSubtitle' } >
                    Select your prefered wallet to connect with.
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

            <AnimationContainer className = { 'ProgressStep ProgressStepBtc FlexColumn' } active = { walletSelectModalStore.isProgressStepBtc() } >
                <AnimationContainer active = { walletSelectModalStore.isBitcoinAddressTxWaiting() === false }>
                    <div className = { 'H3 Bold' } >
                        Provide your BTC Address
                    </div>

                    <div className = { 'ModalWalletSubtitle' } >
                        This address will be used for all their BTC payouts from all NFTs that they could own in the future.
                    </div>

                    <Input
                        label={'Set Rewards Recipient Address (BTC Address)'}
                        placeholder={'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'}
                        value={walletSelectModalStore.bitcoinAddress}
                        inputValidation={validationBitcoin}
                        onChange={onChangeBitcoinAddress}
                        InputProps = { {
                            endAdornment: renderBitcoinAddressTxEndAdornment(),
                        } } />
                </AnimationContainer>
                <AnimationContainer active = { walletSelectModalStore.isBitcoinAddressTxWaiting() === true }>
                    { renderLoading(
                        'Processing', (
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
                        Sign a transaction in order to ensure that this wallet belongs to you. You WILL not be changed and no actual transaction will be executed on the chain.
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
                    <InfoGrayBox
                        className = { 'KycInfo' }
                        text = { 'This is needed in order for you to buy NFTs. You can skip this step for later, but you won’t be able to complete purchase on one NFT.' } />
                </div>
            </AnimationContainer>

            { walletSelectModalStore.isWalletConnecting() === false && walletSelectModalStore.isBitcoinAddressTxWaiting() === false && walletSelectModalStore.isIdentityTxWaiting() === false && (
                <div className = { 'ModalWalletFooter B2 SemiBold FlexSplit' } >
                    { walletSelectModalStore.isProgressStepConnectWallet() === true ? (
                        <div className = { 'WalletInfo FlexColumn' }>
                            <div>Can’t see your wallet here?</div>
                            <a className={'ColorPrimary'} href = { '' }>Learn more about wallets</a>
                        </div>
                    ) : (
                        <Actions>
                            <Button type = { ButtonType.TEXT_INLINE } onClick = { onClickBack }>
                                <Svg svg = { ArrowBackIcon } />
                                Back
                            </Button>
                        </Actions>
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
                                    <Button onClick = { onClickLogin }>Log with other account</Button>
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
