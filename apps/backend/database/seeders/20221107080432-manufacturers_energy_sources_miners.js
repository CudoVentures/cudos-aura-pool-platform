const miners = [
    { name: 'Antminer S19' },
    { name: 'Antminer S19 Pro' },
    { name: 'Antminer S19J Pro' },
    { name: 'WhatsMiner M30S' },
    { name: 'WhatsMiner M30S+' },
    { name: 'WhatsMiner M31S' },
    { name: 'WhatsMiner M31s+' },
    { name: 'AvalonMiner A12' },
    { name: 'AvalonMiner A11' },
    { name: 'AvalonMiner A12S' },
]

const energySources = [
    { name: 'Natural Gas' },
    { name: 'Grid' },
    { name: 'Oil' },
    { name: 'Hydro' },
    { name: 'Solar' },
    { name: 'Coal' },
    { name: 'Wind' },
    { name: 'Geothermal' },
    { name: 'Nuclear' },
    { name: 'Bio-gas' },
    { name: 'Flare Gas' },
    { name: 'Methane' },
]

const manufacturers = [
    { name: 'Bitmain' },
    { name: 'MicroBT' },
    { name: 'Canaan' },
    { name: 'Bitfury' },
]

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('miners', miners);

        await queryInterface.bulkInsert('energy_sources', energySources);

        await queryInterface.bulkInsert('manufacturers', manufacturers);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('miners', null, {});
        await queryInterface.bulkDelete('energy_sources', null, {});
        await queryInterface.bulkDelete('manufacturers', null, {});
    },
};
