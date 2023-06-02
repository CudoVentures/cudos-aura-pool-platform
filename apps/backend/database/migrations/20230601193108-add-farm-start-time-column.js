/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('farms', 'farm_start_time', {
            type: Sequelize.DATE,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('farms', 'farm_start_time');
    },
};
