/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // get all times with id
            const query = 'SELECT * from statistics_destination_addresses_with_amount;';
            const statistics = await queryInterface.sequelize.query(query);
            const statRows = statistics[0];

            // remove column
            await queryInterface.removeColumn('statistics_destination_addresses_with_amount', 'time', { transaction })

            // add new column
            await queryInterface.addColumn(
                'statistics_destination_addresses_with_amount',
                'payout_time',
                {
                    type: Sequelize.BIGINT,
                    allowNull: false,
                    defaultValue: 0,
                },
                { transaction },
            );

            for (let i = 0; i < statRows.length; i++) {
                const stat = statRows[i];
                const a = new Date(stat.time);
                stat.time = a.getTime();

                // set time in rows
                const updateQuery = `UPDATE statistics_destination_addresses_with_amount SET payout_time = ${stat.time} WHERE id = ${stat.id};`;
                await queryInterface.sequelize.query(updateQuery, { transaction });
            }

            await queryInterface.addColumn(
                'statistics_destination_addresses_with_amount',
                'threshold_reached',
                {
                    allowNull: false,
                    type: Sequelize.BOOLEAN,
                    defaultValue: false,
                },
                { transaction },
            );

            await queryInterface.renameColumn(
                'statistics_destination_addresses_with_amount',
                'amount',
                'amount_btc',
                { transaction },
            );

            return transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // get all times with id
            const query = 'SELECT * from statistics_destination_addresses_with_amount;';
            const statistics = await queryInterface.sequelize.query(query);
            const statRows = statistics[0];

            // remove column
            await queryInterface.removeColumn('statistics_destination_addresses_with_amount', 'payout_time', { transaction })

            // add new column
            await queryInterface.addColumn(
                'statistics_destination_addresses_with_amount',
                'time',
                {
                    type: Sequelize.DATE,
                },
                { transaction },
            );

            for (let i = 0; i < statRows.length; i++) {
                const stat = statRows[i];
                stat.time = new Date(parseInt(stat.payout_time));

                // set time in rows
                const updateQuery = `UPDATE statistics_destination_addresses_with_amount SET time = '${stat.time.toLocaleString()}' WHERE id = ${stat.id};`;
                await queryInterface.sequelize.query(updateQuery, { transaction });
            }

            await queryInterface.removeColumn(
                'statistics_destination_addresses_with_amount',
                'threshold_reached',
                { transaction },
            );

            await queryInterface.renameColumn(
                'statistics_destination_addresses_with_amount',
                'amount_btc',
                'amount',
                { transaction },
            );

            return transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },
};
