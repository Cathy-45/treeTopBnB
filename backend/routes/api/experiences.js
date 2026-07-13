const express = require("express");

const { requireAuth } = require("../../utils/auth");
const { Experience, ExperienceBooking, User } = require("../../db/models");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");
const { calculateExperiencePrice } = require("../../utils/pricing");
const flutterwave = require("../../utils/flutterwave");
const pawapay = require("../../utils/pawapay");
const router = express.Router();

const CATEGORIES = ["safari", "water", "culture", "transport", "chef"];

const validateExperience = [
  check("title").notEmpty().withMessage("Title is required").isLength({ max: 100 }).withMessage("Title must be 100 characters or less"),
  check("description").notEmpty().withMessage("Description is required"),
  check("category").isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(", ")}`),
  check("city").notEmpty().withMessage("City is required"),
  check("pricePerPerson").isFloat({ min: 0 }).withMessage("Price per person must be a positive number"),
  check("durationHours").optional().isFloat({ min: 0 }).withMessage("Duration must be a positive number"),
  handleValidationErrors,
];

const validateExperienceBooking = [
  check("date").custom((value) => {
    if (new Date(value) < new Date(new Date().toDateString())) {
      throw new Error("date cannot be in the past");
    }
    return true;
  }),
  check("guests").isInt({ min: 1 }).withMessage("guests must be at least 1"),
  handleValidationErrors,
];

const validateExperienceId = (req, res, next) => {
  const { experienceId } = req.params;
  if (!Number.isInteger(Number(experienceId))) {
    return res.status(400).json({
      message: "Validation error",
      errors: { id: "experienceId must be a valid integer" },
    });
  }
  next();
};

const formatExperience = (experience) => ({
  id: experience.id,
  providerId: experience.providerId,
  title: experience.title,
  description: experience.description,
  category: experience.category,
  city: experience.city,
  pricePerPerson: experience.pricePerPerson,
  durationHours: experience.durationHours,
  previewImage: experience.previewImage,
  createdAt: experience.createdAt,
  updatedAt: experience.updatedAt,
});

// GET /api/experiences — browse, optionally filtered by city/category
router.get("/", async (req, res, next) => {
  try {
    const { city, category } = req.query;
    const where = {};
    if (city) where.city = city;
    if (category) {
      if (!CATEGORIES.includes(category)) {
        return res.status(400).json({ message: "Bad Request", errors: { category: `Category must be one of: ${CATEGORIES.join(", ")}` } });
      }
      where.category = category;
    }

    const allExperiences = await Experience.findAll({
      where,
      include: [{ model: User, as: "Provider", attributes: ["id", "firstName", "lastName"] }],
    });

    const formatted = allExperiences.map((experience) => ({
      ...formatExperience(experience),
      Provider: experience.Provider,
    }));

    res.json({ Experiences: formatted });
  } catch (e) {
    next(e);
  }
});

// GET /api/experiences/:experienceId
router.get("/:experienceId", validateExperienceId, async (req, res, next) => {
  try {
    const experience = await Experience.findByPk(req.params.experienceId, {
      include: [{ model: User, as: "Provider", attributes: ["id", "firstName", "lastName"] }],
    });
    if (!experience) {
      return res.status(404).json({ message: "Experience couldn't be found" });
    }
    res.json({ ...formatExperience(experience), Provider: experience.Provider });
  } catch (e) {
    next(e);
  }
});

// POST /api/experiences — a host/provider lists a new experience
router.post("/", requireAuth, validateExperience, async (req, res, next) => {
  try {
    const { title, description, category, city, pricePerPerson, durationHours, previewImage } = req.body;
    const providerId = req.user.id;

    const experience = await Experience.create({
      providerId,
      title,
      description,
      category,
      city,
      pricePerPerson,
      durationHours: durationHours || null,
      previewImage: previewImage || null,
    });

    return res.status(201).json(formatExperience(experience));
  } catch (e) {
    next(e);
  }
});

// PUT /api/experiences/:experienceId
router.put("/:experienceId", requireAuth, validateExperienceId, validateExperience, async (req, res, next) => {
  try {
    const { experienceId } = req.params;
    const { title, description, category, city, pricePerPerson, durationHours, previewImage } = req.body;

    const experience = await Experience.findByPk(experienceId);
    if (!experience) {
      return res.status(404).json({ message: "Experience couldn't be found" });
    }
    if (experience.providerId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await experience.update({
      title,
      description,
      category,
      city,
      pricePerPerson,
      durationHours: durationHours || null,
      previewImage: previewImage || experience.previewImage,
    });

    return res.status(200).json(formatExperience(experience));
  } catch (e) {
    next(e);
  }
});

// DELETE /api/experiences/:experienceId
router.delete("/:experienceId", requireAuth, validateExperienceId, async (req, res, next) => {
  try {
    const experience = await Experience.findByPk(req.params.experienceId);
    if (!experience) {
      return res.status(404).json({ message: "Experience couldn't be found" });
    }
    if (experience.providerId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await experience.destroy();
    return res.status(200).json({ message: "Successfully deleted" });
  } catch (e) {
    next(e);
  }
});

// POST /api/experiences/:experienceId/bookings — guest books an experience.
// Commission comes out of the PROVIDER's payout (15-20%), not a guest service
// fee, per calculateExperiencePrice in utils/pricing.js.
router.post(
  "/:experienceId/bookings",
  validateExperienceId,
  validateExperienceBooking,
  requireAuth,
  async (req, res, next) => {
    try {
      const { experienceId } = req.params;
      const { date, guests, paymentMethod, phoneNumber, provider } = req.body;

      const experience = await Experience.findByPk(experienceId);
      if (!experience) {
        return res.status(404).json({ message: "Experience couldn't be found" });
      }
      if (experience.providerId === req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const pricing = calculateExperiencePrice(Number(experience.pricePerPerson), Number(guests), paymentMethod);

      const newBooking = await ExperienceBooking.create({
        experienceId,
        userId: req.user.id,
        date,
        guests,
        paymentMethod: pricing.paymentMethod,
        subtotal: pricing.subtotal,
        providerCommission: pricing.providerCommission,
        providerPayout: pricing.providerPayout,
        processingFee: pricing.processingFee,
        totalGuestCharge: pricing.totalGuestCharge,
      });

      // Same PawaPay direct-charge flow as spot bookings (mobile money
      // only, for now — see the note in routes/api/spots.js). Booking
      // always succeeds even if the gateway isn't configured/reachable.
      let depositStatus = null;
      let paymentFailureReason = null;
      if (pricing.paymentMethod === 'mobile_money') {
        if (!phoneNumber || !provider) {
          await newBooking.update({ paymentStatus: 'unavailable' });
        } else {
          try {
            const result = await pawapay.initializePayment({
              amount: Number(pricing.totalGuestCharge),
              currency: 'ZMW',
              phoneNumber,
              provider,
              reason: `ZedBnB experience booking ${newBooking.id}`,
              clientReferenceId: `experience-booking-${newBooking.id}`,
            });
            depositStatus = result.status;
            paymentFailureReason = result.failureReason;
            if (!result.configured) {
              await newBooking.update({ paymentStatus: 'unavailable' });
            } else if (result.status === 'ACCEPTED' || result.status === 'DUPLICATE_IGNORED') {
              await newBooking.update({ pawapayDepositId: result.depositId, paymentStatus: 'awaiting_payment' });
            } else {
              await newBooking.update({ pawapayDepositId: result.depositId, paymentStatus: 'failed' });
            }
          } catch (paymentErr) {
            console.error('Error initializing PawaPay payment for experience booking:', paymentErr.message);
            await newBooking.update({ paymentStatus: 'unavailable' });
          }
        }
      } else {
        await newBooking.update({ paymentStatus: 'unavailable' });
      }

      return res.status(201).json({
        id: newBooking.id,
        experienceId: Number(newBooking.experienceId),
        userId: req.user.id,
        date: newBooking.date,
        guests: newBooking.guests,
        paymentMethod: newBooking.paymentMethod,
        subtotal: newBooking.subtotal,
        providerCommission: newBooking.providerCommission,
        providerPayout: newBooking.providerPayout,
        processingFee: newBooking.processingFee,
        totalGuestCharge: newBooking.totalGuestCharge,
        paymentStatus: newBooking.paymentStatus,
        depositId: newBooking.pawapayDepositId,
        depositStatus,
        paymentFailureReason,
        createdAt: newBooking.createdAt,
        updatedAt: newBooking.updatedAt,
      });
    } catch (e) {
      next(e);
    }
  }
);

// GET /api/experiences/:experienceId/bookings — provider sees who booked; a
// guest sees only their own bookings for this experience.
router.get("/:experienceId/bookings", validateExperienceId, requireAuth, async (req, res, next) => {
  try {
    const { experienceId } = req.params;
    const experience = await Experience.findByPk(experienceId);
    if (!experience) {
      return res.status(404).json({ message: "Experience couldn't be found" });
    }

    const isProvider = experience.providerId === req.user.id;
    const allBookings = await ExperienceBooking.findAll({
      where: {
        experienceId,
        ...(isProvider ? {} : { userId: req.user.id }),
      },
      include: isProvider ? [{ model: User, attributes: ["id", "firstName", "lastName"] }] : [],
    });

    return res.status(200).json(allBookings);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
