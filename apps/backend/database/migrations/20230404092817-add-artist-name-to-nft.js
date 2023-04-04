/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        queryInterface.addColumn('nfts', 'artist_name', {
            defaultValue: '',
            type: Sequelize.STRING,
            allowNull: false,
        });

    },

    async down(queryInterface, Sequelize) {
        queryInterface.removeColumn('nfts', 'artist_name');
    },
};
