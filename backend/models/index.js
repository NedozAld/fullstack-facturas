const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('factura', 'postgres', '1234', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
});


module.exports = { sequelize };

// Importar modelos después de exportar sequelize para evitar require circular
const Cliente = require('./Cliente');
const Producto = require('./Producto');
const Factura = require('./Factura');
const FacturaProducto = require('./FacturaProducto');

// Relaciones
Cliente.hasMany(Factura, { foreignKey: 'cli_id' });
Factura.belongsTo(Cliente, { foreignKey: 'cli_id' });

Factura.belongsToMany(Producto, { through: FacturaProducto, foreignKey: 'fac_id', otherKey: 'pro_id' });
Producto.belongsToMany(Factura, { through: FacturaProducto, foreignKey: 'pro_id', otherKey: 'fac_id' });

module.exports.Cliente = Cliente;
module.exports.Producto = Producto;
module.exports.Factura = Factura;
module.exports.FacturaProducto = FacturaProducto;
