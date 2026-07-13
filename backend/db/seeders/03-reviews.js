'use strict';

const { Review } = require('../models');


let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await Review.bulkCreate([
      // Spot 1: Kabulonga Garden Cottage (owner 1)
      {
        userId: 2,
        spotId: 1,
        review: 'Peaceful stay, walking distance to Arcades Mall. Would book again!',
        stars: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: 5,
        spotId: 1,
        review: 'Lovely garden, host was quick to respond. Great for a quiet work trip.',
        stars: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Spot 2: Roma Executive Suite (owner 4)
      {
        userId: 1,
        spotId: 2,
        review: 'Ideal for a week of meetings in Lusaka — reliable power and fast wifi.',
        stars: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Spot 3: Victoria Falls View Lodge (owner 2)
      {
        userId: 3,
        spotId: 3,
        review: 'Incredible views of the Falls, host was very welcoming.',
        stars: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: 6,
        spotId: 3,
        review: 'Watched the sunset over the Zambezi from the veranda — unforgettable stay.',
        stars: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Spot 4: Maramba Riverside Guesthouse (owner 5) — no reviews yet, tests "New" rating state
      // Spot 5: Parklands Copperbelt Apartment (owner 3)
      {
        userId: 4,
        spotId: 5,
        review: 'Clean, secure, and close to everything in Kitwe.',
        stars: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: 2,
        spotId: 5,
        review: 'Great value stay, and the backup power was a lifesaver during load shedding.',
        stars: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Spot 6: Itawa Family Home (owner 6)
      {
        userId: 1,
        spotId: 6,
        review: 'Comfortable family home on a quiet street in Itawa.',
        stars: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Spot 7: Chingola Central Studio (owner 1) — no reviews yet, tests "New" rating state
      // Spot 8: Fairview Miners Cottage (owner 2)
      {
        userId: 5,
        spotId: 8,
        review: 'Simple and affordable, good base for a work trip to Mufulira.',
        stars: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: 3,
        spotId: 8,
        review: 'Borehole water was a nice touch — never worried about supply.',
        stars: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Spot 9: Roan Township Apartment (owner 3)
      {
        userId: 6,
        spotId: 9,
        review: 'Solid stay, backup power kept things running smoothly.',
        stars: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], { validate: true });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Reviews';
    await queryInterface.bulkDelete('Reviews', null, {});
  }
};
