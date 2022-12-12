/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async (tx) => {
            await queryInterface.renameColumn('farms', 'createdAt', 'created_at', {
                tx,
            });
            await queryInterface.renameColumn('farms', 'updatedAt', 'updated_at', {
                tx,
            });
        });
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async (tx) => {
            await queryInterface.renameColumn('farms', 'created_at', 'createdAt', {
                tx,
            });
            await queryInterface.renameColumn('farms', 'updated_at', 'updatedAt', {
                tx,
            });
        });
    },
};
