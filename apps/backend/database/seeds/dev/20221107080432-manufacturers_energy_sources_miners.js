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

const accounts = [
    {
        account_id: 1,
        type: 3,
        active: 1,
        email_verified: 1,
        name: 'Super Admin',
        email: 'admin@aurapool.io',
        last_login_at: '2022-11-11T14:10:18.473Z',
        salt: '41vWHvhcqEeaY03TPVliL+EcpM4w+jbWd4OavgxmvBMQpXpch/CkYxUzaIJjm58rw0qKD42dFCn0RQdZcvJpyc/vObYOGaR5jXyQc4rfahWaKHM2BklsDUMxtMfWOwaToKed1jV4vQpbBFLnZ8bDC80m6iQlY+OaxDdwt2jp4ag=',
        // pass is 123123
        hashed_pass: '90b7ade57ab677c332c86772a3066b53a1bba43ffa04c334cd0ae0244dc838075d5379ccbd0e37584865023cf719002c0e491092599ebad8a5948a7c204b2c6c',
        created_at: '2022-11-11T14:10:18.473Z',
        updated_at: '2022-11-11T14:10:18.473Z',
    },
]

const superAdmins = [
    {
        cudos_royaltees_address: 'cudos154dfcmrrdmafmvftuvypsvgpl2qyvw7lh0x23t',
    },
]

const settings = [
    {
        first_sale_cudos_royalties_percent: 2.5,
        resale_cudos_royalties_percent: 2,
        global_cudos_fees_percent: 2,
        global_cudos_royalties_percent: 2,
        created_at: '2022-11-11T14:10:18.473Z',
        updated_at: '2022-11-11T14:10:18.473Z',
    },
]

module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.bulkInsert('miners', miners, { transaction });
            await queryInterface.bulkInsert('energy_sources', energySources, { transaction });
            await queryInterface.bulkInsert('manufacturers', manufacturers, { transaction });
            await queryInterface.bulkInsert('settings', settings, { transaction });

            await queryInterface.bulkInsert('accounts', accounts, { transaction });

            superAdmins[0].account_id = 1;

            await queryInterface.bulkInsert('accounts_super_admins', superAdmins, { transaction });
            return transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('miners', null, {});
        await queryInterface.bulkDelete('energy_sources', null, {});
        await queryInterface.bulkDelete('manufacturers', null, {});
        await queryInterface.bulkDelete('manufacturers', null, {});
        await queryInterface.bulkDelete('settings', null, {});
        await queryInterface.bulkDelete('accounts', { email: accounts[0].email }, { cascade: true });
        await queryInterface.bulkInsert('accounts_super_admins', null, {});
    },
};
