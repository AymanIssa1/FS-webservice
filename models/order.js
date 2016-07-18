module.exports = function(sequelize, DataTypes) {
    return sequelize.define('order', {

        // NEW , Toke , Done
        order_status: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1]
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                len: [2]
            }
        },
        lat_start:{
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        lng_start:{
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        lat_end:{
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        lng_end:{
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        order_lat:{
            type: DataTypes.DOUBLE,
            allowNull: true
        },
        order_lng:{
            type: DataTypes.DOUBLE,
            allowNull: true
        },
        distance:{
            type: DataTypes.TEXT,
            allowNull: false
        },
        duration:{
            type: DataTypes.TEXT,
            allowNull: false
        },
        tokeAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        pickAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        finishedAt: {
            type: DataTypes.DATE,
            allowNull: true
        }
    })
}