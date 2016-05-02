var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var sequelize;

console.log(process.env.DATABASE_URL);
console.log(process.env.NODE_ENV);

if (env === 'production') {
// if (env === process.env.NODE_ENV) {


  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres'
  });

  // if (process.env.DATABASE_URL) {
  //   // the application is executed on Heroku ... use the postgres database
  //   sequelize = new Sequelize(process.env.DATABASE_URL, {
  //     dialect:  'postgres',
  //     protocol: 'postgres',
  //     logging:  true //false
  //   });
} else {
  sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': __dirname + '/data/felsekka.sqlite'
  });
}

var db = {};

db.customertoken = sequelize.import(__dirname + '/models/customertoken.js');
db.employeetoken = sequelize.import(__dirname + '/models/employeetoken.js');

db.customer = sequelize.import(__dirname + '/models/customer.js');
db.customeraddress = sequelize.import(__dirname + '/models/customeraddress.js');

db.service = sequelize.import(__dirname + '/models/service.js');
db.employee = sequelize.import(__dirname + '/models/employee.js');


db.order = sequelize.import(__dirname + '/models/order.js');


db.sequelize = sequelize;
db.Sequelize = Sequelize;



//customers and customerAddress relationship
db.customeraddress.belongsTo(db.customer);
db.customer.hasMany(db.customeraddress);

//relation between services and employees
db.employee.belongsTo(db.service, {
  foreignKey: {
    allowNull: false
  }
});
db.service.hasMany(db.employee, {
  foreignKey: {
    allowNull: false
  }
});

// relation between orders and (customer , customerAddress , service , employee)
//orders and customer
db.order.belongsTo(db.customer);
db.customer.hasMany(db.order);
//order and customerAddress
db.order.belongsTo(db.customeraddress);
db.customeraddress.hasMany(db.order);
//order and service
db.order.belongsTo(db.service);
db.service.hasMany(db.order);
//order and service
db.order.belongsTo(db.employee, {
  foreignKey: {
    allowNull: true
  }
});
db.employee.hasMany(db.order, {
  foreignKey: {
    allowNull: true
  }
});


module.exports = db;