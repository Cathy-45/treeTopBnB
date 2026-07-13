'use strict';
/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    options.tableName = 'Bookings';
    await queryInterface.addColumn(options, 'paymentMethod', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'mobile_money',
    });
    await queryInterface.addColumn(options, 'subtotal', {
      type: Sequelize.DECIMAL,
      allowNull: true,
    });
    await queryInterface.addColumn(options, 'hostCommission', {
      type: Sequelize.DECIMAL,
      allowNull: true,
    });
    await queryInterface.addColumn(options, 'hostPayout', {
      type: Sequelize.DECIMAL,
      allowNull: true,
    });
    await queryInterface.addColumn(options, 'guestServiceFee', {
      type: Sequelize.DECIMAL,
      allowNull: true,
    });
    await queryInterface.addColumn(options, 'processingFee', {
      type: Sequelize.DECIMAL,
      allowNull: true,
    });
    await queryInterface.addColumn(options, 'totalGuestCharge', {
      type: Sequelize.DECIMAL,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Bookings';
    await queryInterface.removeColumn(options, 'paymentMethod');
    await queryInterface.removeColumn(options, 'subtotal');
    await queryInterface.removeColumn(options, 'hostCommission');
    await queryInterface.removeColumn(options, 'hostPayout');
    await queryInterface.removeColumn(options, 'guestServiceFee');
    await queryInterface.removeColumn(options, 'processingFee');
    await queryInterface.removeColumn(options, 'totalGuestCharge');
  }
};
