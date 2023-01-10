/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async (tx) => {
            await queryInterface.createTable('settings', {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER,
                },
                first_sale_cudos_royalties_percent: {
                    allowNull: false,
                    type: Sequelize.FLOAT,
                },
                resale_cudos_royalties_percent: {
                    allowNull: false,
                    type: Sequelize.FLOAT,
                },
                global_cudos_fees_percent: {
                    allowNull: false,
                    type: Sequelize.FLOAT,
                },
                global_cudos_royalties_percent: {
                    allowNull: false,
                    type: Sequelize.FLOAT,
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

            const sqlSuperAdmin = await queryInterface.sequelize.query('SELECT * FROM accounts_super_admins');
            const superAdmins = sqlSuperAdmin[0];
            let firstSaleCudosRoyaltiesPercent = 5;
            let resaleCudosRoyaltiesPercent = 10;
            let globalCudosFeesPercent = 2;
            let globalCudosRoyaltiesPercent = 10;
            if (superAdmins.length > 0) {
                const superAdmin = superAdmins[0];
                firstSaleCudosRoyaltiesPercent = superAdmin.first_sale_cudos_royalties_percent;
                resaleCudosRoyaltiesPercent = superAdmin.resale_cudos_royalties_percent;
                globalCudosFeesPercent = superAdmin.global_cudos_fees_percent;
                globalCudosRoyaltiesPercent = superAdmin.global_cudos_royalties_percent;
            }

            await queryInterface.sequelize.query(`INSERT INTO settings(first_sale_cudos_royalties_percent, resale_cudos_royalties_percent, global_cudos_fees_percent, global_cudos_royalties_percent, created_at, updated_at) VALUES(${firstSaleCudosRoyaltiesPercent}, ${resaleCudosRoyaltiesPercent}, ${globalCudosFeesPercent}, ${globalCudosRoyaltiesPercent}, CURRENT_DATE, CURRENT_DATE)`, { tx });

            await queryInterface.removeColumn('accounts_super_admins', 'first_sale_cudos_royalties_percent', { tx });
            await queryInterface.removeColumn('accounts_super_admins', 'resale_cudos_royalties_percent', { tx });
            await queryInterface.removeColumn('accounts_super_admins', 'global_cudos_fees_percent', { tx });
            await queryInterface.removeColumn('accounts_super_admins', 'global_cudos_royalties_percent', { tx });
        });
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async (tx) => {
            await queryInterface.addColumn('accounts_super_admins', 'first_sale_cudos_royalties_percent', {
                allowNull: false,
                type: Sequelize.FLOAT,
                defaultValue: 0,
            }, { tx });
            await queryInterface.addColumn('accounts_super_admins', 'resale_cudos_royalties_percent', {
                allowNull: false,
                type: Sequelize.FLOAT,
                defaultValue: 0,
            }, { tx });
            await queryInterface.addColumn('accounts_super_admins', 'global_cudos_fees_percent', {
                allowNull: false,
                type: Sequelize.FLOAT,
                defaultValue: 0,
            }, { tx });
            await queryInterface.addColumn('accounts_super_admins', 'global_cudos_royalties_percent', {
                allowNull: false,
                type: Sequelize.FLOAT,
                defaultValue: 0,
            }, { tx });

            const sqlSettings = await queryInterface.sequelize.query('SELECT * FROM settings', { tx });
            const settings = sqlSettings[0];
            let firstSaleCudosRoyaltiesPercent = 5;
            let resaleCudosRoyaltiesPercent = 10;
            let globalCudosFeesPercent = 2;
            let globalCudosRoyaltiesPercent = 10;
            if (settings.length > 0) {
                const setting = settings[0];
                firstSaleCudosRoyaltiesPercent = setting.first_sale_cudos_royalties_percent;
                resaleCudosRoyaltiesPercent = setting.resale_cudos_royalties_percent;
                globalCudosFeesPercent = setting.global_cudos_fees_percent;
                globalCudosRoyaltiesPercent = setting.global_cudos_royalties_percent;
            }

            await queryInterface.sequelize.query(`UPDATE accounts_super_admins SET first_sale_cudos_royalties_percent = ${firstSaleCudosRoyaltiesPercent}, resale_cudos_royalties_percent = ${resaleCudosRoyaltiesPercent}, global_cudos_fees_percent = ${globalCudosFeesPercent}, global_cudos_royalties_percent = ${globalCudosRoyaltiesPercent}`, { tx });

            await queryInterface.dropTable('settings', { tx });
        });
    },
};
