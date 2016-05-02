module.exports = function(sequelize, DataTypes) {
    return sequelize.define('customeraddress',{
        ca_name:{
            type: DataTypes.STRING,
            allowNull:false,
            validate: {
                len: [2, 100]
            }
        },
        ca_lat:{
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        ca_lng:{
            type: DataTypes.DOUBLE,
            allowNull: false
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