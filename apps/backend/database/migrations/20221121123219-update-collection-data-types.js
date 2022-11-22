/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('collections', 'main_image', {
            type: Sequelize.TEXT,
            allowNull: true,
        });
        await queryInterface.changeColumn('collections', 'banner_image', {
            type: Sequelize.TEXT,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('collections', 'main_image', {
            type: Sequelize.BLOB,
            allowNull: true,
        });
        await queryInterface.changeColumn('collections', 'banner_image', {
            type: Sequelize.BLOB,
            allowNull: true,
        });
    },
};
