import BigNumber from 'bignumber.js';
import { Ledger } from 'cudosjs';

export default interface WalletRepo {
    sendCudos(destinationAddress: string, amount: BigNumber, ledger: Ledger): Promise<string>;
}
