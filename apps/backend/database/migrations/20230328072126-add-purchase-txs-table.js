/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('purchase_transactions', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.BIGINT,
            },
            txHash: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            recipientAddress: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            timestamp: {
                type: Sequelize.NUMBER,
                allowNull: false,
            },
            status: {
                type: Sequelize.NUMBER,
                allowNull: false,
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('purchase_transactions');
    },
};
