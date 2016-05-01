var cryptojs = require('crypto-js');

module.exports = function(db) {

    return {
        requireEmployeeAuthentication: function(request, response, next) {
            var employeetoken = request.get('Auth');

            db.employeetoken.findOne({
                where: {
                    tokenHash: cryptojs.MD5(employeetoken).toString()
                }
            }).then(function(tokenInstance) {
                if (!tokenInstance) {
                    throw new Error();
                }

                request.token = tokenInstance;
                return db.employee.findByToken(employeetoken);
            }).then(function(employee) {
                request.employee = employee;
                next();
            }).catch(function() {
                response.status(401).send();
            });
        }
    }
}