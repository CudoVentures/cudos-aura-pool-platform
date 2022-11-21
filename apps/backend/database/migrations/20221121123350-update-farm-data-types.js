/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('farms', 'images', {
            type: Sequelize.ARRAY(Sequelize.TEXT),
            allowNull: true,
        });
        await queryInterface.changeColumn('farms', 'profile_img', {
            type: Sequelize.TEXT,
            allowNull: true,
        });
        await queryInterface.changeColumn('farms', 'cover_img', {
            type: Sequelize.TEXT,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('farms', 'images', {
            type: Sequelize.ARRAY(Sequelize.BLOB),
            allowNull: true,
        });
        await queryInterface.changeColumn('farms', 'profile_img', {
            type: Sequelize.BLOB,
            allowNull: true,
        });
        await queryInterface.changeColumn('farms', 'cover_img', {
            type: Sequelize.BLOB,
            allowNull: true,
        });
    },
};
