var cryptojs = require('crypto-js');

module.exports = function(db) {

    return {
        requireAuthentication: function(request, response, next) {
            var token = request.get('Auth');

            db.businesstoken.findOne({
                where: {
                    tokenHash: cryptojs.MD5(token).toString()
                }
            }).then(function(tokenInstance) {
                if (!tokenInstance) {
                    throw new Error();
                }
                console.log("@@@@@@@@@@@@@@@@@@@@@@ first " + tokenInstance);
                request.token = tokenInstance;
                return db.business.findByToken(token);
            }).then(function(business) {
                console.log("@@@@@@@@@@@@@@@@@@@@@@ second " + business);

                request.business = business;
                next();
            }).catch(function() {
                response.status(401).send();
            });
        }
    }
}