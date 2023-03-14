import BigNumber from 'bignumber.js';
import { CudosSigningStargateClient } from 'cudosjs/build/stargate/cudos-signingstargateclient';
import CudosDataEntity from '../../entities/CudosDataEntity';

export default interface CudosRepo {

    setPresentationActionsCallbacks(enableActions: () => void, disableActions: () => void);
    setPresentationAlertCallbacks(showAlert: (msg: string, positiveListener : null | (() => boolean | void), negativeListener: null | (() => boolean | void)) => void);

    fetchCudosData(): Promise < CudosDataEntity >;
    fetchAcudosBalance(address: string): Promise < BigNumber >;
    creditBitcoinPayoutAddress(client: CudosSigningStargateClient, cudosWalletAddress: string, bitcoinAddress: string): Promise < void >
    fetchBitcoinPayoutAddress(cudosAddress: string): Promise < string >;
    fetchBitcoinPayoutAddresses(cudosAddresses: string[]): Promise < string[] >;
}
