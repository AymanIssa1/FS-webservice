module.exports = function(sequelize, DataTypes) {
    return sequelize.define('customeraddress',{
        ca_lat:{
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 250]
            }
        },
        ca_lng:{
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 250]
            }
        },
        ca_phone:{
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 16]
            }
        }
    });
};