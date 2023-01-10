/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('farms', 'resale_farm_royalties_cudos_address', Sequelize.STRING);
        await queryInterface.addColumn('farms', 'cudos_mint_nft_royalties_percent', Sequelize.DECIMAL);
        await queryInterface.addColumn('farms', 'cudos_resale_nft_royalties_percent', Sequelize.DECIMAL);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('farms', 'resale_farm_royalties_cudos_address');
        await queryInterface.removeColumn('farms', 'cudos_mint_nft_royalties_percent');
        await queryInterface.removeColumn('farms', 'cudos_resale_nft_royalties_percent');
    },
};
