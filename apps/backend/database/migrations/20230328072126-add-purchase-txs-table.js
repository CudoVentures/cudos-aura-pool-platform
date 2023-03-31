/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('purchase_transactions', {
            tx_hash: {
                primaryKey: true,
                unique: true,
                allowNull: false,
                type: Sequelize.STRING,
            },
            recipient_address: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            timestamp: {
                type: Sequelize.BIGINT,
                allowNull: false,
            },
            status: {
                type: Sequelize.BIGINT,
                allowNull: false,
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('purchase_transactions');
    },
};
