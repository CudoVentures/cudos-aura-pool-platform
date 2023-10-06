import Config from '../../../config/Config';

export type HeightFilter = {
    minHeight: number;
    maxHeight: number;
}

export async function getBankSendMsgToOnDemandMintingServiceQuery(): Promise < ReadonlyArray < { readonly key: string; readonly value: string; } > > {
    const cudosSignerAddress = await Config.getCudosSignerAddress();

    return [
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
    ];
}

// export function makeHeightSearchQuery(query: ReadonlyArray <{readonly key: string, readonly value: string}>, heightFilter: HeightFilter): string {
//     return `${query.map((t) => `${t.key}='${t.value}'`).join(' AND ')} AND tx.height >= ${heightFilter.minHeight} AND tx.height <= ${heightFilter.maxHeight}`;
// }
