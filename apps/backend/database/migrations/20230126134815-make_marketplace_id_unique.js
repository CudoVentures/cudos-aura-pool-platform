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
                    unique: true,
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
