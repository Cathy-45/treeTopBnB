const express = require("express");

const { restoreUser, requireAuth } = require("../../utils/auth");
const { Spot, Booking, User } = require("../../db/models");
const { EmptyResultError } = require("sequelize");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");
const { calculateBookingPrice } = require("../../utils/pricing");
const router = express.Router();

const validateBooking = [
    check('startDate')
      // .isISO8601().withMessage('startDate must be a valid date')
      .custom(value => {
        if (new Date(value) < new Date()) {
          throw new Error('startDate cannot be in the past');
        }
        return true;
      }),
    check('endDate')
      // .isISO8601().withMessage('endDate must be a valid date')
      .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.startDate)) {
          throw new Error('endDate cannot be on or before startDate');
        }
        return true;
      }),
  handleValidationErrors
];

const validateBookingId = (req, res, next) => {
  const { bookingId } = req.params;
  if (!Number.isInteger(Number(bookingId))) {
      return res.status(400).json({
          message: "Validation error",
          errors: { id: "bookingId must be a valid integer" },
      });
  }
  next();
};


  router.get("/current", requireAuth, async (req, res, next) => {
    try {


      const allBookings = await Booking.findAll({
        where: {
          userId: req.user.id
        },
        include:{
            model: Spot
        }
      });
      let allBookingsData = allBookings.map(booking => booking.toJSON());
      let correctBookingsData= allBookingsData.map(booking => ({
        id: booking.id,
        spotId: booking.spotId,
        Spot: booking.Spot,
        userId: booking.userId,
        startDate: booking.startDate,
        endDate: booking.endDate,
        paymentMethod: booking.paymentMethod,
        subtotal: booking.subtotal,
        hostCommission: booking.hostCommission,
        hostPayout: booking.hostPayout,
        guestServiceFee: booking.guestServiceFee,
        processingFee: booking.processingFee,
        totalGuestCharge: booking.totalGuestCharge,
        paymentStatus: booking.paymentStatus,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      }))
      res.json(correctBookingsData);
    } catch (e) {
      next(e);
    }
  });



router.put("/:bookingId", validateBooking, validateBookingId, requireAuth, async(req, res, next) => {
    try {
        const { bookingId } = req.params;
        const { startDate, endDate } = req.body;

        const booking = await Booking.findByPk(bookingId);
        if (!booking) {
          return res.status(404).json({ message: "Booking couldn't be found" });
        }

        if (booking.userId !== req.user.id) {
          return res.status(403).json({ message: "Forbidden" });
        }

        if (new Date(booking.endDate) < new Date()) {
          return res.status(403).json({ message: "Past bookings can't be modified" });
        }

        const spotId = booking.spotId;
        const spot = await Spot.findByPk(spotId);

        const nights = Math.max(
          1,
          Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
        );
        const pricing = spot
          ? calculateBookingPrice(Number(spot.price), nights, booking.paymentMethod, {
              weeklyDiscountPercent: spot.weeklyDiscountPercent,
              monthlyDiscountPercent: spot.monthlyDiscountPercent,
            })
          : null;

        const newBooking = await booking.update({
          spotId,
          userId: req.user.id,
          startDate,
          endDate,
          ...(pricing && {
            subtotal: pricing.subtotal,
            hostCommission: pricing.hostCommission,
            hostPayout: pricing.hostPayout,
            guestServiceFee: pricing.guestServiceFee,
            processingFee: pricing.processingFee,
            totalGuestCharge: pricing.totalGuestCharge,
          }),
        });

        return res.status(200).json({
          id: newBooking.id,
          spotId: Number(newBooking.spotId),
          userId: req.user.id,
          startDate: newBooking.startDate,
          endDate: newBooking.endDate,
          paymentMethod: newBooking.paymentMethod,
          subtotal: newBooking.subtotal,
          hostCommission: newBooking.hostCommission,
          hostPayout: newBooking.hostPayout,
          guestServiceFee: newBooking.guestServiceFee,
          processingFee: newBooking.processingFee,
          totalGuestCharge: newBooking.totalGuestCharge,
          createdAt: newBooking.createdAt,
          updatedAt: newBooking.updatedAt,


        });
      } catch (e) {
        next(e);
      }

})

router.delete("/:bookingId", requireAuth, validateBookingId, async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
        return res.status(404).json({ message: "Booking couldn't be found" });
    }

    const spot = await Spot.findByPk(booking.spotId);
    const isBookingOwner = booking.userId === req.user.id;
    const isSpotOwner = spot && spot.ownerId === req.user.id;

    if (!isBookingOwner && !isSpotOwner) {
        return res.status(403).json({ message: "Forbidden" });
    }

    if (new Date(booking.startDate) <= new Date()) {
        return res.status(403).json({ message: "Bookings that have been started can't be deleted" });
    }

        await booking.destroy();
        return res.status(200).json({ message: "Successfully deleted" });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
