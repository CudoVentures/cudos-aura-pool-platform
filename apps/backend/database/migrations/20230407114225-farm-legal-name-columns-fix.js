/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.renameColumn('farms', 'sub_account_name', 'legal_name', { transaction });
            await queryInterface.addColumn('farms', 'sub_account_name', {
                defaultValue: '',
                type: Sequelize.STRING,
                allowNull: false,
            }, { transaction });
            await queryInterface.sequelize.query('UPDATE farms SET sub_account_name = legal_name', { transaction });
            return transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.removeColumn('farms', 'sub_account_name', { transaction });
            await queryInterface.renameColumn('farms', 'legal_name', 'sub_account_name', { transaction });

            return transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },
};
