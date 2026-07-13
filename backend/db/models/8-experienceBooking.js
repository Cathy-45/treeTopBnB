"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ExperienceBooking extends Model {
    static associate(models) {
      ExperienceBooking.belongsTo(models.Experience, {
        foreignKey: "experienceId",
      });
      ExperienceBooking.belongsTo(models.User, {
        foreignKey: "userId",
      });
    }
  }

  ExperienceBooking.init(
    {
      experienceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isNotPast(value) {
            if (new Date(value) < new Date(new Date().toDateString())) {
              throw new Error("date cannot be in the past");
            }
          },
        },
      },
      guests: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 1,
        },
      },
      paymentMethod: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "mobile_money",
      },
      subtotal: DataTypes.DECIMAL,
      providerCommission: DataTypes.DECIMAL,
      providerPayout: DataTypes.DECIMAL,
      processingFee: DataTypes.DECIMAL,
      totalGuestCharge: DataTypes.DECIMAL,
      paymentStatus: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending',
      },
      flutterwaveTxRef: DataTypes.STRING,
      flutterwaveTransactionId: DataTypes.STRING,
      pawapayDepositId: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "ExperienceBooking",
    }
  );
  return ExperienceBooking;
};
