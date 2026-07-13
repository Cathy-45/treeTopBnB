"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Experience extends Model {
    static associate(models) {
      Experience.belongsTo(models.User, {
        as: "Provider",
        foreignKey: "providerId",
        onDelete: "CASCADE",
      });
      Experience.hasMany(models.ExperienceBooking, {
        foreignKey: "experienceId",
        onDelete: "CASCADE",
      });
    }
  }

  Experience.init(
    {
      providerId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      title: {
        allowNull: false,
        type: DataTypes.STRING,
        validate: {
          len: [1, 100],
        },
      },
      description: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      category: {
        allowNull: false,
        type: DataTypes.STRING,
        validate: {
          isIn: [["safari", "water", "culture", "transport", "chef"]],
        },
      },
      city: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      pricePerPerson: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      durationHours: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      previewImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Experience",
    }
  );
  return Experience;
};
