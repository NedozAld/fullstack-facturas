require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'facturas_integrador',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASS || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: false,
  }
);

console.log('DB Config:', {
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  // pass: process.env.DB_PASS ? '****' : 'undefined' 
});

// Importar modelos (ahora son funciones que reciben sequelize y DataTypes)
const ClienteModel = require('./Cliente');
const ProductoModel = require('./Producto');
const FacturaModel = require('./Factura');
const FacturaProductoModel = require('./FacturaProducto');
const UsuarioModel = require('./Usuario');

// Inicializar modelos
const Cliente = ClienteModel(sequelize, DataTypes);
const Producto = ProductoModel(sequelize, DataTypes);
const Factura = FacturaModel(sequelize, DataTypes);
const FacturaProducto = FacturaProductoModel(sequelize, DataTypes);
const Usuario = UsuarioModel(sequelize, DataTypes);

// Relaciones
// Cliente - Factura (1:N)
Cliente.hasMany(Factura, { foreignKey: 'cli_id' });
Factura.belongsTo(Cliente, { foreignKey: 'cli_id' });

// Factura - Producto (N:M)
Factura.belongsToMany(Producto, { through: FacturaProducto, foreignKey: 'fac_id', otherKey: 'pro_id' });
Producto.belongsToMany(Factura, { through: FacturaProducto, foreignKey: 'pro_id', otherKey: 'fac_id' });

// Cliente - Usuario (1:1)
Cliente.hasOne(Usuario, { foreignKey: 'cli_id' });
Usuario.belongsTo(Cliente, { foreignKey: 'cli_id' });

module.exports = {
  sequelize,
  Cliente,
  Producto,
  Factura,
  FacturaProducto,
  Usuario
};
