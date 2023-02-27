import NftEntity, { NftGroup } from '../../../nft/entities/NftEntity';

export default {
    name: 'Presale Collection 2',
    description: 'Borem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit sed risus. Maecenas eget condimentum velit, sit amet. More',
    royalties: 3,
    totalNfts: 10000,
    expectedTotalHashPower: 109550, // TBD
    nfts: {
        opal: {
            totalCount: 1930,
            giveawayCount: 50,
            privateSaleCount: 564,
            presaleCount: 1128,
            publicSaleCount: 188,
            name: 'Opal',
            hashPowerInTh: 5,
            expirationDateTimestamp: 1798754400000,
            priceUsd: 150,
        },
        ruby: {
            totalCount: 7500,
            giveawayCount: 100,
            privateSaleCount: 2220,
            presaleCount: 4440,
            publicSaleCount: 740,
            name: 'Ruby',
            hashPowerInTh: 10,
            expirationDateTimestamp: 1798754400000,
            priceUsd: 300,
        },
        emerald: {
            totalCount: 500,
            giveawayCount: 10,
            privateSaleCount: 147,
            presaleCount: 294,
            publicSaleCount: 49,
            name: 'Emerald',
            hashPowerInTh: 33,
            expirationDateTimestamp: 1798754400000,
            priceUsd: 1000,
        },
        diamond: {
            totalCount: 50,
            giveawayCount: 5,
            privateSaleCount: 14,
            presaleCount: 27,
            publicSaleCount: 4,
            name: 'Diamond',
            hashPowerInTh: 100,
            expirationDateTimestamp: 1798754400000,
            priceUsd: 3000,
        },
        blueDiamond: {
            totalCount: 20,
            giveawayCount: 2,
            privateSaleCount: 6,
            presaleCount: 10,
            publicSaleCount: 2,
            name: 'Blue Diamond',
            hashPowerInTh: 170,
            expirationDateTimestamp: 1798754400000,
            priceUsd: 5000,
        },
    },
}

export function createNft(index, presaleImage, nftData, group: NftGroup): NftEntity {
    const nftEntity = new NftEntity();

    nftEntity.name = `${nftData.name} ${index}`;
    nftEntity.hashPowerInTh = nftData.hashPowerInTh;
    nftEntity.imageUrl = presaleImage;
    nftEntity.expirationDateTimestamp = nftData.expirationDateTimestamp;
    nftEntity.priceUsd = nftData.priceUsd;
    nftEntity.group = group;

    return nftEntity
}
