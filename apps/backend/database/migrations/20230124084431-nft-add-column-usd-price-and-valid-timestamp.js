/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.addColumn('nfts', 'price_usd', {
                type: Sequelize.DECIMAL,
                defaultValue: 0,
            }, { transaction });
            await queryInterface.addColumn('nfts', 'price_acudos_valid_until', {
                type: Sequelize.BIGINT,
                defaultValue: 0,
            }, { transaction });
            return transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.removeColumn('nfts', 'price_usd', { transaction });
            await queryInterface.removeColumn('nfts', 'price_acudos_valid_until', { transaction });
            return transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },
};
