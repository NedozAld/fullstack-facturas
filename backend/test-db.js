
const { sequelize } = require('./models');
const { Usuario } = require('./models');

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connection to database has been established successfully.');

        // Check for table existence (sync check) - strictly read only here for safety, sticking to queries

        const count = await Usuario.count();
        console.log(`✅ Table 'Usuario' exists and has ${count} records.`);

        const users = await Usuario.findAll();
        console.log('Users found:', users.map(u => ({ id: u.usu_id, username: u.usu_username, password: u.usu_password })));

    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

testConnection();
