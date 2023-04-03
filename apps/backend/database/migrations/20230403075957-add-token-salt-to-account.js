/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        queryInterface.addColumn('accounts', 'token_salt', {
            defaultValue: 'salt',
            type: Sequelize.STRING,
            allowNull: false,
        });

    },

    async down(queryInterface, Sequelize) {
        queryInterface.removeColumn('accounts', 'token_salt');
    },
};
