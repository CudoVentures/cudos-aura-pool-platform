/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        queryInterface.renameColumn('threshold_amounts', 'amount', 'amount_btc')
    },

    async down(queryInterface, Sequelize) {
        queryInterface.renameColumn('threshold_amounts', 'amount_btc', 'amount')
    },
};
