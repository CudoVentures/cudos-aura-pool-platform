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

const users = [
    {
        id: 1,
        email: 'superadmin@gmail.com',
        salt: '41vWHvhcqEeaY03TPVliL+EcpM4w+jbWd4OavgxmvBMQpXpch/CkYxUzaIJjm58rw0qKD42dFCn0RQdZcvJpyc/vObYOGaR5jXyQc4rfahWaKHM2BklsDUMxtMfWOwaToKed1jV4vQpbBFLnZ8bDC80m6iQlY+OaxDdwt2jp4ag=',
        hashed_pass: '90b7ade57ab677c332c86772a3066b53a1bba43ffa04c334cd0ae0244dc838075d5379ccbd0e37584865023cf719002c0e491092599ebad8a5948a7c204b2c6c',
        role: 'super_admin',
        cudos_address: 'wef',
        payout_address: 'we',
        is_active: true,
        createdAt: '2022-11-11T14:10:18.473Z',
        updatedAt: '2022-11-11T14:10:18.473Z',
    },
]

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('miners', miners);
        await queryInterface.bulkInsert('energy_sources', energySources);
        await queryInterface.bulkInsert('manufacturers', manufacturers);
        await queryInterface.bulkInsert('users', users);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('miners', null, {});
        await queryInterface.bulkDelete('energy_sources', null, {});
        await queryInterface.bulkDelete('manufacturers', null, {});
        await queryInterface.bulkDelete('manufacturers', null, {});
    },
};
