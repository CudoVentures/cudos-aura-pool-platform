/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.renameColumn('nfts', 'data', 'group')
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.renameColumn('nfts', 'group', 'data')
    },
};
