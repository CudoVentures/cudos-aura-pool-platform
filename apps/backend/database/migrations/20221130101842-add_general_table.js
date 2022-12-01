/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.createTable(
                'general',
                {
                    id: {
                        allowNull: false,
                        autoIncrement: true,
                        primaryKey: true,
                        type: Sequelize.INTEGER,
                    },
                    last_checked_block: {
                        allowNull: false,
                        type: Sequelize.INTEGER,
                    },
                    updated_at: {
                        allowNull: false,
                        type: Sequelize.DATE,
                    },
                    created_at: {
                        allowNull: false,
                        type: Sequelize.DATE,
                    },
                },
                { transaction },
            );

            const initRow = [{
                last_checked_block: 0,
                updated_at: new Date(),
                created_at: new Date(),
            }]

            await queryInterface.bulkInsert('general', initRow, { transaction })

            return transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('general');
    },
};
