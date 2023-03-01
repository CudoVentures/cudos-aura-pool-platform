/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async (tx) => {
            await queryInterface.addColumn('utxo_transactions', 'farm_id', {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: '0',
            }, { tx })
            await queryInterface.addColumn('utxo_transactions', 'payment_timestamp', {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: '0',
            }, { tx })
        });
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async (tx) => {

            await queryInterface.removeColumn('utxo_transactions', 'farm_id', { tx });
            await queryInterface.removeColumn('utxo_transactions', 'payment_timestamp', { tx });
        });
    },
};
