'use strict';

const { Experience } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await Experience.bulkCreate([
      {
        // experienceId 1
        providerId: 2,
        title: 'South Luangwa Walking Safari',
        description: 'A guided walking safari through South Luangwa National Park near Mfuwe, led by a licensed scout. Look out for elephant, leopard, and the park\'s famous thornicroft giraffe.',
        category: 'safari',
        city: 'Mfuwe',
        pricePerPerson: 180,
        durationHours: 4,
        previewImage: 'https://images.unsplash.com/photo-1532574754390-44dc5c6780bb?auto=format&fit=crop&w=800&q=80',
      },
      {
        // experienceId 2
        providerId: 5,
        title: 'Lower Zambezi Canoeing Safari',
        description: 'Paddle a stretch of the Lower Zambezi from Siavonga with a certified guide, spotting hippo pods and elephants drinking at the riverbank along the way.',
        category: 'water',
        city: 'Siavonga',
        pricePerPerson: 120,
        durationHours: 3,
        previewImage: 'https://images.unsplash.com/photo-1706007989994-7cc0c5a866af?auto=format&fit=crop&w=800&q=80',
      },
      {
        // experienceId 3
        providerId: 2,
        title: 'Victoria Falls & Livingstone Cultural Tour',
        description: 'A half-day walking tour combining the Zambian side of Victoria Falls with a visit to Livingstone\'s Mukuni Village to learn about Tonga and Leya heritage.',
        category: 'culture',
        city: 'Livingstone',
        pricePerPerson: 45,
        durationHours: 2.5,
        previewImage: 'https://images.unsplash.com/photo-1636783186942-188af7eb0ef5?auto=format&fit=crop&w=800&q=80',
      },
      {
        // experienceId 4
        providerId: 1,
        title: 'Lusaka Airport Transfer',
        description: 'Reliable, pre-booked transfer between Kenneth Kaunda International Airport and your accommodation in Lusaka, in an air-conditioned vehicle.',
        category: 'transport',
        city: 'Lusaka',
        pricePerPerson: 25,
        durationHours: 1,
        previewImage: 'https://images.unsplash.com/photo-1540066019607-e5f69323a8dc?auto=format&fit=crop&w=800&q=80',
      },
      {
        // experienceId 5
        providerId: 4,
        title: 'Private Nshima & Traditional Zambian Chef Experience',
        description: 'A private in-home cooking session covering nshima, ifisashi, and village chicken, followed by a shared meal — a hands-on introduction to Zambian home cooking.',
        category: 'chef',
        city: 'Lusaka',
        pricePerPerson: 60,
        durationHours: 2,
        previewImage: 'https://images.unsplash.com/photo-1593969430003-5dec7c7ee7df?auto=format&fit=crop&w=800&q=80',
      },
      {
        // experienceId 6
        providerId: 3,
        title: 'Lake Kariba Sunset Cruise',
        description: 'An evening cruise out of Siavonga on Lake Kariba, with drinks and snacks included, watching the sun set over Africa\'s largest reservoir.',
        category: 'water',
        city: 'Siavonga',
        pricePerPerson: 90,
        durationHours: 3,
        previewImage: 'https://images.unsplash.com/photo-1604064412467-af16406b5ba5?auto=format&fit=crop&w=800&q=80',
      },
      {
        // experienceId 7
        providerId: 3,
        title: 'Copperbelt Mining Heritage Tour',
        description: 'A guided tour through Kitwe covering the history of copper mining on the Copperbelt, including a stop at a mining heritage museum.',
        category: 'culture',
        city: 'Kitwe',
        pricePerPerson: 35,
        durationHours: 2,
        previewImage: 'https://images.unsplash.com/photo-1517089472343-85fc51aeb327?auto=format&fit=crop&w=800&q=80',
      },
      {
        // experienceId 8
        providerId: 6,
        title: 'Livingstone Town & Falls Shuttle',
        description: 'On-demand shuttle service around Livingstone town and to/from the Victoria Falls entrance, Zambezi riverfront lodges, and Livingstone Airport.',
        category: 'transport',
        city: 'Livingstone',
        pricePerPerson: 20,
        durationHours: 1,
        previewImage: 'https://images.unsplash.com/photo-1581706677636-f6630fd1edf8?auto=format&fit=crop&w=800&q=80',
      },
    ], { validate: true });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Experiences';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      title: {
        [Op.in]: [
          'South Luangwa Walking Safari',
          'Lower Zambezi Canoeing Safari',
          'Victoria Falls & Livingstone Cultural Tour',
          'Lusaka Airport Transfer',
          'Private Nshima & Traditional Zambian Chef Experience',
          'Lake Kariba Sunset Cruise',
          'Copperbelt Mining Heritage Tour',
          'Livingstone Town & Falls Shuttle',
        ]
      }
    }, {});
  }
};
