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

db.businesstoken = sequelize.import(__dirname + '/models/businesstoken.js');
db.employeetoken = sequelize.import(__dirname + '/models/employeetoken.js');

db.business = sequelize.import(__dirname + '/models/business.js');
db.employee = sequelize.import(__dirname + '/models/employee.js');
db.order = sequelize.import(__dirname + '/models/order.js');


db.sequelize = sequelize;
db.Sequelize = Sequelize;


// relation between orders and (business , employee)
//orders and business
db.order.belongsTo(db.business);
db.business.hasMany(db.order);

//order and employee
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