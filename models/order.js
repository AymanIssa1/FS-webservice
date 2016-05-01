
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('order', {
        order_status: {
            type: DataTypes.INTEGER,
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
        // NEW , Toke , Done
        tokeAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        finishedAt: {
            type: DataTypes.DATE,
            allowNull: true
        }
    })
}