/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
        await queryInterface.addColumn('farms', 'primary_account_owner_name', {
            type: Sequelize.STRING,
            allowNull: true,
        })
        await queryInterface.addColumn('farms', 'primary_account_owner_email', {
            type: Sequelize.STRING,
            allowNull: true,
        })
    },

    async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
        await queryInterface.removeColumn('farms', 'primary_account_owner_name')
        await queryInterface.removeColumn('farms', 'primary_account_owner_email')

    },
};
