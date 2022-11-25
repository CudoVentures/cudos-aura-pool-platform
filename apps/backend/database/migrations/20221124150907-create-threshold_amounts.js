module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('threshold_amounts', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.BIGINT,
            },
            old_tx_hash: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            new_tx_hash: {
                type: Sequelize.STRING,
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
        await queryInterface.dropTable('threshold_amounts');
    },
};
