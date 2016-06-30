'use strict';


module.exports = {
  up: function(queryInterface, Sequelize) {
    queryInterface.addColumn(
        'orders',
        'order_lat',
        Sequelize.DOUBLE
      
    ), 
    
    queryInterface.addColumn(
        'orders',
        'order_lng',
        Sequelize.DOUBLE
    ) 
    
  },
 
  down: function(queryInterface, Sequelize) {
    // logic for reverting the changes
  }
}

