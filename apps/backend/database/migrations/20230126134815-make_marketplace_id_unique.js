/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.changeColumn(
                'nfts',
                'marketplace_nft_id',
                {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                },
            )

            await queryInterface.sequelize.query('UPDATE nfts SET marketplace_nft_id = null WHERE marketplace_nft_id = -2147483648');

            await queryInterface.changeColumn(
                'nfts',
                'marketplace_nft_id',
                {
                    type: Sequelize.INTEGER,
                    unique: true,
                    allowNull: true,
                },
            )
            return transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.changeColumn(
                'nfts',
                'marketplace_nft_id',
                {
                    type: Sequelize.INTEGER,
                },
            )
            return transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },
};
