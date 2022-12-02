/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('nfts', 'current_owner', {
            allowNull: false,
            type: Sequelize.STRING,
            defaultValue: '',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('nfts', 'current_owner');

    },
};
