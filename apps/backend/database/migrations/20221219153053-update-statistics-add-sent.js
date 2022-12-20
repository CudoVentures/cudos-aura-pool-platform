/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async (tx) => {
            await queryInterface.addColumn('statistics_nft_owners_payout_history', 'sent', {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            }, {
                tx,
            });
        });
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async (tx) => {
            await queryInterface.removeColumn('statistics_nft_owners_payout_history', 'sent', { tx })
        });
    },
};
