module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('manufacturers', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            name: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false,
            },
        });

        await queryInterface.createTable('energy_sources', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            name: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false,
            },
        });

        await queryInterface.createTable('miners', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            name: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false,
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('manufacturers');
        await queryInterface.dropTable('energy_sources');
        await queryInterface.dropTable('miners');
    },
};
