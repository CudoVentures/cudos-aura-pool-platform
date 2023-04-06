import NftEntity, { NftGroup, NftTier, tierPriceMap } from '../../../nft/entities/NftEntity';

export default {
    name: 'Bradd 02',
    description: 'The first collection from the renowed Bradd Styx and also the first collection for this platform. And some fantastic artwork attached. A bargain.',
    royalties: 3,
    totalNfts: 3333,
    expectedTotalHashPower: 36446, // TBD
    nfts: {
        opal: {
            totalCount: 643,
            giveawayCount: 16,
            privateSaleCount: 188,
            presaleCount: 376,
            publicSaleCount: 63,
            name: 'Opal',
            hashPowerInTh: 5,
            expirationDateTimestamp: 1811804400000,
            priceUsd: tierPriceMap.get(NftTier.TIER_1),
            artistName: 'Delux3',
        },
        ruby: {
            totalCount: 2500,
            giveawayCount: 33,
            privateSaleCount: 740,
            presaleCount: 1480,
            publicSaleCount: 247,
            name: 'Ruby',
            hashPowerInTh: 10,
            expirationDateTimestamp: 1811804400000,
            priceUsd: tierPriceMap.get(NftTier.TIER_2),
            artistName: 'Delux3',
        },
        emerald: {
            totalCount: 167,
            giveawayCount: 3,
            privateSaleCount: 50,
            presaleCount: 98,
            publicSaleCount: 16,
            name: 'Emerald',
            hashPowerInTh: 33,
            expirationDateTimestamp: 1811804400000,
            priceUsd: tierPriceMap.get(NftTier.TIER_3),
            artistName: 'Delux3',
        },
        diamond: {
            totalCount: 17,
            giveawayCount: 2,
            privateSaleCount: 5,
            presaleCount: 9,
            publicSaleCount: 1,
            name: 'Diamond',
            hashPowerInTh: 100,
            expirationDateTimestamp: 1811804400000,
            priceUsd: tierPriceMap.get(NftTier.TIER_4),
            artistName: 'Delux3',
        },
        blueDiamond: {
            totalCount: 6,
            giveawayCount: 0,
            privateSaleCount: 2,
            presaleCount: 3,
            publicSaleCount: 1,
            name: 'Blue Diamond',
            hashPowerInTh: 170,
            expirationDateTimestamp: 1811804400000,
            priceUsd: tierPriceMap.get(NftTier.TIER_5),
            artistName: 'Delux3',
        },
    },
}

export function createNft(index, presaleImage, nftData, group: NftGroup): NftEntity {
    const nftEntity = new NftEntity();

    nftEntity.name = `${nftData.name} ${index.formatSpace(4)}`;
    nftEntity.hashPowerInTh = nftData.hashPowerInTh;
    nftEntity.imageUrl = presaleImage;
    nftEntity.expirationDateTimestamp = nftData.expirationDateTimestamp;
    nftEntity.priceUsd = nftData.priceUsd;
    nftEntity.group = group;
    nftEntity.artistName = nftData.artistName;

    return nftEntity
}
