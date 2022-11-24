module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('statistics_tx_hash_status', {
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
            status: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            time_sent: {
                type: Sequelize.BIGINT,
                allowNull: false,
            },
            farm_sub_account_name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            retry_count: {
                type: Sequelize.INTEGER,
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
        await queryInterface.dropTable('statistics_tx_hash_status');
    },
};
