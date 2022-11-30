/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.renameTable('rbf_transaction_history', 'temp_name', { transaction });
            await queryInterface.renameTable('threshold_amounts', 'rbf_transaction_history', { transaction });
            await queryInterface.renameTable('temp_name', 'threshold_amounts', { transaction });

            return transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.renameTable('rbf_transaction_history', 'temp_name', { transaction });
            await queryInterface.renameTable('threshold_amounts', 'rbf_transaction_history', { transaction });
            await queryInterface.renameTable('temp_name', 'threshold_amounts', { transaction });

            return transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },
};
