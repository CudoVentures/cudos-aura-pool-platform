module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('rbf_transaction_history', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.BIGINT,
            },
            btc_address: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            farm_id: {
                type: Sequelize.BIGINT,
                allowNull: false,
            },
            amount: {
                type: Sequelize.DECIMAL,
                allowNull: false,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('rbf_transaction_history');
    },
};
