/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.removeColumn('account_users', 'bitcoin_payout_wallet_address');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addColumn('account_users', 'bitcoin_payout_wallet_address', {
            allowNull: false,
            type: Sequelize.STRING,
            defaultValue: '',
        });
    },
};
