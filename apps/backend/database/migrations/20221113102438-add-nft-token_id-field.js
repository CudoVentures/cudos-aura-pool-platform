module.exports = {
    async up(queryInterface, Sequelize) {
        /**
     * Alter nfts table - add column token_id
 */
        await queryInterface.addColumn('nfts', 'token_id', {
            type: Sequelize.STRING,
            allowNull: true,
        })
    },

    async down(queryInterface, Sequelize) {
        /**
 * Remove columns
 */
        await queryInterface.removeColumn('nfts', 'token_id')
    },
};
