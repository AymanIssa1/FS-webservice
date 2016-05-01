var _ = require("underscore");
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = function(sequelize, DataTypes) {
    var employee = sequelize.define('employee', {
        employeeFullName: {
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
        }

    }, {
        hooks: {
            beforeValidate: function(employee, options) {
                if (typeof employee.email === 'string') {
                    employee.email = employee.email.toLowerCase();
                }
            }
        },
        classMethods: {
            authenticate: function(body) {
                return new Promise(function(resolve, reject) {
                    if (typeof body.email !== 'string' || typeof body.password !== 'string') {
                        return reject();
                    }

                    employee.findOne({
                        where: {
                            email: body.email,
                            password: body.password
                        }
                    }).then(function(employee) {
                        if (!employee) {
                            return reject();
                        }
                        resolve(employee);
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

                        employee.findById(tokenData.id).then(function(employee) {
                            if (employee) {
                                resolve(employee);
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
                return _.pick(json, 'id', 'email', 'employeeFullName', 'isMale', 'birthDate', 'address', 'phone', 'createdAt', 'updatedAt');
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
    return employee;
};