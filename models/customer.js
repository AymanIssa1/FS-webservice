var _ = require("underscore");
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = function(sequelize, DataTypes) {
    var customer = sequelize.define('customer', {
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
            beforeValidate: function(customer, options) {
                if (typeof customer.email === 'string') {
                    customer.email = customer.email.toLowerCase();
                }
            }
        },
        classMethods: {
            authenticate: function(body) {
                return new Promise(function(resolve, reject) {
                    if (typeof body.email !== 'string' || typeof body.password !== 'string') {
                        return reject();
                    }

                    customer.findOne({
                        where: {
                            email: body.email,
                            password: body.password
                        }
                    }).then(function(customer) {
                        if (!customer) {
                            return reject();
                        }
                        resolve(customer);
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

                        customer.findById(tokenData.id).then(function(customer) {
                            if (customer) {
                                resolve(customer);
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
                return _.pick(json, 'id','customerFirstName','customerLastName','companyName','isMale', 'phone' , 'email', 'createdAt', 'updatedAt');
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
    return customer;
};