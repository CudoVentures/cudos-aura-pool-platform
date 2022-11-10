module.exports = {
    async up(queryInterface, Sequelize) {
        /**
       * Alter farms table - add columns images
       * Alter farms table - add columns main_image, banner_image
   */
        await queryInterface.addColumn('farms', 'images', {
            type: Sequelize.ARRAY(Sequelize.TEXT),
            allowNull: true,
        })

        await queryInterface.addColumn('collections', 'main_image', {
            type: Sequelize.TEXT,
            allowNull: true,
        })

        await queryInterface.addColumn('collections', 'banner_image', {
            type: Sequelize.TEXT,
            allowNull: true,
        })

        await queryInterface.changeColumn('nfts', 'uri', {
            type: Sequelize.TEXT,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        /**
   * Remove columns
   */
        await queryInterface.removeColumn('farms', 'images')
        await queryInterface.removeColumn('collections', 'main_image')
        await queryInterface.removeColumn('collections', 'banner_image')
        await queryInterface.changeColumn('nfts', 'uri', {
            type: Sequelize.STRING,
            allowNull: true,
            validate: {
                isUrl: true,
            },
        });
    },
};
