'use strict';
/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    options.tableName = 'Spots';
    await queryInterface.addColumn(options, 'weeklyDiscountPercent', {
      type: Sequelize.DECIMAL,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn(options, 'monthlyDiscountPercent', {
      type: Sequelize.DECIMAL,
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Spots';
    await queryInterface.removeColumn(options, 'weeklyDiscountPercent');
    await queryInterface.removeColumn(options, 'monthlyDiscountPercent');
  }
};
