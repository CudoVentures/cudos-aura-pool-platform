/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async (tx) => {
            await queryInterface.removeColumn('kyc', 'reports');
            await queryInterface.removeColumn('kyc', 'check_ids');
            await queryInterface.removeColumn('kyc', 'check_results');
            await queryInterface.removeColumn('kyc', 'check_statuses');
            await queryInterface.addColumn('kyc', 'workflow_ids', {
                allowNull: false,
                type: Sequelize.ARRAY(Sequelize.STRING),
                defaultValue: [],
            }, { tx });
            await queryInterface.addColumn('kyc', 'workflow_run_ids', {
                allowNull: false,
                type: Sequelize.ARRAY(Sequelize.STRING),
                defaultValue: [],
            }, { tx });
            await queryInterface.addColumn('kyc', 'workflow_run_statuses', {
                allowNull: false,
                type: Sequelize.ARRAY(Sequelize.STRING),
                defaultValue: [],
            }, { tx });
            await queryInterface.addColumn('kyc', 'workflow_run_params', {
                allowNull: false,
                type: Sequelize.ARRAY(Sequelize.STRING),
                defaultValue: [],
            }, { tx });
        });
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async (tx) => {
            await queryInterface.removeColumn('kyc', 'workflow_ids');
            await queryInterface.removeColumn('kyc', 'workflow_run_ids');
            await queryInterface.removeColumn('kyc', 'workflow_run_statuses');
            await queryInterface.removeColumn('kyc', 'workflow_run_params');
            await queryInterface.addColumn('kyc', 'reports', {
                allowNull: false,
                type: Sequelize.ARRAY(Sequelize.STRING),
                defaultValue: [],
            }, { tx });
            await queryInterface.addColumn('kyc', 'check_ids', {
                allowNull: false,
                type: Sequelize.ARRAY(Sequelize.STRING),
                defaultValue: [],
            }, { tx });
            await queryInterface.addColumn('kyc', 'check_results', {
                allowNull: false,
                type: Sequelize.ARRAY(Sequelize.STRING),
                defaultValue: [],
            }, { tx });
            await queryInterface.addColumn('kyc', 'check_statuses', {
                allowNull: false,
                type: Sequelize.ARRAY(Sequelize.STRING),
                defaultValue: [],
            }, { tx });
        });
    },
};
