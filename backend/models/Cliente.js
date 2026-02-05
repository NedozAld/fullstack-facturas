
const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const Cliente = sequelize.define('Cliente', {
  cli_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cli_nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cli_correo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cli_estado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
}, {
  tableName: 'cliente',
  timestamps: false,
});

module.exports = Cliente;
