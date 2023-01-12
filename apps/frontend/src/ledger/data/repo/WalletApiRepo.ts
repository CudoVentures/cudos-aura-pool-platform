import BigNumber from 'bignumber.js';
import { GasPrice, SigningStargateClient } from 'cudosjs';
import { Ledger } from 'cudosjs/build/ledgers/Ledger';
import { Coin } from 'cudosjs/build/stargate/modules/marketplace/proto-types/coin';
import { CHAIN_DETAILS } from '../../../core/utilities/Constants';
import WalletRepo from '../../presentation/repos/WalletRepo';

export default class WalletApiRepo implements WalletRepo {

    enableActions: () => void;
    disableActions: () => void;
    showAlert: (msg: string, positiveListener?: null | (() => boolean | void), negativeListener?: null | (() => boolean | void)) => void;

    constructor() {
        this.enableActions = null;
        this.disableActions = null;
        this.showAlert = null;
    }

    setPresentationActionsCallbacks(enableActions: () => void, disableActions: () => void) {
        this.enableActions = enableActions;
        this.disableActions = disableActions;
    }

    setPresentationAlertCallbacks(showAlert: (msg: string, positiveListener: null | (() => boolean | void), negativeListener: null | (() => boolean | void)) => void) {
        this.showAlert = showAlert;
    }

    async sendCudos(destinationAddress: string, amount: BigNumber, ledger: Ledger): Promise < string > {
        try {
            this.disableActions?.();
            const signingClient = await SigningStargateClient.connectWithSigner(CHAIN_DETAILS.RPC_ADDRESS, ledger.offlineSigner, {
                gasPrice: GasPrice.fromString(CHAIN_DETAILS.GAS_PRICE + CHAIN_DETAILS.NATIVE_TOKEN_DENOM),
            });

            const decimals = (new BigNumber(10)).pow(18);
            const coin = Coin.fromJSON({
                amount: amount.multipliedBy(decimals).toFixed(),
                denom: CHAIN_DETAILS.NATIVE_TOKEN_DENOM,
            })
            const tx = await signingClient.sendTokens(ledger.accountAddress, destinationAddress, [coin], 'auto');

            const txHash = tx.transactionHash;

            return txHash;
        } catch (ex) {
            return ''
        } finally {
            this.enableActions?.();
        }
    }
}
