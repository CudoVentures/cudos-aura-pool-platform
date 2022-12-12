/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.renameColumn('nfts', 'createdAt', 'created_at');
        await queryInterface.renameColumn('nfts', 'updatedAt', 'updated_at');
        await queryInterface.renameColumn('collections', 'createdAt', 'created_at');
        await queryInterface.renameColumn('collections', 'updatedAt', 'updated_at');
    },

    async down(queryInterface, Sequelize) {

        await queryInterface.renameColumn('nfts', 'created_at', 'createdAt');
        await queryInterface.renameColumn('nfts', 'updated_at', 'updatedAt');
        await queryInterface.renameColumn('collections', 'created_at', 'createdAt');
        await queryInterface.renameColumn('collections', 'updated_at', 'updatedAt');
    },
};
