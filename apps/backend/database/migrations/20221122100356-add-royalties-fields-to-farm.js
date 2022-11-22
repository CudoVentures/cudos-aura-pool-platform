/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        queryInterface.addColumn('farms', 'resale_farm_royalties_cudos_address', Sequelize.STRING);
        queryInterface.addColumn('farms', 'cudos_mint_nft_royalties_percent', Sequelize.DECIMAL);
        queryInterface.addColumn('farms', 'cudos_resale_nft_royalties_percent', Sequelize.DECIMAL);
    },

    async down(queryInterface, Sequelize) {
        queryInterface.removeColumn('farms', 'resale_farm_royalties_cudos_address');
        queryInterface.removeColumn('farms', 'cudos_mint_nft_royalties_percent');
        queryInterface.removeColumn('farms', 'cudos_resale_nft_royalties_percent');
    },
};
