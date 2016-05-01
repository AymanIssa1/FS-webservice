module.exports = function(sequelize, DataTypes) {
    return sequelize.define('service', {
        service_name:{
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 250]
            }
        },
        service_description: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 250]
            }
        },
        service_price: {
            type: DataTypes.DOUBLE(),
            allowNull: false,
            defaultValue: false
        }
    });
};