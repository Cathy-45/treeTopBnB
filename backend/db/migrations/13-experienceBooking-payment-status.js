'use strict';
/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    options.tableName = 'ExperienceBookings';
    await queryInterface.addColumn(options, 'paymentStatus', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'pending',
    });
    await queryInterface.addColumn(options, 'flutterwaveTxRef', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn(options, 'flutterwaveTransactionId', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'ExperienceBookings';
    await queryInterface.removeColumn(options, 'paymentStatus');
    await queryInterface.removeColumn(options, 'flutterwaveTxRef');
    await queryInterface.removeColumn(options, 'flutterwaveTransactionId');
  }
};
