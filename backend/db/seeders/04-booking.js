'use strict';

const { Booking } = require('../models');


let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
module.exports = {
  async up(queryInterface, Sequelize) {
    const DAY = 24 * 60 * 60 * 1000;
    const now = new Date();

    await Booking.bulkCreate([
      {
        // past booking — spot 1 (Kabulonga, owner 1), guest 2
        spotId: 1,
        userId: 2,
        startDate: new Date(now.getTime() - 30 * DAY),
        endDate: new Date(now.getTime() - 26 * DAY),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        // current/ongoing booking — spot 2 (Roma, owner 4), guest 1
        spotId: 2,
        userId: 1,
        startDate: new Date(now.getTime() - 2 * DAY),
        endDate: new Date(now.getTime() + 3 * DAY),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        // future booking — spot 3 (Victoria Falls Lodge, owner 2), guest 3
        spotId: 3,
        userId: 3,
        startDate: new Date(now.getTime() + 20 * DAY),
        endDate: new Date(now.getTime() + 24 * DAY),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        // past booking — spot 5 (Parklands, owner 3), guest 4
        spotId: 5,
        userId: 4,
        startDate: new Date(now.getTime() - 58 * DAY),
        endDate: new Date(now.getTime() - 55 * DAY),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        // future booking — spot 8 (Fairview, owner 2), guest 5
        spotId: 8,
        userId: 5,
        startDate: new Date(now.getTime() + 50 * DAY),
        endDate: new Date(now.getTime() + 53 * DAY),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], { validate: true });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Bookings';
    await queryInterface.bulkDelete('Bookings', null, {});
  }
};
