module.exports = {
    async up(queryInterface, Sequelize) {
    /**
     * Alter user table - add columns name and cudosAddress
     */
        await queryInterface.addColumn('users', 'name', {
            type: Sequelize.STRING,
            allowNull: true,
        })
    },

    async down(queryInterface, Sequelize) {
    /**
     * Remove columns
     */
        await queryInterface.removeColumn('users', 'name')
    },
};
