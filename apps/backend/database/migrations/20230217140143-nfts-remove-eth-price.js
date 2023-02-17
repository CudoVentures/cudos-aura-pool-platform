/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async (tx) => {
            await queryInterface.removeColumn('nfts', 'price_in_eth', { tx })
        });
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async (tx) => {
            await queryInterface.addColumn('nfts', 'price_in_eth', {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: '0',
            }, { tx })
        });
    },
};
