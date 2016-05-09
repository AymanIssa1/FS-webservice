var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var sequelize;

console.log(process.env.DATABASE_URL);
console.log(process.env.NODE_ENV);

if (env === 'production') {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres'
  });
} else {
  sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': __dirname + '/data/felsekka.sqlite'
  });
}

var db = {};

db.businesstoken = sequelize.import(__dirname + '/models/businesstoken.js');
db.deliverymantoken = sequelize.import(__dirname + '/models/deliverymantoken.js');

db.business = sequelize.import(__dirname + '/models/business.js');
db.deliveryman = sequelize.import(__dirname + '/models/deliveryman.js');
db.order = sequelize.import(__dirname + '/models/order.js');


db.sequelize = sequelize;
db.Sequelize = Sequelize;


// relation between orders and (business , deliveryman)
//orders and business
db.order.belongsTo(db.business);
db.business.hasMany(db.order);

//order and deliveryman
db.order.belongsTo(db.deliveryman, {
  foreignKey: {
    allowNull: true
  }
});
db.deliveryman.hasMany(db.order, {
  foreignKey: {
    allowNull: true
  }
});


module.exports = db;