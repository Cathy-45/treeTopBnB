'use strict';
/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    options.tableName = 'ExperienceBookings';
    await queryInterface.addColumn(options, 'pawapayDepositId', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'ExperienceBookings';
    await queryInterface.removeColumn(options, 'pawapayDepositId');
  }
};
