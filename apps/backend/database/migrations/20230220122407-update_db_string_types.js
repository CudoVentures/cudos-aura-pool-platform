/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async (tx) => {
            await queryInterface.changeColumn('collections', 'main_image', {
                type: Sequelize.STRING,
            }, { tx });
            await queryInterface.changeColumn('collections', 'banner_image', {
                type: Sequelize.STRING,
            }, { tx });
            await queryInterface.changeColumn('farms', 'profile_img', {
                type: Sequelize.STRING,
            }, { tx });
            await queryInterface.changeColumn('farms', 'cover_img', {
                type: Sequelize.STRING,
            }, { tx });
            await queryInterface.changeColumn('farms', 'images', {
                type: Sequelize.ARRAY(Sequelize.STRING),
            }, { tx });
            await queryInterface.changeColumn('farms', 'description', {
                type: Sequelize.TEXT,
            }, { tx });
        });
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async (tx) => {
            await queryInterface.changeColumn('collections', 'main_image', {
                type: Sequelize.TEXT,
            }, { tx });
            await queryInterface.changeColumn('collections', 'banner_image', {
                type: Sequelize.TEXT,
            }, { tx });
            await queryInterface.changeColumn('farms', 'profile_img', {
                type: Sequelize.TEXT,
            }, { tx });
            await queryInterface.changeColumn('farms', 'cover_img', {
                type: Sequelize.TEXT,
            }, { tx });
            await queryInterface.changeColumn('farms', 'images', {
                type: Sequelize.ARRAY(Sequelize.TEXT),
            }, { tx });
            await queryInterface.changeColumn('farms', 'description', {
                type: Sequelize.STRING,
            }, { tx });
        });
    },
};
