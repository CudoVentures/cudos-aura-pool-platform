/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('farms', 'farm_start_time', {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.fn('now'),
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('farms', 'farm_start_time');
    },
};
