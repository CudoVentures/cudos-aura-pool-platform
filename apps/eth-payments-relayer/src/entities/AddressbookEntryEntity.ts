import { QueryGetAddressResponse } from 'cudosjs/build/stargate/modules/addressbook/proto-types/query';

export const ADDRESSBOOK_LABEL = 'aurapool';
export const ADDRESSBOOK_NETWORK = 'aurapool';

export default class AddressbookEntryEntity {
    cudosAddress: string;
    entryAdress: string;
    network: string;
    label: string;

    constructor() {
        this.cudosAddress = '';
        this.entryAdress = '';
        this.network = '';
        this.label = '';
    }

    isValid(): boolean {
        return this.cudosAddress !== ''
            && this.entryAdress !== ''
            && this.label === ADDRESSBOOK_LABEL
            && this.network === ADDRESSBOOK_NETWORK;
    }

    static fromChainQuery(data: QueryGetAddressResponse): AddressbookEntryEntity {
        const entity = new AddressbookEntryEntity();

        entity.cudosAddress = data.address?.creator ?? entity.cudosAddress;
        entity.network = data.address?.network ?? entity.network;
        entity.entryAdress = data.address?.value ?? entity.entryAdress;
        entity.label = data.address?.label ?? entity.label;

        return entity;
    }
}
