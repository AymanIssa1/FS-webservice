var cryptojs = require('crypto-js');

module.exports = function(db) {

    return {
        requireAuthentication: function(request, response, next) {
            var deliverymantoken = request.get('Auth');

            db.deliverymantoken.findOne({
                where: {
                    tokenHash: cryptojs.MD5(deliverymantoken).toString()
                }
            }).then(function(tokenInstance) {
                if (!tokenInstance) {
                    throw new Error();
                }

                request.token = tokenInstance;
                return db.deliveryman.findByToken(deliverymantoken);
            }).then(function(deliveryman) {
                request.deliveryman = deliveryman;
                next();
            }).catch(function() {
                response.status(401).send();
            });
        }
    }
}