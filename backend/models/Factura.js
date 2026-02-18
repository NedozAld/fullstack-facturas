
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Factura', {
    fac_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cli_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fac_fecha: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'factura',
    timestamps: false,
  });
};
