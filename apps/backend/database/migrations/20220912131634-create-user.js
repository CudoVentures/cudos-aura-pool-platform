module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('users', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            email: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false,
                validate: {
                    isEmail: true,
                },
            },
            salt: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false,
            },
            hashed_pass: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false,
            },
            role: {
                type: Sequelize.ENUM(['super_admin', 'farm_admin']),
                allowNull: false,
            },
            cudos_address: {
                type: Sequelize.STRING,
            },
            payout_address: {
                type: Sequelize.STRING,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            is_active: {
                type: Sequelize.BOOLEAN,
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
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('users');
    },
};
