/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        queryInterface.bulkUpdate(
            'collections',
            { status: 'queued' },
            Sequelize.literal('status = \'rejected\''),
        )
        queryInterface.bulkUpdate(
            'collections',
            { status: 'approved' },
            Sequelize.literal('status = \'issued\''),
        )

        queryInterface.bulkUpdate(
            'nfts',
            { status: 'minted' },
            Sequelize.literal('status = \'approved\''),
        )
        queryInterface.bulkUpdate(
            'nfts',
            { status: 'removed' },
            Sequelize.literal('status = \'rejected\' OR status = \'expired\' OR status = \'deleted\''),
        )
    },

    async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    },
};
