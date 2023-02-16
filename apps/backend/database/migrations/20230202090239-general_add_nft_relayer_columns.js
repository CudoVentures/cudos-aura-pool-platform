/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.addColumn('general', 'last_checked_payment_relayer_eth_block', {
                type: Sequelize.INTEGER,
                defaultValue: 1,
            }, { transaction })

            await queryInterface.addColumn('general', 'last_checked_payment_relayer_cudos_block', {
                type: Sequelize.INTEGER,
                defaultValue: 1,
            }, { transaction })

            return transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.removeColumn('general', 'last_checked_payment_relayer_eth_block', { transaction })
            await queryInterface.removeColumn('general', 'last_checked_payment_relayer_cudos_block', { transaction })
            return transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },
};
