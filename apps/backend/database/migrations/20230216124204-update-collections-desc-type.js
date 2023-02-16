/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async (tx) => {
            await queryInterface.changeColumn('collections', 'description', {
                type: Sequelize.TEXT,
            }, { tx });
        });
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async (tx) => {
            await queryInterface.changeColumn('collections', 'description', {
                type: Sequelize.STRING,
            }, { tx });
        });
    },
};
