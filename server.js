var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var middlewareBusiness = require('./middlewareBusiness.js')(db);
var middlewareEmployee = require('./middlewareEmployee.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/', function(request, response) {
    response.send('Felsekka API Root');
});


// Register New business
app.post('/business/register', function(request, response) {

    var body = _.pick(request.body, "customerFirstName", "customerLastName", "companyName","isMale", "email","phone", "password");
    db.business.create(body).then(function(business) {
        response.json(business.toJSON());
    }, function(e) {
        response.status(400).json(e);
    });
});

// login business
app.post('/business/login', function(request, response) {
    var body = _.pick(request.body, 'email', 'password');
    var businessInstance;

    db.business.authenticate(body).then(function(business) {
        var token = business.generateToken('authentication');
        businessInstance = business;

        console.log(business + " $$$$$ " + token);

        try {
            return db.businesstoken.create({
                token: token
            });
        } catch (e) {
            console.error(e);
        }

    }).then(function(tokenInstance) {
        response.header('Auth', tokenInstance.get('token')).json(businessInstance.toPublicJSON());
    }).catch(function() {
        response.status(401).send();
    });

});

// business logging out
app.delete('/business/logout', middlewareBusiness.requireAuthentication, function(request, response) {
    request.customertoken.destroy().then(function() {
        response.status(204).send();
    }).catch(function() {
        response.status(500).send();
    });
});

// Register New Employee
app.post('/employee/register', function(request, response) {

    var body = _.pick(request.body, "email", "employeeFullName", "isMale", "birthDate", "address", "phone", "password");
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
app.post('/order/add', middlewareBusiness.requireAuthentication, function(request, response) {
    var body = _.pick(request.body, "description", "lat_start", "lng_start","lat_end","lng_end","distance","duration");
    body.order_status = "NEW";

    db.order.create(body).then(function(order) {
        request.business.addOrder(order).then(function() {
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
            order_status: "NEW",
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
                    order_status: "TOKE"
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
            order_status: "DONE"
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