/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn(
            'nfts',
            'marketplace_nft_id',
            {
                allowNull: false,
                type: Sequelize.INTEGER,
                default: -1,
            },
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('nfts', 'marketplace_nft_id');
    },
};
