'use strict';

const { Spot } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await Spot.bulkCreate([
      {
        // spotId 1
        ownerId: 1,
        address: "14 Kabulonga Road",
        city: "Lusaka",
        state: "Lusaka",
        country: "Zambia",
        lat: -15.3875,
        lng: 28.3228,
        name: "Kabulonga Garden Cottage",
        description: "A quiet, self-contained cottage in leafy Kabulonga, minutes from Arcades Mall and East Park. A great base for business trips or a weekend in the capital.",
        price: 450,
        solarPower: true,
        boreholeWater: false,
        backupPower: true,
        securityVerified: true,
      },
      {
        // spotId 2
        ownerId: 4,
        address: "22 Zambezi Road",
        city: "Lusaka",
        state: "Lusaka",
        country: "Zambia",
        lat: -15.3961,
        lng: 28.3350,
        name: "Roma Executive Suite",
        description: "A serviced one-bedroom suite in Roma aimed at business travelers — fast wifi, a proper desk, and a generator that kicks in automatically during load shedding.",
        price: 650,
        solarPower: false,
        boreholeWater: false,
        backupPower: true,
        securityVerified: true,
        weeklyDiscountPercent: 15,
        monthlyDiscountPercent: 30,
      },
      {
        // spotId 3
        ownerId: 2,
        address: "Mosi-oa-Tunya Road",
        city: "Livingstone",
        state: "Southern",
        country: "Zambia",
        lat: -17.8419,
        lng: 25.8543,
        name: "Victoria Falls View Lodge",
        description: "Wake up to the sound of the Zambezi. A short drive from Victoria Falls and Mosi-oa-Tunya National Park, with a private veranda and braai area.",
        price: 850,
        solarPower: true,
        boreholeWater: true,
        backupPower: true,
        securityVerified: true,
      },
      {
        // spotId 4
        ownerId: 5,
        address: "Maramba",
        city: "Livingstone",
        state: "Southern",
        country: "Zambia",
        lat: -17.8600,
        lng: 25.8700,
        name: "Maramba Riverside Guesthouse",
        description: "A simple, budget-friendly guesthouse in Maramba, a short hop from the town centre. Good option for backpackers and independent travelers exploring Livingstone.",
        price: 380,
        solarPower: false,
        boreholeWater: true,
        backupPower: false,
        securityVerified: false,
      },
      {
        // spotId 5
        ownerId: 3,
        address: "Parklands",
        city: "Kitwe",
        state: "Copperbelt",
        country: "Zambia",
        lat: -12.8024,
        lng: 28.2132,
        name: "Parklands Copperbelt Apartment",
        description: "Modern one-bedroom apartment in Kitwe's Parklands suburb, close to Mukuba Mall and the city centre. Secure parking and backup power included.",
        price: 320,
        solarPower: false,
        boreholeWater: false,
        backupPower: true,
        securityVerified: true,
      },
      {
        // spotId 6
        ownerId: 6,
        address: "Itawa",
        city: "Ndola",
        state: "Copperbelt",
        country: "Zambia",
        lat: -12.9587,
        lng: 28.6366,
        name: "Itawa Family Home",
        description: "A quiet three-bedroom home in Ndola's leafy Itawa neighborhood, well suited to families or groups visiting the Copperbelt.",
        price: 300,
        solarPower: true,
        boreholeWater: false,
        backupPower: false,
        securityVerified: true,
        weeklyDiscountPercent: 10,
        monthlyDiscountPercent: 25,
      },
      {
        // spotId 7
        ownerId: 1,
        address: "Chingola Central",
        city: "Chingola",
        state: "Copperbelt",
        country: "Zambia",
        lat: -12.5289,
        lng: 27.8493,
        name: "Chingola Central Studio",
        description: "An affordable, no-frills studio right in the heart of Chingola — walkable to shops and the market.",
        price: 220,
        solarPower: false,
        boreholeWater: false,
        backupPower: false,
        securityVerified: false,
      },
      {
        // spotId 8
        ownerId: 2,
        address: "Fairview",
        city: "Mufulira",
        state: "Copperbelt",
        country: "Zambia",
        lat: -12.5493,
        lng: 28.2402,
        name: "Fairview Miners Cottage",
        description: "A cosy cottage in Mufulira's Fairview suburb with its own borehole and backup power, well suited to longer work stays on the mines.",
        price: 260,
        solarPower: false,
        boreholeWater: true,
        backupPower: true,
        securityVerified: false,
        weeklyDiscountPercent: 10,
        monthlyDiscountPercent: 20,
      },
      {
        // spotId 9
        ownerId: 3,
        address: "Roan Township",
        city: "Luanshya",
        state: "Copperbelt",
        country: "Zambia",
        lat: -13.1379,
        lng: 28.4162,
        name: "Roan Township Apartment",
        description: "A bright one-bedroom apartment in Luanshya's Roan township, with solar-assisted power and easy access to the town centre.",
        price: 240,
        solarPower: true,
        boreholeWater: false,
        backupPower: true,
        securityVerified: false,
      }
    ], { validate: true });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Spots';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      name: {
        [Op.in]: [
          'Kabulonga Garden Cottage',
          'Roma Executive Suite',
          'Victoria Falls View Lodge',
          'Maramba Riverside Guesthouse',
          'Parklands Copperbelt Apartment',
          'Itawa Family Home',
          'Chingola Central Studio',
          'Fairview Miners Cottage',
          'Roan Township Apartment',
        ]
      }
    }, {});
  }
};
