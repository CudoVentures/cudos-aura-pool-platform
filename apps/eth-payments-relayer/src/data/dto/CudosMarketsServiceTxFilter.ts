import { SearchByTagsQuery } from '@cosmjs/stargate/build/search';
import Config from '../../../config/Config';

export async function getBankSendMsgToOnDemandMintingServiceQuery(): Promise < SearchByTagsQuery > {
    const cudosSignerAddress = await Config.getCudosSignerAddress();

    return {
        tags: [
            {
                key: 'message.action',
                value: '/cosmos.bank.v1beta1.MsgSend',
            },
            {
                key: 'message.sender',
                value: Config.MINTING_SERVICE_ADDRESS,
            },
            {
                key: 'transfer.sender',
                value: Config.MINTING_SERVICE_ADDRESS,
            },
            {
                key: 'transfer.recipient',
                value: cudosSignerAddress,
            },
        ],
    };
}
