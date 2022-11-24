/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        queryInterface.addColumn('users', 'email_verified', Sequelize.BOOLEAN);
    },

    async down(queryInterface, Sequelize) {
        queryInterface.removeColumn('users', 'email_verified');
    },
};
