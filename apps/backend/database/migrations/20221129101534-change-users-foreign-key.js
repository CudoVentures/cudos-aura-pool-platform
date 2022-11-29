/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.removeConstraint(
                'farms',
                'farms_creator_id_fkey',
                { transaction },
            );
            await queryInterface.addConstraint('farms', {
                type: 'foreign key',
                name: 'farms_creator_id_fkey',
                fields: ['creator_id'],
                references: {
                    table: 'accounts',
                    field: 'account_id',
                },
                onDelete: 'CASCADE',
                transaction,
            });

            await queryInterface.removeConstraint(
                'collections',
                'collections_creator_id_fkey',
                { transaction },
            );
            await queryInterface.addConstraint('collections', {
                type: 'foreign key',
                name: 'collections_creator_id_fkey',
                fields: ['creator_id'],
                references: {
                    table: 'accounts',
                    field: 'account_id',
                },
                onDelete: 'CASCADE',
                transaction,
            });

            await queryInterface.removeConstraint(
                'nfts',
                'nfts_creator_id_fkey',
                { transaction },
            );
            await queryInterface.addConstraint('nfts', {
                type: 'foreign key',
                name: 'nfts_creator_id_fkey',
                fields: ['creator_id'],
                references: {
                    table: 'accounts',
                    field: 'account_id',
                },
                onDelete: 'CASCADE',
                transaction,
            });
            return transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.removeConstraint(
                'farms',
                'farms_creator_id_fkey',
                { transaction },
            );
            await queryInterface.addConstraint('farms', {
                type: 'foreign key',
                name: 'farms_creator_id_fkey',
                fields: ['creator_id'],
                references: {
                    table: 'users',
                    field: 'id',
                },
                transaction,
            });

            await queryInterface.removeConstraint(
                'collections',
                'collections_creator_id_fkey',
                { transaction },
            );
            await queryInterface.addConstraint('collections', {
                type: 'foreign key',
                name: 'collections_creator_id_fkey',
                fields: ['creator_id'],
                references: {
                    table: 'users',
                    field: 'id',
                },
                transaction,
            });

            await queryInterface.removeConstraint(
                'nfts',
                'nfts_creator_id_fkey',
                { transaction },
            );
            await queryInterface.addConstraint('nfts', {
                type: 'foreign key',
                name: 'nfts_creator_id_fkey',
                fields: ['creator_id'],
                references: {
                    table: 'users',
                    field: 'id',
                },
                transaction,
            });

            return transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },
};
