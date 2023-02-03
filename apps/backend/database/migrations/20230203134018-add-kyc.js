/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async (tx) => {
            await queryInterface.createTable('kyc', {
                kyc_id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER,
                },
                account_id: {
                    allowNull: false,
                    type: Sequelize.INTEGER,
                    references: {
                        model: {
                            tableName: 'accounts',
                            schema: 'public',
                        },
                        key: 'account_id',
                    },
                },
                first_name: {
                    allowNull: false,
                    type: Sequelize.STRING,
                },
                last_name: {
                    allowNull: false,
                    type: Sequelize.STRING,
                },
                applicant_id: {
                    allowNull: false,
                    type: Sequelize.STRING,
                },
                reports: {
                    allowNull: false,
                    type: Sequelize.ARRAY(Sequelize.STRING),
                },
                check_ids: {
                    allowNull: false,
                    type: Sequelize.ARRAY(Sequelize.STRING),
                },
                check_results: {
                    allowNull: false,
                    type: Sequelize.ARRAY(Sequelize.STRING),
                },
                created_at: {
                    allowNull: false,
                    type: Sequelize.DATE,
                },
                updated_at: {
                    allowNull: false,
                    type: Sequelize.DATE,
                },
            }, { tx });
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('kyc');
    },
};
