module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('nfts', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            uri: {
                type: Sequelize.BLOB,
                allowNull: true,
            },
            data: {
                type: Sequelize.STRING,
            },
            hashing_power: {
                type: Sequelize.DECIMAL,
                allowNull: false,
            },
            price: {
                type: Sequelize.DECIMAL,
                allowNull: false,
            },
            expiration_date: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            status: {
                type: Sequelize.ENUM([
                    'queued',
                    'approved',
                    'rejected',
                    'expired',
                    'deleted',
                    'minted',
                ]),
                allowNull: false,
            },
            token_id: {
                type: Sequelize.STRING,
                allowNull: true,
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
            creator_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: {
                        tableName: 'users',
                        schema: 'public',
                    },
                    key: 'id',
                },
            },
            deleted_at: {
                type: Sequelize.DATE,
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
        await queryInterface.dropTable('nfts');
    },
};
