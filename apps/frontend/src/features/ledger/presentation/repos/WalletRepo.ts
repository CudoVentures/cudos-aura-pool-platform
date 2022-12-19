import BigNumber from 'bignumber.js';
import { Ledger } from 'cudosjs';

export default interface WalletRepo {
    setPresentationActionsCallbacks(enableActions: () => void, disableActions: () => void);
    setPresentationAlertCallbacks(showAlert: (msg: string, positiveListener : null | (() => boolean | void), negativeListener: null | (() => boolean | void)) => void);

    sendCudos(destinationAddress: string, amount: BigNumber, ledger: Ledger): Promise<string>;
}
