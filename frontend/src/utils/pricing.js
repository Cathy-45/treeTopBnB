// Mirrors backend/utils/pricing.js — used for an instant checkout preview
// before the booking is submitted. The backend recomputes and persists the
// authoritative numbers; this copy is display-only, never trusted for charges.

export const HOST_COMMISSION_RATE = 0.04;
export const GUEST_SERVICE_FEE_RATE = 0.11;

export const PROCESSING_FEES = {
    mobile_money: { rate: 0.0175, fixed: 0 },
    card: { rate: 0.035, fixed: 0.3 },
};

export const WEEKLY_STAY_NIGHTS = 7;
export const MONTHLY_STAY_NIGHTS = 28;

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export function calculateBookingPrice(pricePerNight, nights, paymentMethod = 'mobile_money', discounts = {}) {
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
        hostCommission,
        hostPayout,
        guestServiceFee,
        processingFee,
        totalGuestCharge,
    };
}

// Experience bookings (safaris, tours, transport, private chefs, etc.) — the
// platform's cut comes out of the PROVIDER's payout at a much higher rate
// (15-20%) instead of a guest service fee, since these are higher-margin
// add-ons rather than a guest's main spend. Mirrors backend/utils/pricing.js.
export const EXPERIENCE_COMMISSION_RATE = 0.175;

export function calculateExperiencePrice(pricePerPerson, guests, paymentMethod = 'mobile_money') {
    const method = PROCESSING_FEES[paymentMethod] ? paymentMethod : 'mobile_money';
    const { rate: processingRate, fixed: processingFixed } = PROCESSING_FEES[method];

    const subtotal = round2(pricePerPerson * Math.max(1, guests));
    const providerCommission = round2(subtotal * EXPERIENCE_COMMISSION_RATE);
    const providerPayout = round2(subtotal - providerCommission);
    const processingFee = round2(subtotal * processingRate + processingFixed);
    const totalGuestCharge = round2(subtotal + processingFee);

    return {
        paymentMethod: method,
        guests,
        pricePerPerson,
        subtotal,
        providerCommission,
        providerPayout,
        processingFee,
        totalGuestCharge,
    };
}
