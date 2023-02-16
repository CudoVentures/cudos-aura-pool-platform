import { SearchByTagsQuery } from '@cosmjs/stargate/build/search';
import Config from '../../../config/Config';

export const BankSendMsgToOnDemandMintingServiceQuery: SearchByTagsQuery = {
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
            value: Config.CUDOS_SIGNER_ADDRESS,
        },
    ],
}
