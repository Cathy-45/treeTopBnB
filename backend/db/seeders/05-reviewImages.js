"use strict";

const { ReviewImage } = require("../models");

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await ReviewImage.bulkCreate(
      [
        {
          reviewId: 1,
          url: "https://www.stockvault.net/data/2020/01/18/272608/thumb16.jpg",
        },
        {
          reviewId: 2,
          url: "https://www.stockvault.net/data/2020/01/18/272608/thumb16.jpg",
        },
        {
          reviewId: 3,
          url: "https://www.stockvault.net/data/2020/01/18/272608/thumb16.jpg",
        },
      ],
      { validate: true }
    );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "ReviewImages";
    await queryInterface.bulkDelete("ReviewImages", null, {});
  },
};
