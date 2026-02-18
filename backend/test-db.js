const { sequelize } = require('./models');
const { Usuario, Cliente, Producto, Factura } = require('./models');

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connection to database has been established successfully.');

        const userCount = await Usuario.count();
        console.log(`✅ Table 'Usuario' exists and has ${userCount} records.`);

        const clientCount = await Cliente.count();
        console.log(`✅ Table 'Cliente' exists and has ${clientCount} records.`);

        const productCount = await Producto.count();
        console.log(`✅ Table 'Producto' exists and has ${productCount} records.`);

        const invoiceCount = await Factura.count();
        console.log(`✅ Table 'Factura' exists and has ${invoiceCount} records.`);

    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

testConnection();
