const express = require("express");
const { requireAuth } = require("../../utils/auth");
const { Booking, ExperienceBooking } = require("../../db/models");
const flutterwave = require("../../utils/flutterwave");
const pawapay = require("../../utils/pawapay");
const router = express.Router();

// GET /api/payments/verify-pawapay?bookingId=...&bookingType=spot|experience
// Polled by the booking modal right after a direct charge is initiated
// ("check your phone to enter your PIN..."). Safe to call repeatedly — it's
// just a read-through status check backed by pawaPay's own Check Deposit
// Status endpoint, with the same terminal-state idempotency as the webhook
// (a booking already marked paid/failed won't be re-evaluated).
router.get("/verify-pawapay", requireAuth, async (req, res, next) => {
  try {
    const { bookingId, bookingType } = req.query;
    if (!bookingId) {
      return res.status(400).json({
        message: "Bad Request",
        errors: { bookingId: "bookingId is required" },
      });
    }

    const Model = bookingType === "experience" ? ExperienceBooking : Booking;
    const booking = await Model.findOne({ where: { id: bookingId, userId: req.user.id } });
    if (!booking) {
      return res.status(404).json({ message: "Booking couldn't be found" });
    }
    if (!booking.pawapayDepositId) {
      return res.status(200).json({
        bookingType: bookingType === "experience" ? "experience" : "spot",
        bookingId: booking.id,
        paymentStatus: booking.paymentStatus,
        message: "No PawaPay deposit on record for this booking",
      });
    }
    if (booking.paymentStatus === "paid" || booking.paymentStatus === "failed") {
      // Already resolved (likely by the webhook) — no need to re-check.
      return res.status(200).json({
        bookingType: bookingType === "experience" ? "experience" : "spot",
        bookingId: booking.id,
        paymentStatus: booking.paymentStatus,
      });
    }

    const check = await pawapay.checkDepositStatus(booking.pawapayDepositId);
    if (!check.configured) {
      return res.status(200).json({
        bookingType: bookingType === "experience" ? "experience" : "spot",
        bookingId: booking.id,
        paymentStatus: booking.paymentStatus,
        message: "Payment gateway not configured in this environment",
      });
    }

    if (check.status === "COMPLETED") {
      await booking.update({ paymentStatus: "paid" });
    } else if (["FAILED", "REJECTED", "CANCELLED"].includes(check.status)) {
      await booking.update({ paymentStatus: "failed" });
    }
    // ACCEPTED / SUBMITTED / IN_RECONCILIATION -> still awaiting_payment.

    return res.status(200).json({
      bookingType: bookingType === "experience" ? "experience" : "spot",
      bookingId: booking.id,
      paymentStatus: booking.paymentStatus,
      depositStatus: check.status,
      failureReason: check.failureReason,
    });
  } catch (e) {
    next(e);
  }
});

// GET /api/payments/verify?tx_ref=...&transaction_id=...
// Hit by the frontend's /payment/callback page after Flutterwave redirects
// the guest back from hosted checkout. Independently re-verifies the charge
// against Flutterwave's API (never trusts the redirect query params alone)
// before marking a booking paid.
router.get("/verify", requireAuth, async (req, res, next) => {
  try {
    const { tx_ref, transaction_id } = req.query;
    if (!tx_ref || !transaction_id) {
      return res.status(400).json({
        message: "Bad Request",
        errors: { tx_ref: "tx_ref and transaction_id are both required" },
      });
    }

    let booking = await Booking.findOne({ where: { flutterwaveTxRef: tx_ref, userId: req.user.id } });
    let bookingType = "spot";
    if (!booking) {
      booking = await ExperienceBooking.findOne({ where: { flutterwaveTxRef: tx_ref, userId: req.user.id } });
      bookingType = "experience";
    }
    if (!booking) {
      return res.status(404).json({ message: "Booking couldn't be found for this payment reference" });
    }

    const verification = await flutterwave.verifyTransaction(transaction_id);
    if (!verification.configured) {
      return res.status(200).json({
        bookingType,
        bookingId: booking.id,
        paymentStatus: booking.paymentStatus,
        message: "Payment gateway not configured in this environment",
      });
    }

    const txData = verification.data;
    const isSuccessful = !!txData
      && txData.status === "successful"
      && txData.tx_ref === tx_ref
      && Number(txData.amount) >= Number(booking.totalGuestCharge);

    await booking.update({
      flutterwaveTransactionId: String(transaction_id),
      paymentStatus: isSuccessful ? "paid" : "failed",
    });

    return res.status(200).json({
      bookingType,
      bookingId: booking.id,
      paymentStatus: booking.paymentStatus,
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
