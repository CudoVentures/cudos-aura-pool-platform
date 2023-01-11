/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        queryInterface.addColumn('statistics_nft_payout_history', 'cudo_part_of_reward', Sequelize.DECIMAL);
    },

    async down(queryInterface, Sequelize) {
        queryInterface.removeColumn('statistics_nft_payout_history', 'cudo_part_of_reward');
    },
};
