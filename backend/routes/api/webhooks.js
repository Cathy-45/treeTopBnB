const express = require("express");
const { Booking, ExperienceBooking } = require("../../db/models");
const flutterwave = require("../../utils/flutterwave");
const router = express.Router();

// PawaPay's deposit callback — configured as a fixed URL in the PawaPay
// Dashboard (not passed per-request like Flutterwave's redirect_url), sent
// with the final status of a deposit identified by the depositId we
// generated in utils/pawapay.js. No signature scheme is documented for the
// basic setup (PawaPay offers optional request signing as an add-on layer,
// not implemented here yet), so this mirrors the Flutterwave webhook's
// "always ack with 200, only act on a recognized depositId" pattern.
//
// Idempotency: pawaPay can and does redeliver callbacks (retries, duplicate
// sends). Once a booking has reached a terminal payment state (paid/failed)
// it must not be flipped back by a late or repeated callback — this is the
// same guard principle as FarmLink's processed_at check, simplified here
// since ZedBnB doesn't need to re-run any payout/stock side effects on
// receipt, just a one-way status transition.
router.post("/pawapay", async (req, res) => {
  try {
    const event = req.body;
    const depositId = event?.depositId;
    const status = event?.status;
    if (!depositId || !status) {
      return res.status(200).json({ received: true });
    }

    let booking = await Booking.findOne({ where: { pawapayDepositId: depositId } });
    if (!booking) {
      booking = await ExperienceBooking.findOne({ where: { pawapayDepositId: depositId } });
    }
    if (!booking) {
      return res.status(200).json({ received: true });
    }

    if (booking.paymentStatus === "paid" || booking.paymentStatus === "failed") {
      return res.status(200).json({ received: true });
    }

    let nextStatus = booking.paymentStatus;
    if (status === "COMPLETED") {
      nextStatus = "paid";
    } else if (["FAILED", "REJECTED", "CANCELLED"].includes(status)) {
      nextStatus = "failed";
    }
    // ACCEPTED / SUBMITTED / IN_RECONCILIATION -> leave as awaiting_payment;
    // not a terminal state yet, a later callback will resolve it.

    if (nextStatus !== booking.paymentStatus) {
      await booking.update({ paymentStatus: nextStatus });
    }

    return res.status(200).json({ received: true });
  } catch (e) {
    console.error("Error processing PawaPay webhook:", e);
    return res.status(200).json({ received: true });
  }
});

// Mounted directly in app.js, BEFORE the csurf middleware — Flutterwave's
// servers have no session/CSRF cookie, so this route must live outside the
// normal CSRF-protected /api router. This is the authoritative source of
// truth for payment status (more reliable than the redirect-based
// /api/payments/verify flow, which only fires if the guest's browser makes
// it back to the app).
router.post("/flutterwave", async (req, res) => {
  const signature = req.headers["verif-hash"];
  if (!flutterwave.isValidWebhookSignature(signature)) {
    return res.status(401).json({ message: "Invalid webhook signature" });
  }

  // Always resolve with 200 once the signature checks out, even on internal
  // errors — this stops Flutterwave from endlessly retrying a webhook whose
  // failure is on our end, not theirs. Errors are still logged server-side.
  try {
    const event = req.body;
    const txData = event?.data;
    const txRef = txData?.tx_ref;
    if (!txRef) {
      return res.status(200).json({ received: true });
    }

    let booking = await Booking.findOne({ where: { flutterwaveTxRef: txRef } });
    if (!booking) {
      booking = await ExperienceBooking.findOne({ where: { flutterwaveTxRef: txRef } });
    }
    if (!booking) {
      return res.status(200).json({ received: true });
    }

    const isSuccessful = txData.status === "successful" && Number(txData.amount) >= Number(booking.totalGuestCharge);
    await booking.update({
      flutterwaveTransactionId: String(txData.id),
      paymentStatus: isSuccessful ? "paid" : "failed",
    });

    return res.status(200).json({ received: true });
  } catch (e) {
    console.error("Error processing Flutterwave webhook:", e);
    return res.status(200).json({ received: true });
  }
});

module.exports = router;
