/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.addIndex('account_users', ['user_id'], { transaction });
            await queryInterface.addIndex('account_users', ['cudos_wallet_address'], { transaction });

            await queryInterface.addIndex('accounts', ['account_id'], { transaction });
            await queryInterface.addIndex('accounts', ['email'], { transaction });

            await queryInterface.addIndex('accounts_admins', ['account_id'], { transaction });
            await queryInterface.addIndex('accounts_admins', ['admin_id'], { transaction });

            await queryInterface.addIndex('accounts_super_admins', ['account_id'], { transaction });
            await queryInterface.addIndex('accounts_super_admins', ['super_admin_id'], { transaction });

            await queryInterface.addIndex('collections', ['id'], { transaction });
            await queryInterface.addIndex('collections', ['denom_id'], { transaction });
            await queryInterface.addIndex('collections', ['farm_id'], { transaction });
            await queryInterface.addIndex('collections', ['status'], { transaction });

            await queryInterface.addIndex('farms', ['id'], { transaction });
            await queryInterface.addIndex('farms', ['creator_id'], { transaction });
            await queryInterface.addIndex('farms', ['name'], { transaction });
            await queryInterface.addIndex('farms', ['status'], { transaction });

            await queryInterface.addIndex('miners', ['id'], { transaction });
            await queryInterface.addIndex('manufacturers', ['id'], { transaction });
            await queryInterface.addIndex('energy_sources', ['id'], { transaction });

            await queryInterface.addIndex('settings', ['id'], { transaction });

            await queryInterface.addIndex('nfts', ['id'], { transaction });
            await queryInterface.addIndex('nfts', ['collection_id'], { transaction });
            await queryInterface.addIndex('nfts', ['status'], { transaction });
            await queryInterface.addIndex('nfts', ['current_owner'], { transaction });
            await queryInterface.addIndex('nfts', ['name'], { transaction });
            await queryInterface.addIndex('nfts', ['creator_id'], { transaction });
            await queryInterface.addIndex('nfts', ['expiration_date'], { transaction });
            await queryInterface.addIndex('nfts', ['token_id'], { transaction });

            await queryInterface.addIndex('statistics_nft_owners_payout_history', ['id'], { transaction });
            await queryInterface.addIndex('statistics_nft_owners_payout_history', ['owner'], { transaction });
            await queryInterface.addIndex('statistics_nft_owners_payout_history', ['sent'], { transaction });
            await queryInterface.addIndex('statistics_nft_owners_payout_history', ['createdAt'], { transaction });
            await queryInterface.addIndex('statistics_nft_owners_payout_history', ['nft_payout_history_id'], { transaction });

            await queryInterface.addIndex('statistics_nft_payout_history', ['id'], { transaction });
            await queryInterface.addIndex('statistics_nft_payout_history', ['denom_id'], { transaction });
            await queryInterface.addIndex('statistics_nft_payout_history', ['token_id'], { transaction });
            await queryInterface.addIndex('statistics_nft_payout_history', ['payout_period_start'], { transaction });
            await queryInterface.addIndex('statistics_nft_payout_history', ['payout_period_end'], { transaction });

            await queryInterface.addIndex('visitors', ['id'], { transaction });
            await queryInterface.addIndex('visitors', ['ref_type'], { transaction });
            await queryInterface.addIndex('visitors', ['ref_id'], { transaction });

            return transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.deleteIndex('account_users', ['user_id'], { transaction });
            await queryInterface.deleteIndex('account_users', ['cudos_wallet_address'], { transaction });

            await queryInterface.deleteIndex('accounts', ['account_id'], { transaction });
            await queryInterface.deleteIndex('accounts', ['email'], { transaction });

            await queryInterface.deleteIndex('accounts_admins', ['account_id'], { transaction });
            await queryInterface.deleteIndex('accounts_admins', ['admin_id'], { transaction });

            await queryInterface.deleteIndex('accounts_super_admins', ['account_id'], { transaction });
            await queryInterface.deleteIndex('accounts_super_admins', ['super_admin_i'], { transaction });

            await queryInterface.deleteIndex('collections', ['id'], { transaction });
            await queryInterface.deleteIndex('collections', ['denom_id'], { transaction });
            await queryInterface.deleteIndex('collections', ['farm_id'], { transaction });
            await queryInterface.deleteIndex('collections', ['status'], { transaction });

            await queryInterface.deleteIndex('farms', ['id'], { transaction });
            await queryInterface.deleteIndex('farms', ['creator_id'], { transaction });
            await queryInterface.deleteIndex('farms', ['name'], { transaction });
            await queryInterface.deleteIndex('farms', ['status'], { transaction });

            await queryInterface.deleteIndex('miners', ['id'], { transaction });
            await queryInterface.deleteIndex('manufacturers', ['id'], { transaction });
            await queryInterface.deleteIndex('energy_sources', ['id'], { transaction });

            await queryInterface.deleteIndex('settings', ['id'], { transaction });

            await queryInterface.deleteIndex('nfts', ['id'], { transaction });
            await queryInterface.deleteIndex('nfts', ['collection_id'], { transaction });
            await queryInterface.deleteIndex('nfts', ['status'], { transaction });
            await queryInterface.deleteIndex('nfts', ['current_owner'], { transaction });
            await queryInterface.deleteIndex('nfts', ['name'], { transaction });
            await queryInterface.deleteIndex('nfts', ['creator_id'], { transaction });
            await queryInterface.deleteIndex('nfts', ['expiration_date'], { transaction });
            await queryInterface.deleteIndex('nfts', ['token_id'], { transaction });

            await queryInterface.deleteIndex('statistics_nft_owners_payout_history', ['id'], { transaction });
            await queryInterface.deleteIndex('statistics_nft_owners_payout_history', ['owner'], { transaction });
            await queryInterface.deleteIndex('statistics_nft_owners_payout_history', ['sent'], { transaction });
            await queryInterface.deleteIndex('statistics_nft_owners_payout_history', ['createdAt'], { transaction });
            await queryInterface.deleteIndex('statistics_nft_owners_payout_history', ['nft_payout_history_id'], { transaction });

            await queryInterface.deleteIndex('statistics_nft_payout_history', ['id'], { transaction });
            await queryInterface.deleteIndex('statistics_nft_payout_history', ['denom_id'], { transaction });
            await queryInterface.deleteIndex('statistics_nft_payout_history', ['token_id'], { transaction });
            await queryInterface.deleteIndex('statistics_nft_payout_history', ['payout_period_start'], { transaction });
            await queryInterface.deleteIndex('statistics_nft_payout_history', ['payout_period_end'], { transaction });

            await queryInterface.deleteIndex('visitors', ['id'], { transaction });
            await queryInterface.deleteIndex('visitors', ['ref_type'], { transaction });
            await queryInterface.deleteIndex('visitors', ['ref_id'], { transaction });
            return transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },
};
