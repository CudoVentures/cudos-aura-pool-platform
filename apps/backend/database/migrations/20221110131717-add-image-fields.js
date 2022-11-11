module.exports = {
    async up(queryInterface, Sequelize) {
        /**
       * Alter farms table - add columns images
       * Alter farms table - add columns main_image, banner_image
   */
        await queryInterface.addColumn('farms', 'images', {
            type: Sequelize.ARRAY(Sequelize.BLOB),
            allowNull: true,
        })

        await queryInterface.addColumn('collections', 'main_image', {
            type: Sequelize.BLOB,
            allowNull: true,
        })

        await queryInterface.addColumn('collections', 'banner_image', {
            type: Sequelize.BLOB,
            allowNull: true,
        })

        await queryInterface.removeColumn('nfts', 'uri');
        await queryInterface.addColumn('nfts', 'uri', {
            type: Sequelize.BLOB,
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
        await queryInterface.removeColumn('nfts', 'uri')
    },
};
