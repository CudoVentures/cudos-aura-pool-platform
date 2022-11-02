const LOCAL_STORAGE_KEY = 'cudos_aura_service_storage';
const VERSION = 16;

const collectionDescription = 'DigiDaigaku is a collection of 2022 unique characters developed by Limit Break, a company founded by world famous game designers Gabriel Leydon and Halbert Nakagawa.  Currently, DigiDaigaku characters live in a mysterious world unknown to outsiders, but in time, exciting details about their world will be revealed. /n Learn more about the project at: https://digidaigaku.com and https://twitter.com/DigiDaigaku'
const collectionProfileImgUrl = 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200';
const collectionCoverPictureUrl = 'https://static.dw.com/image/62450424_303.jpeg';
const collectionOwnerAddress = 'cudos14h7pdf8g2kkjgum5dntz80s5lhtrw3lk2uswk0';

const miningFarmsJson = [
    // jsonMiningFarm('1', '1', 'Cool Farm', 'Cool Farm Inc.', 'Doycho Traykov', 'doycho@somemail.com', collectionDescription, ['0'], ['1'], ['1'], 1234, collectionOwnerAddress, 10, 'Uzundjovo, Bulgaria', 2, 10, collectionProfileImgUrl, collectionCoverPictureUrl, 1),
    // jsonMiningFarm('2', '2', 'Not so Cool Farm', 'Not so Cool Farm Inc.', 'Doycho Traykov', 'doycho@somemail.com', collectionDescription, ['0'], ['1'], ['1'], 3000, collectionOwnerAddress, 15, 'Las Brisas, United States', 1, 10, collectionProfileImgUrl, collectionCoverPictureUrl, 1),
    // jsonMiningFarm('3', '3', 'Razorlabs Farm', 'Razorlabs Farm Inc', 'Doycho Traykov', 'doycho@somemail.com', collectionDescription, ['0'], ['1'], ['1'], 344, collectionOwnerAddress, 30, 'Las Brisas, United States', 3, 10, collectionProfileImgUrl, collectionCoverPictureUrl, 1),
    // jsonMiningFarm('4', '4', 'Limechain Farm', 'Limechain Farm Inc', 'Doycho Traykov', 'doycho@somemail.com', collectionDescription, ['0'], ['1'], ['1'], 5674, collectionOwnerAddress, 8, 'Las Brisas, United States', 10, 10, collectionProfileImgUrl, collectionCoverPictureUrl, 2),
    // jsonMiningFarm('5', '5', 'Cudos Farm', 'Cudos Farm Inc', 'Doycho Traykov', 'doycho@somemail.com', collectionDescription, ['0'], ['1'], ['1'], 2000, collectionOwnerAddress, 100, 'Las Brisas, United States', 6, 10, collectionProfileImgUrl, collectionCoverPictureUrl, 2),
];

const accountsJson = [
    // jsonAccount('1', 1, 1, 1, 'Account 1', 'user@email.com', 123123123123, 123123123123),
    // jsonAccount('2', 2, 1, 1, 'Account 2', 'admin@email.com', 123123123123, 123123123123),
    jsonAccount('3', 3, 1, 1, 'Account 3', 'superadmin@email.com', 123123123123, 123123123123),
];

const adminsJson = [
    // jsonAdmin('1', '2'),
];

const superAdminsJson = [
    jsonSuperAdmin('1', '3'),
];

const usersJson = [
    // jsonUser('1', '1', collectionOwnerAddress, '0.232', 100.563, 123123123123123, collectionProfileImgUrl, collectionCoverPictureUrl),
];

const bitcoinDataJson = jsonBitcoinData(23336, 53.3, 6.25, '29794407589312');
const cudosDataJson = jsonCudosData(0.07);

const nftsJson = [
    // jsonNft('1', 'Very Cool Name', '3D', '1', 4000, 12000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 0, 2002312312222, collectionOwnerAddress, 'cudos14h7pdf8g2kkjgum5dntz80s5lhtrw3lk2uswk0'),
    // jsonNft('2', 'Ethereum Meme', 'Anime', '1', 4030, 15000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('3', 'Cudos NFT Name', 'Art', '1', 4200, 2000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('4', 'Razorlabs Name', 'Anime', '1', 4600, 12000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('5', 'Very Cool Name', 'Art', '1', 7000, 20020, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('6', 'Ethereum Meme', 'Anime', '1', 1040, 13000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('7', 'Very Cool Name', '3D', '1', 34000, 15000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('8', 'Very Cool Name', 'Art', '1', 43000, 14050, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('9', 'Very Cool Name', 'Anime', '1', 24000, 17000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('10', 'Very Cool Name', 'Anime', '1', 41000, 12000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('11', 'Very Cool Name', 'Art', '1', 40200, 12000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('12', 'Ethereum Meme', 'Anime', '1', 4000, 12000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('13', 'Very Cool Name', 'Anime', '2', 4000, 12000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('14', 'Very Cool Name', 'Art', '2', 4000, 12020, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('15', 'Very Cool Name', 'Anime', '2', 3200, 12000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('16', 'Very Cool Name', '3D', '2', 2020, 120000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('17', 'Very Cool Name', 'Art', '2', 8020, 10000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('18', 'Very Cool Name', 'Anime', '3', 5050, 47000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('19', 'Very Cool Name', 'Art', '3', 7000, 112000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('20', 'Very Cool Name', 'Art', '3', 4530, 23000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('21', 'Very Cool Name', 'Anime', '3', 5000, 17000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('22', 'Very Cool Name', '3D', '3', 600, 13000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('23', 'Very Cool Name', '3D', '3', 4000, 12000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('24', 'Ethereum Meme', 'Anime', '4', 4030, 15000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('25', 'Cudos NFT Name', 'Art', '5', 4200, 2000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('26', 'Razorlabs Name', 'Anime', '5', 4600, 12000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('27', 'Very Cool Name', 'Art', '5', 7000, 20020, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('28', 'Ethereum Meme', 'Anime', '5', 1040, 13000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('29', 'Very Cool Name', '3D', '5', 34000, 15000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('30', 'Very Cool Name', 'Art', '5', 43000, 14050, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('31', 'Very Cool Name', 'Anime', '5', 24000, 17000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('32', 'Very Cool Name', 'Anime', '5', 41000, 12000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('33', 'Very Cool Name', 'Art', '6', 40200, 12000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('34', 'Ethereum Meme', 'Anime', '6', 4000, 12000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('35', 'Very Cool Name', 'Anime', '6', 4000, 12000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('36', 'Very Cool Name', 'Art', '6', 4000, 12020, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('37', 'Very Cool Name', 'Anime', '6', 3200, 12000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('38', 'Very Cool Name', '3D', '6', 2020, 120000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('39', 'Very Cool Name', 'Art', '6', 8020, 10000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('40', 'Very Cool Name', 'Anime', '6', 5050, 47000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('41', 'Very Cool Name', 'Art', '7', 7000, 112000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('42', 'Very Cool Name', 'Art', '7', 4530, 23000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('43', 'Very Cool Name', 'Anime', '7', 5000, 17000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),
    // jsonNft('44', 'Very Cool Name', '3D', '7', 600, 13000, 'https://www.cnet.com/a/img/resize/c5b48e90abe8b7fe339fc0139f3834dbe434fee5/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=1200', 1, 2002312312222, collectionOwnerAddress, collectionOwnerAddress),

]

const collectionsJson = [
    // jsonCollection('1', '1', 'ANIME COLLECTION', collectionDescription, collectionOwnerAddress, 4000, 12000, 2000, 700, 234, collectionProfileImgUrl, collectionCoverPictureUrl, 'approved'),
    // jsonCollection('2', '1', 'OTHER COLLECTION', collectionDescription, collectionOwnerAddress, 4030, 15000, 2000, 700, 234, collectionProfileImgUrl, collectionCoverPictureUrl, 'queued'),
    // jsonCollection('3', '1', 'CUDOS COLLECTION', collectionDescription, collectionOwnerAddress, 4200, 2000, 2000, 700, 234, collectionProfileImgUrl, collectionCoverPictureUrl, 'queued'),
    // jsonCollection('4', '1', 'LIMECHAIN COLLECTION', collectionDescription, collectionOwnerAddress, 4600, 12000, 2000, 700, 234, collectionProfileImgUrl, collectionCoverPictureUrl, 'queued'),
    // jsonCollection('5', '1', 'RAZORLABS COLLECTION', collectionDescription, collectionOwnerAddress, 7000, 20020, 2000, 700, 234, collectionProfileImgUrl, collectionCoverPictureUrl, 'queued'),
    // jsonCollection('6', '1', 'VALIO COLLECTION', collectionDescription, collectionOwnerAddress, 1040, 13000, 2000, 700, 234, collectionProfileImgUrl, collectionCoverPictureUrl, 'queued'),
    // jsonCollection('7', '1', 'KAMEN COLLECTION', collectionDescription, collectionOwnerAddress, 34000, 15000, 2000, 700, 234, collectionProfileImgUrl, collectionCoverPictureUrl, 'queued'),
    // jsonCollection('8', '1', 'TOSHO COLLECTION', collectionDescription, collectionOwnerAddress, 43000, 14050, 2000, 700, 234, collectionProfileImgUrl, collectionCoverPictureUrl, 'queued'),
    // jsonCollection('9', '1', 'GINKA COLLECTION', collectionDescription, collectionOwnerAddress, 24000, 17000, 2000, 700, 234, collectionProfileImgUrl, collectionCoverPictureUrl, 'issued'),
    // jsonCollection('10', '1', 'ANIME COLLECTION', collectionDescription, collectionOwnerAddress, 41000, 12000, 2000, 700, 234, collectionProfileImgUrl, collectionCoverPictureUrl, 'issued'),
    // jsonCollection('11', '1', 'ANIME COLLECTION', collectionDescription, collectionOwnerAddress, 40200, 12000, 2000, 700, 234, collectionProfileImgUrl, collectionCoverPictureUrl, 'issued'),
    // jsonCollection('12', '1', 'ANIME COLLECTION', collectionDescription, collectionOwnerAddress, 4000, 12000, 2000, 700, 234, collectionProfileImgUrl, collectionCoverPictureUrl, 'issued'),
    // jsonCollection('13', '1', 'ANIME COLLECTION', collectionDescription, collectionOwnerAddress, 4000, 12000, 2000, 700, 234, collectionProfileImgUrl, collectionCoverPictureUrl, 'approved'),
    // jsonCollection('14', '1', 'ANIME COLLECTION', collectionDescription, collectionOwnerAddress, 4000, 12020, 2000, 700, 234, collectionProfileImgUrl, collectionCoverPictureUrl, 'approved'),
    // jsonCollection('15', '1', 'ANIME COLLECTION', collectionDescription, collectionOwnerAddress, 3200, 12000, 2000, 700, 234, collectionProfileImgUrl, collectionCoverPictureUrl, 'approved'),
    // jsonCollection('16', '1', 'ANIME COLLECTION', collectionDescription, collectionOwnerAddress, 2020, 120000, 2000, 700, 234, collectionProfileImgUrl, collectionCoverPictureUrl, 'approved'),
    // jsonCollection('17', '1', 'ANIME COLLECTION', collectionDescription, collectionOwnerAddress, 8020, 10000, 2000, 700, 234, collectionProfileImgUrl, collectionCoverPictureUrl, 'approved'),
    // jsonCollection('18', '1', 'ANIME COLLECTION', collectionDescription, collectionOwnerAddress, 5050, 47000, 2000, 700, 234, collectionProfileImgUrl, collectionCoverPictureUrl, 'approved'),
    // jsonCollection('19', '1', 'ANIME COLLECTION', collectionDescription, collectionOwnerAddress, 7000, 112000, 2000, 700, 234, collectionProfileImgUrl, collectionCoverPictureUrl, 'approved'),
    // jsonCollection('20', '1', 'ANIME COLLECTION', collectionDescription, collectionOwnerAddress, 4530, 23000, 2000, 700, 234, collectionProfileImgUrl, collectionCoverPictureUrl, 'approved'),
    // jsonCollection('21', '1', 'ANIME COLLECTION', collectionDescription, collectionOwnerAddress, 5000, 17000, 2000, 700, 234, collectionProfileImgUrl, collectionCoverPictureUrl, 'approved'),
    // jsonCollection('22', '1', 'ANIME COLLECTION', collectionDescription, collectionOwnerAddress, 600, 13000, 2000, 700, 234, collectionProfileImgUrl, collectionCoverPictureUrl, 'approved'),
]

const categoriesJson = [
    // jsonCategory('1', 'All'),
    // jsonCategory('2', 'Anime'),
    // jsonCategory('3', 'Games'),
    // jsonCategory('4', 'Classic'),
    // jsonCategory('5', 'Hollywood'),
    // jsonCategory('6', 'Punk'),
    // jsonCategory('7', 'Pop'),
    // jsonCategory('8', 'Art'),
    // jsonCategory('9', '3D'),
]

export default class StorageHelper {

    static singleton = null;

    version: number;
    miningFarmsJson: any[];
    bitcoinDataJson: any;
    cudosDataJson: any;
    nftsJson: any[];
    collectionsJson: any[];
    categoriesJson: any[];
    usersJson: any[];
    accountsJson: any[];
    adminsJson: any[];
    superAdminsJson: any[];

    sessionAccount: any;
    sessionUser: any;
    sessionAdmin: any;
    sessionSuperAdmin: any;

    constructor() {
        this.version = VERSION;
        this.miningFarmsJson = miningFarmsJson;
        this.bitcoinDataJson = bitcoinDataJson;
        this.cudosDataJson = cudosDataJson;
        this.nftsJson = nftsJson;
        this.collectionsJson = collectionsJson;
        this.categoriesJson = categoriesJson;
        this.usersJson = usersJson;
        this.accountsJson = accountsJson;
        this.adminsJson = adminsJson;
        this.superAdminsJson = superAdminsJson;

        this.sessionAccount = null;
        this.sessionUser = null;
        this.sessionAdmin = null;
        this.sessionSuperAdmin = null;
    }

    static getSingletonInstance() {
        if (StorageHelper.singleton === null) {
            StorageHelper.singleton = new StorageHelper();
            StorageHelper.singleton.open();
        }

        return StorageHelper.singleton;
    }
    jsonSuperAdmin
    cloneWeak() {
        return Object.assign(new StorageHelper(), this);
    }

    open() {
        const json = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (json !== null) {
            const storage = JSON.parse(json);
            if (storage.version === VERSION) {
                Object.assign(this, storage);
            } else {
                this.save();
            }
        }
        return this;
    }

    save() {
        const json = this.cloneWeak();
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(json));
    }
}

function jsonMiningFarm(id, accountId, name, legalName, primaryAccountOwnerName, primaryAccountOwnerEmail, description, manufacturerIds, minerIds, energySourceIds, hashRateTh, ownerAddress, powerCost, machinesLocation, poolFee, powerConsumptionPerTh, profileImgUrl, coverImgUrl, status) {
    return {
        id,
        accountId,
        name,
        legalName,
        primaryAccountOwnerName,
        primaryAccountOwnerEmail,
        description,
        manufacturerIds,
        minerIds,
        energySourceIds,
        hashRateTh,
        ownerAddress,
        powerCost,
        machinesLocation,
        poolFee,
        powerConsumptionPerTh,
        profileImgUrl,
        coverImgUrl,
        status,
    };
}

function jsonAccount(accountId, type, active, emailVerified, name, email, timestampLastLogin, timestampRegister) {
    return {
        accountId,
        type,
        active,
        emailVerified,
        name,
        email,
        timestampLastLogin,
        timestampRegister,
    }
}

function jsonUser(userId, accountId, cudosWalletAddress, totalBtcEarned, totalHashPower, profileImgUrl, coverImgUrl) {
    return {
        userId,
        accountId,
        cudosWalletAddress,
        totalBtcEarned,
        totalHashPower,
        profileImgUrl,
        coverImgUrl,
    };
}

function jsonAdmin(adminId, accountId, cudosWalletAddress, bitcoindWalletAddress) {
    return {
        adminId,
        accountId,
        cudosWalletAddress,
        bitcoindWalletAddress,
    }
}

function jsonSuperAdmin(superAdminId, accountId) {
    return {
        superAdminId,
        accountId,
    }
}

function jsonBitcoinData(price, priceChange, blockReward, networkDifficulty) {
    return {
        price, priceChange, blockReward, networkDifficulty,
    }
}

function jsonCudosData(price) {
    return {
        price,
    }
}

function jsonNft(id, name, category, collectionId, hashPower, price, imageUrl, status, expiryDate, creatorAddress, currentOwnerAddress) {
    return {
        id, collectionId, name, category, hashPower, price, imageUrl, status, expiryDate, creatorAddress, currentOwnerAddress,
    }
}

function jsonCollection(id, farmId, name, description, ownerAddress, hashPower, price, volume, items, owners, profileImgUrl, coverImgUrl, status) {
    return {
        id, farmId, name, description, ownerAddress, hashPower, price, volume, items, owners, profileImgUrl, coverImgUrl, status,
    }
}

function jsonCategory(categoryId, categoryName) {
    return {
        categoryId, categoryName,
    };
}
