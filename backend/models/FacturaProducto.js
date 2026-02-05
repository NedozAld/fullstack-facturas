
const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const FacturaProducto = sequelize.define('FacturaProducto', {
  pro_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  fac_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  facpro_cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  facpro_pvp: {
    type: DataTypes.DECIMAL(8,2),
    allowNull: false,
  },
}, {
  tableName: 'factura_producto',
  timestamps: false,
});

module.exports = FacturaProducto;
