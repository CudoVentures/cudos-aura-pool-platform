/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn(
            'nfts',
            'price_in_eth',
            {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: '0',
            },
        )
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn(
            'nfts',
            'price_in_eth',
        )
    },
};
