var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var middlewareBusiness = require('./middlewareBusiness.js')(db);
var middlewareDeliveryman = require('./middlewareDeliveryman.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/', function(request, response) {
    response.send('Felsekka API Root');
});


// Register New business
app.post('/business/register', function(request, response) {

    var body = _.pick(request.body, "customerFirstName", "customerLastName", "companyName", "isMale", "email", "phone", "password");
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

//business if this accessToken is exist in database
app.get('/business/checkAccessToken', middlewareBusiness.requireAuthentication, function(request, response) {

    var businessId = request.business.get('id');

    db.business.findOne({
        where: {
            id: businessId
        }
    }).then(function(business) {
        if (business) {
            response.json(business.toPublicJSON());
        } else {
            response.status(404).send();
        }
    })
});

// business logging out
app.delete('/business/logout', middlewareBusiness.requireAuthentication, function(request, response) {
    request.customertoken.destroy().then(function() {
        response.status(204).send();
    }).catch(function() {
        response.status(500).send();
    });
});

//business edit profile
app.put('/business/uploadprofilephoto',middlewareBusiness.requireAuthentication,function(request,response) {
    var businessId = request.business.get('id');
    var body = _.pick(request.body,'customerFirstName','customerLastName','companyName','isMale', 'phone' ,'img_url');

    db.business.findOne(
        {
            //where clause
            where: {
                id: businessId
            }
        }).then(function(business) {
            if(!business.businessId) {
                db.business.update(
                    //set values
                    {
                        img_url:body.img_url
                    },
                    // where clause
                    {
                        where: {
                            id : businessId
                        }
                    }).then(function() {
                        response.status(204).send();
                    });
            } else {
                response.status(404).send();
            }
        }, function(e) {
        response.status(500).send();
    });

});

// Register New deliveryman
app.post('/deliveryman/register', function(request, response) {

    var body = _.pick(request.body, "email", "deliverymanFullName", "isMale", "birthDate", "address", "phone", "password");
    body.totalWalkedDistance = 0.0;

    db.deliveryman.create(body).then(function(deliveryman) {
        response.json(deliveryman.toJSON());
    }, function(e) {
        response.status(400).json(e);
    });
});

// login deliveryman
app.post('/deliveryman/login', function(request, response) {
    var body = _.pick(request.body, 'email', 'password');
    var deliverymanInstance;

    db.deliveryman.authenticate(body).then(function(deliveryman) {
        var token = deliveryman.generateToken('authentication');
        deliverymanInstance = deliveryman;

        // console.log(deliveryman + " $$$$$ " + token);

        try {
            return db.deliverymantoken.create({
                token: token
            });
        } catch (e) {
            console.error(e);
        }

    }).then(function(tokenInstance) {
        response.header('Auth', tokenInstance.get('token')).json(deliverymanInstance.toPublicJSON());
    }).catch(function() {
        response.status(401).send();
    });

});

//deliveryman if this accessToken is exist in database
app.get('/deliveryman/checkAccessToken', middlewareDeliveryman.requireAuthentication, function(request, response) {

    var deliverymanId = request.deliveryman.get('id');

    db.deliveryman.findOne({
        where: {
            id: deliverymanId
        }
    }).then(function(deliveryman) {
        if (deliveryman) {
            response.json(deliveryman.toPublicJSON());
        } else {
            response.status(404).send();
        }
    })
});

//deliveryman Logging out
app.delete('/deliveryman/logout', middlewareDeliveryman.requireAuthentication, function(request, response) {
    request.deliverymantoken.destroy().then(function() {
        response.status(204).send();
    }).catch(function() {
        response.status(500).send();
    });
});

//deliveryman edit profile
app.put('/deliveryman/uploadprofilephoto',middlewareDeliveryman.requireAuthentication,function(request,response) {
    var deliverymanId = request.deliveryman.get('id');
    var body = _.pick(request.body,'img_url');

    db.deliveryman.findOne(
        {
            //where clause
            where: {
                id: deliverymanId
            }
        }).then(function(deliveryman) {
            if(!deliveryman.deliverymanId) {
                db.deliveryman.update(
                    //set values
                    {
                        img_url:body.img_url
                    },
                    // where clause
                    {
                        where: {
                            id : deliverymanId
                        }
                    }).then(function() {
                        response.status(204).send();
                    });
            } else {
                response.status(404).send();
            }
        }, function(e) {
        response.status(500).send();
    });

});

//business post an order
app.post('/business/order/add', middlewareBusiness.requireAuthentication, function(request, response) {
    var body = _.pick(request.body, "description", "lat_start", "lng_start", "lat_end", "lng_end", "distance", "duration");
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

//business get selected order
app.get('/business/order/:id', middlewareBusiness.requireAuthentication, function(request, response) {
    var orderId = parseInt(request.params.id, 10);

    var businessId = request.business.get('id');

    db.order.findOne({
        where: {
            id: orderId,
            businessId: businessId
        }
    }).then(function(order) {
        if (order) {
            response.json(order);
        } else {
            response.status(500).send();
        }
    })
});

//business see all of his history of new orders
app.get('/business/order/history/neworders', middlewareBusiness.requireAuthentication, function(request, response) {

    var where = {
        businessId: request.business.get('id'),
        order_status: "NEW"
    };

    db.order.findAll({
        where: where
    }).then(function(orders) {
        response.json(orders)
    }, function() {
        response.status(500).send();
    });
});

//business see all of his history of token orders
app.get('/business/order/history/tokenorders', middlewareBusiness.requireAuthentication, function(request, response) {

    var where = {
        businessId: request.business.get('id'),
        order_status: "TOKE"
    };

    db.order.findAll({
        where: where
    }).then(function(orders) {
        response.json(orders)
    }, function() {
        response.status(500).send();
    });
});

//business see all of his history of finished orders
app.get('/business/order/history/finishedorders', middlewareBusiness.requireAuthentication, function(request, response) {

    var where = {
        businessId: request.business.get('id'),
        order_status: "DONE"
    };

    db.order.findAll({
        where: where
    }).then(function(orders) {
        response.json(orders)
    }, function() {
        response.status(500).send();
    });
});

// deliveryman get avaliable orders
app.get('/AvaliableOrders', middlewareDeliveryman.requireAuthentication, function(request, response) {
    db.order.findAll({
        where: {
            order_status: "NEW"
        }
    }).then(function(order) {
        response.json(order);
    }, function(e) {
        response.status(500).send();
        console.log(e);
    });
});



//deliveryman take order (update)
app.put('/deliveryman/takeorder/:id', middlewareDeliveryman.requireAuthentication, function(request, response) {
    var orderId = parseInt(request.params.id, 10);

    var deliverymanId = request.deliveryman.get('id');

    db.order.findOne({
        where: {
            id: orderId
        }
    }).then(function(order) {
        if (!order.deliverymanId) {
            db.order.update(
                //set values
                {
                    deliverymanId: deliverymanId,
                    tokeAt: new Date(),
                    order_status: "TOKE"
                },
                // where clause
                {
                    where: {
                        id: orderId
                    }

                }).then(function() {
                response.status(204).send();
            });
        } else {
            response.status(404).send();

            // response.status(500).send();
        }
    })


});

//delivery get his token orders
app.get('/deliveryman/takeorder/', middlewareDeliveryman.requireAuthentication, function(request, response) {
    var deliverymanId = request.deliveryman.get('id');

    db.order.findAll({
        where: {
            order_status: "TOKE",
            deliverymanId: deliverymanId
        }
    }).then(function(order) {
        response.json(order);
    }, function(e) {
        response.status(500).send();
    });

});

//deliveryman get token order
app.get('/deliveryman/takeorder/:id', middlewareDeliveryman.requireAuthentication, function(request, response) {
    var orderId = parseInt(request.params.id, 10);

    var deliverymanId = request.deliveryman.get('id');

    db.order.findOne({
        where: {
            id: orderId,
            deliverymanId: deliverymanId,
            order_status: "TOKE"
        }
    }).then(function(order) {
        if (order) {
            response.json(order);
        } else {
            response.status(500).send();
        }
    })
});



//deliveryman finish the order
app.put('/deliveryman/finishorder/:id', middlewareDeliveryman.requireAuthentication, function(request, response) {
    var orderId = parseInt(request.params.id, 10);
    var deliverymanId = request.deliveryman.get('id');

    db.order.update(
        //set values
        {
            finishedAt: new Date(),
            order_status: "DONE"
        },
        // where clause
        {
            where: {
                deliverymanId: deliverymanId,
                id: orderId
            }

        }).then(function() {
        response.status(204).send();
    });
});

//deliveryman see all of his history
app.get('/deliveryman/finishorder/history', middlewareDeliveryman.requireAuthentication, function(request, response) {

    var where = {
        deliverymanId: request.deliveryman.get('id'),
        order_status: "DONE"
    };

    db.order.findAll({
        where: where
    }).then(function(orders) {
        response.json(orders)
    }, function() {
        response.status(500).send();
    });
});

//deliveryman get token order
app.get('/deliveryman/finishorder/history/:id', middlewareDeliveryman.requireAuthentication, function(request, response) {
    var orderId = parseInt(request.params.id, 10);

    var deliverymanId = request.deliveryman.get('id');

    db.order.findOne({
        where: {
            id: orderId,
            deliverymanId: deliverymanId,
            order_status: "DONE"
        }
    }).then(function(order) {
        if (order) {
            response.json(order);
        } else {
            response.status(500).send();
        }
    });
});

//update deliveryman location with the order
app.put('/order/orderlocation/:id',middlewareDeliveryman.requireAuthentication, function(request, response) {
    var orderId = parseInt(request.params.id, 10);
    var body = _.pick(request.body, "order_lat", "order_lng");
    body.orderId=orderId;

    var deliverymanId = request.deliveryman.get('id');

    db.order.update(
        //set values
        {
            order_lat: body.order_lat,
            order_lng: body.order_lng
        },
        // where clause
        {
            where: {
                deliverymanId: deliverymanId,
                id: orderId
            }

        }).then(function() {

            console.log(body.order_lat + " " + body.order_lng);

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