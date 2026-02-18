module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Producto', {
    pro_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    pro_nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pro_pvp: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
    },
    pro_impuesto: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 15.00,
    },
    pro_estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  }, {
    tableName: 'producto',
    timestamps: false,
  });
};
