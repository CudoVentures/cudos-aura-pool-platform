module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('visitors', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.BIGINT,
            },
            refType: {
                field: 'ref_type',
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            refId: {
                field: 'ref_id',
                type: Sequelize.STRING(48),
                allowNull: false,
            },
            visitorUuid: {
                field: 'visitor_uuid',
                type: Sequelize.STRING(48),
                allowNull: false,
            },
            createdAt: {
                field: 'created_at',
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                field: 'updated_at',
                allowNull: false,
                type: Sequelize.DATE,
            },
        }, {
            indexes: [
                {
                    unique: true,
                    fields: ['ref_type', 'ref_id', 'visitor_uuid'],
                },
                {
                    unique: true,
                    fields: ['ref_type', 'ref_id'],
                },
            ],
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('visitors');
    },
};
