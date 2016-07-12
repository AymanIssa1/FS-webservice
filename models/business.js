var _ = require("underscore");
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = function(sequelize, DataTypes) {
    var business = sequelize.define('business', {
        customerFirstName: {
            type: DataTypes.STRING,
            allowNull:false,
            validate: {
                len: [2, 100]
            }
        },
        customerLastName: {
            type: DataTypes.STRING,
            allowNull:false,
            validate: {
                len: [2, 100]
            }
        },
        companyName: {
            type: DataTypes.STRING,
            allowNull:false,
            validate: {
                len: [2, 100]
            }
        },
        isMale: {
            type: DataTypes.BOOLEAN,
            allownull: false
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 16]
            }
        },
        img_url: {
            type: DataTypes.STRING,
            allownull: true
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
        }

    }, {
        hooks: {
            beforeValidate: function(business, options) {
                if (typeof business.email === 'string') {
                    business.email = business.email.toLowerCase();
                }
            }
        },
        classMethods: {
            authenticate: function(body) {
                return new Promise(function(resolve, reject) {
                    if (typeof body.email !== 'string' || typeof body.password !== 'string') {
                        return reject();
                    }

                    business.findOne({
                        where: {
                            email: body.email.toLowerCase(),
                            password: body.password
                        }
                    }).then(function(business) {
                        if (!business) {
                            return reject();
                        }
                        resolve(business);
                    }, function(e) {
                        reject();
                    });
                });
            },
            findByToken: function(token) {
                return new Promise(function(resolve, reject) {
                    try {
                        var decodedJWT = jwt.verify(token, 'qwerty098');
                        var bytes = cryptojs.AES.decrypt(decodedJWT.token, 'abc123!@#!');
                        var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));

                        business.findById(tokenData.id).then(function(business) {
                            if (business) {
                                resolve(business);
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
                return _.pick(json, 'id','customerFirstName','customerLastName','companyName','isMale', 'phone' ,'img_url', 'email', 'createdAt', 'updatedAt');
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
                    var encryptedData = cryptojs.AES.encrypt(stringData, 'abc123!@#!').toString();
                    var token = jwt.sign({
                        token: encryptedData
                    }, 'qwerty098');

                    return token;
                } catch (e) {
                    console.error(e);
                    return undefined;
                }
            }
        }
    });
    return business;
};