/** @type {import('sequelize-cli').Migration} */
module.exports = {

    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('accounts', {
            account_id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            type: {
                allowNull: false,
                type: Sequelize.INTEGER,
            },
            active: {
                allowNull: false,
                type: Sequelize.INTEGER,
            },
            email_verified: {
                allowNull: false,
                type: Sequelize.INTEGER,
            },
            name: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            email: {
                allowNull: true,
                validate: {
                    isEmail: true,
                },
                type: Sequelize.STRING,
            },
            last_login_at: {
                allowNull: true,
                type: Sequelize.DATE,
            },
            salt: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            hashed_pass: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        }, {
            indexes: [
                {
                    fields: ['email'],
                },
            ],
        });

        await queryInterface.createTable('account_users', {
            user_id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            account_id: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'accounts',
                    key: 'account_id',
                },
            },
            cudos_wallet_address: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            profile_img_url: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            cover_img_url: {
                allowNull: false,
                type: Sequelize.STRING,
            },
        }, {
            indexes: [
                {
                    unique: true,
                    fields: ['account_id'],
                }, {
                    fields: ['cudos_wallet_address'],
                },
            ],
        });

        await queryInterface.createTable('accounts_admins', {
            admin_id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            account_id: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'accounts',
                    key: 'account_id',
                },
            },
            cudos_wallet_address: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            bitcoin_wallet_address: {
                allowNull: false,
                type: Sequelize.STRING,
            },
        }, {
            indexes: [
                {
                    unique: true,
                    fields: ['account_id'],
                },
            ],
        });

        await queryInterface.createTable('accounts_super_admins', {
            super_admin_id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            account_id: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'accounts',
                    key: 'account_id',
                },
            },
            cudos_royaltees_address: {
                allowNull: false,
                type: Sequelize.STRING,
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
        }, {
            indexes: [
                {
                    unique: true,
                    fields: ['account_id'],
                },
            ],
        });

        const sqlResult = await queryInterface.sequelize.query('SELECT * FROM users');
        const users = sqlResult[0];
        let maxAccountId = 0;
        for (let i = 0; i < users.length; ++i) {
            const user = users[i];

            let type = null;
            switch (user.role) {
                case 'farm_admin':
                    type = 2;
                    break;
                case 'super_admin':
                    type = 3;
                    break;
                default:
                    throw Error(`unknown type: ${user.type}`);
            }

            const accountId = user.id;
            const name = user.name ?? '';
            const salt = user.salt ?? '';
            const hashedPass = user.hashed_pass ?? '';

            await queryInterface.sequelize.query(`INSERT INTO accounts(account_id, type, active, email_verified, name, email, salt, hashed_pass, last_login_at, created_at, updated_at) VALUES('${accountId}', '${type}', '${1}', '${1}', '${name}', '${user.email}', '${salt}', '${hashedPass}', null, '${user.createdAt.toISOString()}', '${user.updatedAt.toISOString()}')`);
            if (type === 2) {
                const cudosWalletAddress = user.cudos_address ?? '';
                const payoutAddress = user.payout_address ?? '';
                await queryInterface.sequelize.query(`INSERT INTO accounts_admins(account_id, cudos_wallet_address, bitcoin_wallet_address) VALUES('${accountId}', '${cudosWalletAddress}', '${payoutAddress}')`)
            } else if (type === 3) {
                await queryInterface.sequelize.query(`INSERT INTO accounts_super_admins(account_id, cudos_royaltees_address, first_sale_cudos_royalties_percent, resale_cudos_royalties_percent, global_cudos_fees_percent, global_cudos_royalties_percent) VALUES('${accountId}', 'cudos14h7pdf8g2kkjgum5dntz80s5lhtrw3lk2uswk0', '${2}', '${2.5}', '${10}', '${5}')`)
            }

            if (accountId > maxAccountId) {
                maxAccountId = accountId;
            }
        }

        await queryInterface.sequelize.query(`ALTER SEQUENCE accounts_account_id_seq RESTART WITH ${maxAccountId + 1}`);
        // await queryInterface.dropTable('users');

    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('account_users');
        await queryInterface.dropTable('accounts_admins');
        await queryInterface.dropTable('accounts_super_admins');
        await queryInterface.dropTable('accounts');

        // await queryInterface.createTable('users', {
        //     id: {
        //         allowNull: false,
        //         autoIncrement: true,
        //         primaryKey: true,
        //         type: Sequelize.INTEGER,
        //     },
        //     email: {
        //         type: Sequelize.STRING,
        //         unique: true,
        //         allowNull: false,
        //         validate: {
        //             isEmail: true,
        //         },
        //     },
        //     salt: {
        //         type: Sequelize.STRING,
        //         unique: true,
        //         allowNull: false,
        //     },
        //     hashed_pass: {
        //         type: Sequelize.STRING,
        //         unique: true,
        //         allowNull: false,
        //     },
        //     role: {
        //         type: Sequelize.ENUM(['super_admin', 'farm_admin']),
        //         allowNull: false,
        //     },
        //     cudos_address: {
        //         type: Sequelize.STRING,
        //     },
        //     payout_address: {
        //         type: Sequelize.STRING,
        //     },
        //     name: {
        //         type: Sequelize.STRING,
        //         allowNull: true,
        //     },
        //     is_active: {
        //         type: Sequelize.BOOLEAN,
        //         allowNull: false,
        //     },
        //     createdAt: {
        //         allowNull: false,
        //         type: Sequelize.DATE,
        //     },
        //     updatedAt: {
        //         allowNull: false,
        //         type: Sequelize.DATE,
        //     },
        // });
    },

};
