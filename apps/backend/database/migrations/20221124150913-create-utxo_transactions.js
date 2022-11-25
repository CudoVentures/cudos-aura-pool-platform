module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('utxo_transactions', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.BIGINT,
            },
            tx_hash: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            processed: {
                type: Sequelize.BOOLEAN,
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
        await queryInterface.dropTable('utxo_transactions');
    },
};
