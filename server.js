var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var middlewareCustomer = require('./middlewareCustomer.js')(db);
var middlewareEmployee = require('./middlewareEmployee.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;
//var todos = [];


app.use(bodyParser.json());

app.get('/', function(request, response) {
    response.send('Felsekka API Root');
});


// Register New Customer
app.post('/customer/register', function(request, response) {

    var body = _.pick(request.body, "customerFirstName", "customerLastName", "companyName","isMale", "email","phone", "password");
    db.customer.create(body).then(function(customer) {
        response.json(customer.toJSON());
    }, function(e) {
        response.status(400).json(e);
    });
});

// login Customer
app.post('/customer/login', function(request, response) {
    var body = _.pick(request.body, 'email', 'password');
    var customerInstance;

    db.customer.authenticate(body).then(function(customer) {
        var token = customer.generateToken('authentication');
        customerInstance = customer;

        console.log(customer + " $$$$$ " + token);

        try {
            return db.customertoken.create({
                token: token
            });
        } catch (e) {
            console.error(e);
        }

    }).then(function(tokenInstance) {
        response.header('Auth', tokenInstance.get('token')).json(customerInstance.toPublicJSON());
    }).catch(function() {
        response.status(401).send();
    });

});

// Customer logging out
app.delete('/customer/logout', middlewareCustomer.requireAuthentication, function(request, response) {
    request.customertoken.destroy().then(function() {
        response.status(204).send();
    }).catch(function() {
        response.status(500).send();
    });
});

// customer add customerAddress
// app.post('/customer/customeraddress', middlewareCustomer.requireAuthentication, function(request, response) {
//     var body = _.pick(request.body, "ca_lat", "ca_lng", "ca_phone");

//     db.customeraddress.create(body).then(function(customeraddress) {
//         request.customer.addCustomeraddress(customeraddress).then(function() {
//             return customeraddress.reload();
//         }).then(function(customeraddress) {
//             response.json(customeraddress.toJSON());
//         });
//     }, function(e) {
//         response.status(400);
//     });

// });

// get all customerAddressess that related to customer
// app.get('/customer/customeraddress', middlewareCustomer.requireAuthentication, function(request, response) {
//     var query = request.query;

//     var where = {
//         customerId: request.customer.get('id')
//     };

//     db.customeraddress.findAll({
//         where: where
//     }).then(function(customeraddresses) {
//         response.json(customeraddresses);
//     }, function() {
//         response.status(500).send();
//     });

// });

// Add New Service
app.post('/service', function(request, response) {

    var body = _.pick(request.body, "service_name", "service_description", "service_price");

    db.service.create(body).then(function(service) {
        response.json(service.toJSON());
    }, function(e) {
        response.status(400).json(e);
    });
});

//GET All Services
app.get('/service', function(request, response) {
    db.service.findAll().then(function(service) {
        response.json(service);
    }, function(e) {
        response.status(500).send();
    });

});


// Register New Employee
app.post('/employee/register', function(request, response) {

    var body = _.pick(request.body, "email", "employeeFullName", "isMale", "birthDate", "address", "phone", "password", "serviceId");
    db.employee.create(body).then(function(employee) {
        response.json(employee.toJSON());
    }, function(e) {
        response.status(400).json(e);
    });
});

// login Employee
app.post('/employee/login', function(request, response) {
    var body = _.pick(request.body, 'email', 'password');
    var employeeInstance;

    db.employee.authenticate(body).then(function(employee) {
        var token = employee.generateToken('authentication');
        employeeInstance = employee;

        console.log(employee + " $$$$$ " + token);

        try {
            return db.employeetoken.create({
                token: token
            });
        } catch (e) {
            console.error(e);
        }

    }).then(function(tokenInstance) {
        response.header('Auth', tokenInstance.get('token')).json(employeeInstance.toPublicJSON());
    }).catch(function() {
        response.status(401).send();
    });

});

//Employee Logging out
app.delete('/employee/logout', middlewareEmployee.requireEmployeeAuthentication, function(request, response) {
    request.employeetoken.destroy().then(function() {
        response.status(204).send();
    }).catch(function() {
        response.status(500).send();
    });
});


//post an order
app.post('/order/add', middlewareCustomer.requireAuthentication, function(request, response) {
    var body = _.pick(request.body, "order_status", "description", "customeraddressId", "serviceId");

    db.order.create(body).then(function(order) {
        request.customer.addOrder(order).then(function() {
            return order.reload();
        }).then(function(order) {
            response.json(order.toJSON());
        });
    }, function(e) {
        response.status(400).send();
    });
});

// employee get avaliable orders
app.get('/orders', middlewareEmployee.requireEmployeeAuthentication, function(request, response) {
    db.order.findAll({
        where: {
            order_status: "New",
        }
        // ,
        // include: [{
        //     models: customeraddress
        // }],
        // raw: true
    }).then(function(order) {
        response.json(order);
    }, function(e) {
        response.status(500).send();
    });
});

//employee take order (update)
app.put('/employee/takeorder/:id', middlewareEmployee.requireEmployeeAuthentication, function(request, response) {
    var orderId = parseInt(request.params.id, 10);

    var employeeId = request.employee.get('id');

    db.order.findOne({
        where: {
            Id: orderId
        }
    }).then(function(order) {
        if (!order.employeeId) {
            db.order.update(
                //set values
                {
                    employeeId: employeeId,
                    tokeAt: new Date(),
                    order_status: "Toke"
                },
                // where clause
                {
                    where: {
                        Id: orderId
                    }

                }).then(function() {
                response.status(204).send();
            });
        } else {

            response.status(500).send();
        }
    })



});

//employee finish the order
app.put('/employee/finishorder/:id', middlewareEmployee.requireEmployeeAuthentication, function(request, response) {
    var orderId = parseInt(request.params.id, 10);
    var employeeId = request.employee.get('id');

    db.order.update(
        //set values
        {
            finishedAt: new Date(),
            order_status: "Done"
        },
        // where clause
        {
            where: {
                employeeId: employeeId,
                Id: orderId
            }

        }).then(function() {
        response.status(204).send();
    });
});


db.sequelize.sync({
    force: true
}).then(function() {
    app.listen(PORT, function() {
        console.log('Express listen on port ' + PORT + '!');
    });
});