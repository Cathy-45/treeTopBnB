// Dual-sided commission + payment-processing pass-through model for bookings,
// plus long-stay discounts aimed at corporate/business travelers.
//
// - Host commission: a small cut taken from what the host earns, to make listing
//   on ZedBnB cheaper for hosts than the alternative (nothing, or a Facebook group).
// - Guest service fee: covers platform maintenance/support/marketing, added on top
//   of the nightly rate at checkout (this is how the platform actually makes money).
// - Processing fee: passed straight through to the guest, not absorbed by the
//   platform, since local telecom/card processing fees would otherwise eat the
//   margin. Mobile money is cheaper to process than international cards, so the
//   fee differs by payment method.
// - Long-stay discount: hosts can offer a lower effective nightly rate for
//   week-plus and month-plus stays, aimed at business travelers in Lusaka/Ndola
//   doing industrial/commercial project work. The longer discount wins if a
//   stay qualifies for both.
//
// None of these numbers touch a real payment gateway yet — this module only
// computes what SHOULD be charged/paid out, so the checkout UI is honest and
// the numbers are ready to wire into Flutterwave (mobile money + cards) once
// that integration happens.

const HOST_COMMISSION_RATE = 0.04; // 4% — within the 3-5% range
const GUEST_SERVICE_FEE_RATE = 0.11; // 11% — within the 10-12% range

const PROCESSING_FEES = {
  mobile_money: { rate: 0.0175, fixed: 0 }, // ~1.75%, no fixed fee (MTN/Airtel via Flutterwave)
  card: { rate: 0.035, fixed: 0.3 }, // ~3.5% + a small fixed fee (Visa/Mastercard via Flutterwave)
};

const WEEKLY_STAY_NIGHTS = 7;
const MONTHLY_STAY_NIGHTS = 28;

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * @param {number} pricePerNight
 * @param {number} nights
 * @param {'mobile_money' | 'card'} paymentMethod
 * @param {{ weeklyDiscountPercent?: number, monthlyDiscountPercent?: number }} discounts
 */
function calculateBookingPrice(pricePerNight, nights, paymentMethod = 'mobile_money', discounts = {}) {
  const method = PROCESSING_FEES[paymentMethod] ? paymentMethod : 'mobile_money';
  const { rate: processingRate, fixed: processingFixed } = PROCESSING_FEES[method];

  const weeklyDiscountPercent = Number(discounts.weeklyDiscountPercent) || 0;
  const monthlyDiscountPercent = Number(discounts.monthlyDiscountPercent) || 0;

  let appliedDiscountPercent = 0;
  let discountLabel = null;
  if (nights >= MONTHLY_STAY_NIGHTS && monthlyDiscountPercent > 0) {
    appliedDiscountPercent = monthlyDiscountPercent;
    discountLabel = 'monthly';
  } else if (nights >= WEEKLY_STAY_NIGHTS && weeklyDiscountPercent > 0) {
    appliedDiscountPercent = weeklyDiscountPercent;
    discountLabel = 'weekly';
  }

  const stickerSubtotal = round2(pricePerNight * nights);
  const subtotal = round2(stickerSubtotal * (1 - appliedDiscountPercent / 100));
  const discountAmount = round2(stickerSubtotal - subtotal);

  const hostCommission = round2(subtotal * HOST_COMMISSION_RATE);
  const hostPayout = round2(subtotal - hostCommission);
  const guestServiceFee = round2(subtotal * GUEST_SERVICE_FEE_RATE);
  const preProcessingTotal = round2(subtotal + guestServiceFee);
  const processingFee = round2(preProcessingTotal * processingRate + processingFixed);
  const totalGuestCharge = round2(preProcessingTotal + processingFee);

  return {
    paymentMethod: method,
    nights,
    pricePerNight,
    discountLabel,
    appliedDiscountPercent,
    stickerSubtotal,
    discountAmount,
    subtotal,
    hostCommissionRate: HOST_COMMISSION_RATE,
    hostCommission,
    hostPayout,
    guestServiceFeeRate: GUEST_SERVICE_FEE_RATE,
    guestServiceFee,
    processingFeeRate: processingRate,
    processingFee,
    totalGuestCharge,
  };
}

// Experience bookings (safaris, tours, transport, private chefs, etc.) use a
// different model than lodging: the guest pays close to sticker price (no
// separate guest service fee layered on top), and the platform's cut comes
// out of the PROVIDER's payout at a much higher rate — 15-20% — since these
// are higher-margin, add-on style bookings rather than a guest's main spend.
const EXPERIENCE_COMMISSION_RATE = 0.175; // 17.5% — middle of the 15-20% range

/**
 * @param {number} pricePerPerson
 * @param {number} guests
 * @param {'mobile_money' | 'card'} paymentMethod
 */
function calculateExperiencePrice(pricePerPerson, guests, paymentMethod = 'mobile_money') {
  const method = PROCESSING_FEES[paymentMethod] ? paymentMethod : 'mobile_money';
  const { rate: processingRate, fixed: processingFixed } = PROCESSING_FEES[method];

  const subtotal = round2(pricePerPerson * Math.max(1, guests));
  const providerCommission = round2(subtotal * EXPERIENCE_COMMISSION_RATE);
  const providerPayout = round2(subtotal - providerCommission);
  // Guest pays subtotal + processing fee only — no separate service fee, since
  // the platform's margin already comes from the provider-side commission.
  const processingFee = round2(subtotal * processingRate + processingFixed);
  const totalGuestCharge = round2(subtotal + processingFee);

  return {
    paymentMethod: method,
    guests,
    pricePerPerson,
    subtotal,
    providerCommissionRate: EXPERIENCE_COMMISSION_RATE,
    providerCommission,
    providerPayout,
    processingFeeRate: processingRate,
    processingFee,
    totalGuestCharge,
  };
}

module.exports = {
  HOST_COMMISSION_RATE,
  GUEST_SERVICE_FEE_RATE,
  PROCESSING_FEES,
  WEEKLY_STAY_NIGHTS,
  MONTHLY_STAY_NIGHTS,
  calculateBookingPrice,
  EXPERIENCE_COMMISSION_RATE,
  calculateExperiencePrice,
};
