/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn(
            'nfts',
            'marketplace_nft_id',
            {
                type: Sequelize.INTEGER,
            },
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('nfts', 'marketplace_nft_id');
    },
};
