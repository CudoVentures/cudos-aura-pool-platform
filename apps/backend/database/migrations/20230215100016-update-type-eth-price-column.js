/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async (tx) => {
            await queryInterface.changeColumn('nfts', 'price_in_eth', {
                type: 'NUMERIC USING CAST("price_in_eth" as NUMERIC)',
                defaultValue: 0,
            }, { tx });
        });
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async (tx) => {
            await queryInterface.changeColumn('nfts', 'price_in_eth', {
                type: Sequelize.STRING,
                defaultValue: '0',
            }, { tx });
        });
    },
};
