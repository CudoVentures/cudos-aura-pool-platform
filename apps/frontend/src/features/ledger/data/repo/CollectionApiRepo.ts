import BigNumber from 'bignumber.js';
import { GasPrice, SigningStargateClient } from 'cudosjs';
import { Ledger } from 'cudosjs/build/ledgers/Ledger';
import { Coin } from 'cudosjs/build/stargate/modules/marketplace/proto-types/coin';
import { CHAIN_DETAILS } from '../../../../core/utilities/Constants';
import WalletRepo from '../../presentation/repos/WalletRepo';

export default class WalletApiRepo implements WalletRepo {

    async sendCudos(destinationAddress: string, amount: BigNumber, ledger: Ledger): Promise < string > {

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
    }
}
