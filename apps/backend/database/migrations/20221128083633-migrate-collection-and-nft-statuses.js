/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkUpdate(
            'collections',
            { status: 'queued' },
            Sequelize.literal('status = \'rejected\''),
        )
        await queryInterface.bulkUpdate(
            'collections',
            { status: 'approved' },
            Sequelize.literal('status = \'issued\''),
        )

        await queryInterface.sequelize.query('ALTER TYPE "enum_nfts_status" ADD VALUE IF NOT EXISTS \'removed\'');

        await queryInterface.bulkUpdate(
            'nfts',
            { status: 'minted' },
            Sequelize.literal('status = \'approved\''),
        )
        await queryInterface.bulkUpdate(
            'nfts',
            { status: 'removed' },
            Sequelize.literal('status = \'rejected\' OR status = \'expired\' OR status = \'deleted\''),
        )
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkUpdate(
            'nfts',
            { status: 'deleted' },
            Sequelize.literal('status = \'removed\''),
        )
    },
};
