'use strict';

const { SpotImage } = require('../models');


let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

// Generic placeholder photos (Lorem Picsum, seeded so each listing gets a
// stable-but-distinct set) — real property photos should replace these once
// hosts start uploading their own.
const photoSeeds = [
  ['kabulonga1', 'kabulonga2', 'kabulonga3'],
  ['roma1', 'roma2', 'roma3'],
  ['vicfalls1', 'vicfalls2', 'vicfalls3'],
  ['maramba1', 'maramba2', 'maramba3'],
  ['parklands1', 'parklands2', 'parklands3'],
  ['itawa1', 'itawa2', 'itawa3'],
  ['chingola1', 'chingola2', 'chingola3'],
  ['fairview1', 'fairview2', 'fairview3'],
  ['roan1', 'roan2', 'roan3'],
];

const images = [];
photoSeeds.forEach((seeds, spotIndex) => {
  const spotId = spotIndex + 1;
  seeds.forEach((seed, i) => {
    images.push({
      spotId,
      url: `https://picsum.photos/seed/${seed}/800/600`,
      preview: i === 0,
    });
  });
});

module.exports = {
  async up(queryInterface, Sequelize) {
    await SpotImage.bulkCreate(images, { validate: true });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'SpotImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      spotId: { [Op.in]: [1, 2, 3, 4, 5, 6, 7, 8, 9] }
    }, {});
  }
};
