const express = require("express");

const {
  restoreUser,
  requireAuth,
  setTokenCookie,
} = require("../../utils/auth");
const {
  Spot,
  SpotImage,
  Review,
  Booking,
  ReviewImage,
  User,
  Owner,
} = require("../../db/models");
const { EmptyResultError, Op } = require("sequelize");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");
const router = express.Router();

const bcrypt = require("bcryptjs");

const validateSpot = [
  check("address").notEmpty().withMessage("Address is required"),
  check("city").notEmpty().withMessage("City is required"),
  check("state").notEmpty().withMessage("State is required"),
  check("country").notEmpty().withMessage("Country is required"),
  check("lat")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),
  check("lng")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),
  check("name")
    .isLength({ max: 50 })
    .withMessage("Name must be 50 characters or less"),
  check("name").notEmpty().withMessage("Name is required"),
  check("description").notEmpty().withMessage("Description is required"),
  check("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  handleValidationErrors,
];

const validateSpotId = (req, res, next) => {
  const { spotId } = req.params;
  if (!Number.isInteger(Number(spotId))) {
    return res.status(400).json({
      message: "Validation error",
      errors: { id: "spotId must be a valid integer" },
    });
  }
  next();
};

router.get("/", async (req, res, next) => {
  try {
    let { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } =
      req.query;

    const errors = {};

    page = page === undefined ? 1 : Number(page);
    size = size === undefined ? 20 : Number(size);

    if (!Number.isInteger(page) || page < 1) {
      errors.page = "Page must be greater than or equal to 1";
    }
    if (!Number.isInteger(size) || size < 1 || size > 20) {
      errors.size = "Size must be between 1 and 20";
    }

    const where = {};
    if (minLat !== undefined || maxLat !== undefined) {
      where.lat = {};
      if (minLat !== undefined) {
        const v = Number(minLat);
        if (Number.isNaN(v) || v < -90 || v > 90) errors.minLat = "Minimum latitude is invalid";
        else where.lat[Op.gte] = v;
      }
      if (maxLat !== undefined) {
        const v = Number(maxLat);
        if (Number.isNaN(v) || v < -90 || v > 90) errors.maxLat = "Maximum latitude is invalid";
        else where.lat[Op.lte] = v;
      }
    }
    if (minLng !== undefined || maxLng !== undefined) {
      where.lng = {};
      if (minLng !== undefined) {
        const v = Number(minLng);
        if (Number.isNaN(v) || v < -180 || v > 180) errors.minLng = "Minimum longitude is invalid";
        else where.lng[Op.gte] = v;
      }
      if (maxLng !== undefined) {
        const v = Number(maxLng);
        if (Number.isNaN(v) || v < -180 || v > 180) errors.maxLng = "Maximum longitude is invalid";
        else where.lng[Op.lte] = v;
      }
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        const v = Number(minPrice);
        if (Number.isNaN(v) || v < 0) errors.minPrice = "Minimum price must be greater than or equal to 0";
        else where.price[Op.gte] = v;
      }
      if (maxPrice !== undefined) {
        const v = Number(maxPrice);
        if (Number.isNaN(v) || v < 0) errors.maxPrice = "Maximum price must be greater than or equal to 0";
        else where.price[Op.lte] = v;
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: "Bad Request", errors });
    }

    const allSpots = await Spot.findAll({
      where,
      include: [{ model: Review }, { model: SpotImage }],
      limit: size,
      offset: size * (page - 1),
    });
    const formattedSpots = allSpots.map((spot) => {
      const totalStars = spot.Reviews.reduce(
        (sum, review) => sum + review.stars,
        0
      );
      const avgRating =
        spot.Reviews.length > 0 ? totalStars / spot.Reviews.length : null;
      const previewImage =
        spot.SpotImages.find((image) => image.preview)?.url || null;

      return {
        id: spot.id,
        ownerId: spot.ownerId,
        address: spot.address,
        city: spot.city,
        state: spot.state,
        country: spot.country,
        lat: spot.lat,
        lng: spot.lng,
        name: spot.name,
        description: spot.description,
        price: spot.price,
        createdAt: spot.createdAt,
        updatedAt: spot.updatedAt,
        avgRating,
        previewImage,
      };
    });

    res.json({ Spots: formattedSpots, page, size });
  } catch (e) {
    next(e);
  }
});

router.get("/current", requireAuth, async (req, res, next) => {
  try {
    if (!req.user.id) {
      const userError = new Error("User must be signed in");
      userError.status = 403;
      throw userError;
    }
    const oneSpot = await Spot.findAll({
      where: {
        ownerId: req.user.id,
      },
    });
    res.json(oneSpot);
  } catch (e) {
    next(e);
  }
});

router.get("/:spotId", validateSpotId, async (req, res, next) => {
  let accumulator = 0;
  try {
    const oneSpotReviews = await Review.findAll({
      where: {
        spotId: req.params.spotId,
      },
    });
    oneSpotReviews.forEach((element) => {
      accumulator += Number(element.stars);
    });
    let avgReviewRating =
      oneSpotReviews.length > 0 ? accumulator / oneSpotReviews.length : null;

    const oneSpot = await Spot.findOne({
      where: {
        id: req.params.spotId,
      },
      include: [
        {
          model: SpotImage,
        },
        {
          model: User,
          as: "Owner",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
    });

    if (!oneSpot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    let numReviews = oneSpotReviews.length;
    let spotData = oneSpot.toJSON();
    spotData.numReviews = numReviews;
    spotData.avgStarRating = avgReviewRating;
    let correctSpotData = {
      id: spotData.id,
      ownerId: spotData.ownerId,
      address: spotData.address,
      city: spotData.city,
      state: spotData.state,
      country: spotData.country,
      lat: spotData.lat,
      lng: spotData.lng,
      name: spotData.name,
      description: spotData.description,
      price: spotData.price,
      createdAt: spotData.createdAt,
      updatedAt: spotData.updatedAt,
      numReviews: numReviews,
      avgStarRating: avgReviewRating,
      SpotImages: spotData.SpotImages,
      Owner: spotData.Owner,
    };

    res.json(correctSpotData);
  } catch (e) {
    next(e);
  }
});

router.get("/:spotId/reviews", validateSpotId, async (req, res, next) => {
  try {
    const oneSpotReviews = await Review.findAll({
      where: {
        spotId: req.params.spotId,
      },
      include: [
        { model: User, attributes: ["id", "firstName", "lastName"] },
        { model: ReviewImage },
      ],
    });
    // if(oneSpotReviews.length===0){
    //   return res.status(200).json({ message: "Spot couldn't be found" });
    // }
    res.json(oneSpotReviews);
  } catch (e) {
    next(e);
  }
});

router.get("/:spotId/bookings", requireAuth, async (req, res, next) => {
  const { spotId } = req.params;

  try {
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    const allBookings = await Booking.findAll({
      where: {
        spotId: spotId,
      },
    });

    const allBookingsIfOwner = await Booking.findAll({
      where: {
        spotId: spotId,
        userId: req.user.id,
      },
      include: {
        model: User,
      },
    });

    if (allBookingsIfOwner.length === 0) {
      const allBookingsDataNotOwner = allBookings.map((element) => {
        return {
          spotId: element.spotId,
          startDate: element.startDate,
          endDate: element.endDate,
        };
      });
      return res.status(200).json(allBookingsDataNotOwner);
    }

    const allBookingDataIfOwner = allBookingsIfOwner.map((element) => {
      return {
        User: {
          id: element.User.id,
          firstName: element.User.firstName,
          lastName: element.User.lastName,
        },
        id: element.id,
        spotId: element.spotId,
        userId: element.userId,
        startDate: element.startDate,
        endDate: element.endDate,
        createdAt: element.createdAt,
        updatedAt: element.updatedAt,
      };
    });

    return res.status(200).json(allBookingDataIfOwner);
  } catch (e) {
    next(e);
  }
});

router.post("/", requireAuth, validateSpot, async (req, res, next) => {
  try {
    router.use(requireAuth);
    const {
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
    } = req.body;

    const ownerId = req.user.id;

    const spot = await Spot.create({
      ownerId,
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
    });

    return res.status(201).json({
      id: spot.id,
      ownerId: ownerId,
      address: address,
      city: city,
      state: state,
      country: country,
      lat: lat,
      lng: lng,
      name: name,
      description: description,
      price: price,
      createdAt: spot.createdAt,
      updatedAt: spot.updatedAt,
    });
  } catch (e) {
    next(e);
  }
});

router.post(
  "/:spotId/images",
  requireAuth,
  validateSpotId,
  async (req, res, next) => {
    try {
      const { spotId } = req.params;
      const { url, preview } = req.body;

      const spot = await Spot.findByPk(spotId);
      if (!spot) {
        return res.status(404).json({ message: "Spot couldn't be found" });
      }

      if (spot.ownerId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const newImage = await SpotImage.create({
        spotId,
        url,
        preview,
      });

      return res.status(200).json({
        id: newImage.id,
        url: newImage.url,
        preview: newImage.preview,
      });
    } catch (e) {
      next(e);
    }
  }
);

router.put(
  "/:spotId",
  requireAuth,
  validateSpot,
  validateSpotId,
  async (req, res, next) => {
    const { spotId } = req.params;
    const {
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
    } = req.body;

    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    if (spot.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    try {
      await spot.update({
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        description,
        price,
      });

      return res.status(200).json({
        id: spot.id,
        ownerId: spot.ownerId,
        address: spot.address,
        city: spot.city,
        state: spot.state,
        country: spot.country,
        lat: spot.lat,
        lng: spot.lng,
        name: spot.name,
        description: spot.description,
        price: spot.price,
        createdAt: spot.createdAt,
        updatedAt: spot.updatedAt,
      });
    } catch (e) {
      next(e);
    }
  }
);

router.delete(
  "/:spotId",
  requireAuth,
  validateSpotId,
  async (req, res, next) => {
    const { spotId } = req.params;
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    if (spot.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    try {
      await spot.destroy();
      return res.status(200).json({ message: "Successfully deleted" });
    } catch (e) {
      next(e);
    }
  }
);

const validateReviews = [
  check("review").notEmpty().withMessage("Review text is required"),
  check("stars").isInt({ min: 1, max: 5 }),
  handleValidationErrors,
];

const validateBooking = [
  check("startDate").custom((value) => {
    if (new Date(value) < new Date()) {
      throw new Error("startDate cannot be in the past");
    }
    return true;
  }),
  check("endDate").custom((value, { req }) => {
    if (new Date(value) <= new Date(req.body.startDate)) {
      throw new Error("endDate cannot be on or before startDate");
    }
    return true;
  }),
  handleValidationErrors,
];

router.post(
  "/:spotId/reviews",
  validateSpotId,
  validateReviews,
  requireAuth,
  async (req, res, next) => {
    try {
      const { spotId } = req.params;
      const { review, stars } = req.body;
      const userReview = await Review.findOne({
        where: {
          userId: req.user.id,
          spotId: spotId,
        },
      });
      if (userReview) {
        return res
          .status(500)
          .json({ message: "User already has a review for this spot" });
      }

      const spot = await Spot.findByPk(spotId);
      if (!spot) {
        return res.status(404).json({ message: "Spot couldn't be found" });
      }

      const newReview = await Review.create({
        spotId,
        review,
        stars,
        userId: req.user.id,
      });

      return res.status(201).json({
        id: newReview.id,
        spotId: Number(newReview.spotId),
        userId: req.user.id,
        review: newReview.review,
        stars: newReview.stars,
        createdAt: newReview.createdAt,
        updatedAt: newReview.updatedAt,
      });
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  "/:spotId/bookings",
  validateSpotId,
  validateBooking,
  requireAuth,
  async (req, res, next) => {
    try {
      const { spotId } = req.params;
      const { startDate, endDate } = req.body;

      const spot = await Spot.findByPk(spotId);
      if (!spot) {
        return res.status(404).json({ message: "Spot couldn't be found" });
      }

      if (spot.ownerId === req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const newBooking = await Booking.create({
        spotId,
        userId: req.user.id,
        startDate,
        endDate,
      });

      return res.status(201).json({
        id: newBooking.id,
        spotId: Number(newBooking.spotId),
        userId: req.user.id,
        startDate: newBooking.startDate,
        endDate: newBooking.endDate,
        createdAt: newBooking.createdAt,
        updatedAt: newBooking.updatedAt,
      });
    } catch (e) {
      next(e);
    }
  }
);

module.exports = router;
