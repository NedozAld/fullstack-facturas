module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Usuario', {
        usu_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        cli_id: {
            type: DataTypes.INTEGER,
            unique: true,
            allowNull: true,
        },
        usu_username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        usu_password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        usu_rol: {
            type: DataTypes.STRING,
            defaultValue: 'cliente',
        },
    }, {
        tableName: 'usuario',
        timestamps: false,
    });
};
