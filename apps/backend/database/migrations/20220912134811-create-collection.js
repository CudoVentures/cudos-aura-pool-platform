module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('collections', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            description: {
                type: Sequelize.STRING,
            },
            denom_id: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            hashing_power: {
                type: Sequelize.DECIMAL,
                allowNull: false,
            },
            royalties: {
                type: Sequelize.DECIMAL,
                allowNull: false,
            },
            status: {
                type: Sequelize.ENUM([
                    'queued',
                    'approved',
                    'rejected',
                    'issued',
                    'deleted',
                ]),
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
        await queryInterface.dropTable('collections');
    },
};
