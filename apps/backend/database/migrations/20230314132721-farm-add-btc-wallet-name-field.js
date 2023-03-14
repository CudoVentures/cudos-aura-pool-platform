/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.addColumn(
                'farms',
                'rewards_from_pool_btc_wallet_name',
                {
                    type: Sequelize.STRING,
                    allowNull: false,
                    defaultValue: '',
                },
                { transaction },
            );

            await queryInterface.sequelize.query('UPDATE farms SET rewards_from_pool_btc_wallet_name = sub_account_name', { transaction });

            await queryInterface.renameColumn('statistics_tx_hash_status', 'farm_sub_account_name', 'farm_btc_wallet_name', { transaction });
            return transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.removeColumn('farms', 'rewards_from_pool_btc_wallet_name');
            await queryInterface.renameColumn('statistics_tx_hash_status', 'farm_btc_wallet_name', 'farm_sub_account_name', { transaction });
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },
};
