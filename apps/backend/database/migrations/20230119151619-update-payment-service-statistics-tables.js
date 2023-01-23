/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.createTable('farm_payment_statistics', {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER,
                },
                farm_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: {
                            tableName: 'farms',
                            schema: 'public',
                        },
                        key: 'id',
                    },
                },
                amount_btc: {
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
            }, { transaction });

            await queryInterface.addIndex('farm_payment_statistics', ['id'], { transaction });
            await queryInterface.addIndex('farm_payment_statistics', ['farm_id'], { transaction });

            await queryInterface.createTable('collection_payment_allocations', {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER,
                },
                farm_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: {
                            tableName: 'farms',
                            schema: 'public',
                        },
                        key: 'id',
                    },
                },
                farm_payment_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: {
                            tableName: 'farm_payment_statistics',
                            schema: 'public',
                        },
                        key: 'id',
                    },
                },
                collection_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: {
                            tableName: 'collections',
                            schema: 'public',
                        },
                        key: 'id',
                    },
                },
                collection_allocation_amount_btc: {
                    type: Sequelize.DECIMAL,
                    allowNull: false,
                },
                cudo_general_fee_btc: {
                    type: Sequelize.DECIMAL,
                    allowNull: false,
                },
                cudo_maintenance_fee_btc: {
                    type: Sequelize.DECIMAL,
                    allowNull: false,
                },
                farm_unsold_leftover_btc: {
                    type: Sequelize.DECIMAL,
                    allowNull: false,
                },
                farm_maintenance_fee_btc: {
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
            }, { transaction });

            await queryInterface.addIndex('collection_payment_allocations', ['id'], { transaction });
            await queryInterface.addIndex('collection_payment_allocations', ['farm_id'], { transaction });
            await queryInterface.addIndex('collection_payment_allocations', ['farm_payment_id'], { transaction });
            await queryInterface.addIndex('collection_payment_allocations', ['collection_id'], { transaction });

            await queryInterface.addColumn('statistics_nft_payout_history', 'farm_payment_id', {
                type: Sequelize.INTEGER,
                defaultValue: 0,
                // references: {
                //     model: {
                //         tableName: 'farm_payment_statistics',
                //         schema: 'public',
                //     },
                //     key: 'id',
                // },
            }, { transaction });
            await queryInterface.addColumn('statistics_nft_owners_payout_history', 'farm_payment_id', {
                type: Sequelize.INTEGER,
                defaultValue: 0,
                // references: {
                //     model: {
                //         tableName: 'farm_payment_statistics',
                //         schema: 'public',
                //     },
                //     key: 'id',
                // },
            }, { transaction });
            await queryInterface.addColumn('statistics_destination_addresses_with_amount', 'farm_payment_id', {
                type: Sequelize.INTEGER,
                defaultValue: 0,
                // references: {
                //     model: {
                //         tableName: 'farm_payment_statistics',
                //         schema: 'public',
                //     },
                //     key: 'id',
                // },
            }, { transaction });
            await queryInterface.addColumn('statistics_tx_hash_status', 'farm_payment_id', {
                type: Sequelize.INTEGER,
                defaultValue: 0,
                // references: {
                //     model: {
                //         tableName: 'farm_payment_statistics',
                //         schema: 'public',
                //     },
                //     key: 'id',
                // },
            }, { transaction });

            return transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {

            await queryInterface.dropTable('collection_payment_allocations', { transaction });

            await queryInterface.removeIndex('collection_payment_allocations', ['id'], { transaction });
            await queryInterface.removeIndex('collection_payment_allocations', ['farm_id'], { transaction });
            await queryInterface.removeIndex('collection_payment_allocations', ['farm_payment_id'], { transaction });
            await queryInterface.removeIndex('collection_payment_allocations', ['collection_id'], { transaction });

            await queryInterface.removeIndex('farm_payment_statistics', ['id'], { transaction });
            await queryInterface.removeIndex('farm_payment_statistics', ['farm_id'], { transaction });
            await queryInterface.dropTable('farm_payment_statistics', { transaction });

            await queryInterface.removeColumn('statistics_nft_payout_history', 'farm_payment_id', { transaction });
            await queryInterface.removeColumn('statistics_nft_owners_payout_history', 'farm_payment_id', { transaction });
            await queryInterface.removeColumn('statistics_destination_addresses_with_amount', 'farm_payment_id', { transaction });
            await queryInterface.removeColumn('statistics_tx_hash_status', 'farm_payment_id', { transaction });

            return transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },
};
