/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        queryInterface.addColumn('accounts', 'consequitive_wrong_password_attemps', {
            defaultValue: 0,
            type: Sequelize.INTEGER,
            allowNull: false,
        });

    },

    async down(queryInterface, Sequelize) {
        queryInterface.removeColumn('accounts', 'consequitive_wrong_password_attemps');
    },
};
