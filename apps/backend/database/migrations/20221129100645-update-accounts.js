/** @type {import('sequelize-cli').Migration} */
module.exports = {

    async up(queryInterface, Sequelize) {
        await queryInterface.removeColumn('accounts_admins', 'bitcoin_wallet_address');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addColumn('accounts_admins', 'bitcoin_wallet_address', {
            allowNull: false,
            type: Sequelize.STRING,
            defaultValue: '',
        });
    },

};
