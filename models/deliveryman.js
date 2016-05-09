var _ = require("underscore");
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = function(sequelize, DataTypes) {
    var deliveryman = sequelize.define('deliveryman', {
        deliverymanFullName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [2, 100]
            }
        },
        isMale: {
            type: DataTypes.BOOLEAN,
            allownull: false
        },
        birthDate: {
            type: DataTypes.DATEONLY,
            allownull:false
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [2, 100]
            }
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 16]
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [7, 100]
            }
        },
        totalWalkedDistance: {
            type: DataTypes.DOUBLE,
            allownull: true
        }

    }, {
        hooks: {
            beforeValidate: function(deliveryman, options) {
                if (typeof deliveryman.email === 'string') {
                    deliveryman.email = deliveryman.email.toLowerCase();
                }
            }
        },
        classMethods: {
            authenticate: function(body) {
                return new Promise(function(resolve, reject) {
                    if (typeof body.email !== 'string' || typeof body.password !== 'string') {
                        return reject();
                    }

                    deliveryman.findOne({
                        where: {
                            email: body.email,
                            password: body.password
                        }
                    }).then(function(deliveryman) {
                        if (!deliveryman) {
                            return reject();
                        }
                        resolve(deliveryman);
                    }, function(e) {
                        reject();
                    });
                });
            },
            findByToken: function(token) {
                return new Promise(function(resolve, reject) {
                    try {
                        var decodedJWT = jwt.verify(token, 'zxcvb012');
                        var bytes = cryptojs.AES.decrypt(decodedJWT.token, 'xyz987!@#!');
                        var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));

                        deliveryman.findById(tokenData.id).then(function(deliveryman) {
                            if (deliveryman) {
                                resolve(deliveryman);
                            } else {
                                reject();
                            }
                        }, function(e) {
                            reject();
                        });

                    } catch (e) {
                        reject();
                    }
                });
            }
        },
        instanceMethods: {
            toPublicJSON: function() {
                var json = this.toJSON();
                return _.pick(json, 'id', 'email', 'deliverymanFullName', 'isMale', 'birthDate', 'address', 'phone', 'createdAt', 'updatedAt');
            },
            generateToken: function(type) {
                if (!_.isString(type)) {
                    return undefined;
                }

                try {
                    var stringData = JSON.stringify({
                        id: this.get('id'),
                        type: type
                    });
                    var encryptedData = cryptojs.AES.encrypt(stringData, 'xyz987!@#!').toString();
                    var token = jwt.sign({
                        token: encryptedData
                    }, 'zxcvb012');

                    return token;
                } catch (e) {
                    console.error(e);
                    return undefined;
                }
            }
        }
    });
    return deliveryman;
};