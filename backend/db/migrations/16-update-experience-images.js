'use strict';
/** @type {import('sequelize-cli').Migration} */

// Swaps the placeholder Lorem Picsum images (random, unrelated photos - a
// strawberries close-up ended up on a private chef listing, the Golden Gate
// Bridge on a cultural tour, etc.) for themed, real, license-clear photos
// from Unsplash (free for commercial use, no attribution required) that
// actually match each experience. Matched by title since Experience rows
// were seeded before this ran, so ids may already exist.

const IMAGE_UPDATES = [
  {
    title: 'South Luangwa Walking Safari',
    // Giraffe at sunset, Serengeti, Tanzania - unsplash.com/photos/fzsJesR92jE
    previewImage: 'https://images.unsplash.com/photo-1532574754390-44dc5c6780bb?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Lower Zambezi Canoeing Safari',
    // Elephants crossing a river at a safari lodge, Botswana - unsplash.com/photos/GZPdqDRvilI
    previewImage: 'https://images.unsplash.com/photo-1706007989994-7cc0c5a866af?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Victoria Falls & Livingstone Cultural Tour',
    // Aerial view of a township, Ghana - unsplash.com/photos/VY5Gpwyl8O4
    previewImage: 'https://images.unsplash.com/photo-1636783186942-188af7eb0ef5?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Lusaka Airport Transfer',
    // Sedan parked curbside - unsplash.com/photos/v-QQ5EBf_bY
    previewImage: 'https://images.unsplash.com/photo-1540066019607-e5f69323a8dc?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Private Nshima & Traditional Zambian Chef Experience',
    // Pot cooking over an open wood fire - unsplash.com/photos/oyzJgT2oU2o
    previewImage: 'https://images.unsplash.com/photo-1593969430003-5dec7c7ee7df?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Lake Kariba Sunset Cruise',
    // Silhouette of a boat on the water at sunset - unsplash.com/photos/nY_R3NZKM38
    previewImage: 'https://images.unsplash.com/photo-1604064412467-af16406b5ba5?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Copperbelt Mining Heritage Tour',
    // Aerial view of heavy equipment on a mining site - unsplash.com/photos/89hUOLtVfoI
    previewImage: 'https://images.unsplash.com/photo-1517089472343-85fc51aeb327?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Livingstone Town & Falls Shuttle',
    // White van on the road near water, South Africa - unsplash.com/photos/x6yBJhwphTw
    previewImage: 'https://images.unsplash.com/photo-1581706677636-f6630fd1edf8?auto=format&fit=crop&w=800&q=80',
  },
];

const OLD_IMAGES = {
  'South Luangwa Walking Safari': 'https://picsum.photos/seed/luangwasafari/800/600',
  'Lower Zambezi Canoeing Safari': 'https://picsum.photos/seed/zambezicanoe/800/600',
  'Victoria Falls & Livingstone Cultural Tour': 'https://picsum.photos/seed/vicfallstour/800/600',
  'Lusaka Airport Transfer': 'https://picsum.photos/seed/lusakatransfer/800/600',
  'Private Nshima & Traditional Zambian Chef Experience': 'https://picsum.photos/seed/nshimachef/800/600',
  'Lake Kariba Sunset Cruise': 'https://picsum.photos/seed/karibacruise/800/600',
  'Copperbelt Mining Heritage Tour': 'https://picsum.photos/seed/miningheritage/800/600',
  'Livingstone Town & Falls Shuttle': 'https://picsum.photos/seed/livingstoneshuttle/800/600',
};

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    options.tableName = 'Experiences';
    for (const { title, previewImage } of IMAGE_UPDATES) {
      await queryInterface.bulkUpdate(options, { previewImage }, { title });
    }
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Experiences';
    for (const [title, previewImage] of Object.entries(OLD_IMAGES)) {
      await queryInterface.bulkUpdate(options, { previewImage }, { title });
    }
  },
};
