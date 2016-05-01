var cryptojs = require('crypto-js');

module.exports = function(db) {

    return {
        requireAuthentication: function(request, response, next) {
            var token = request.get('Auth');

            db.customertoken.findOne({
                where: {
                    tokenHash: cryptojs.MD5(token).toString()
                }
            }).then(function(tokenInstance) {
                if (!tokenInstance) {
                    throw new Error();
                }

                request.token = tokenInstance;
                return db.customer.findByToken(token);
            }).then(function(customer) {
                request.customer = customer;
                next();
            }).catch(function() {
                response.status(401).send();
            });
        }
    }
}