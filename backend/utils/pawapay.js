// Direct-charge PawaPay integration (POST /v2/deposits) — ZedBnB's active
// payment gateway. This mirrors the pattern already proven in production on
// FarmLink/AgriConnect (same backend infra, same EC2 server, real tested
// payment volume): the guest's phone number + mobile money provider are
// collected directly in-app — no redirect to a hosted checkout page — and
// pawaPay sends them a PIN prompt straight on their own phone. We then find
// out the final result either via the /api/webhooks/pawapay callback or by
// polling checkDepositStatus.
//
// Docs: https://docs.pawapay.io/v2/api-reference/deposits/initiate-deposit
//       https://docs.pawapay.io/v2/api-reference/deposits/check-deposit-status
//       https://docs.pawapay.io/v2/docs/providers (Zambia: MTN/Airtel/Zamtel)
//
// Real charges require PAWAPAY_API_TOKEN to be set. Until then,
// initializePayment() degrades gracefully — the booking still gets created,
// just without an attempted charge — same pattern as utils/flutterwave.js.

const crypto = require("crypto");

const PAWAPAY_BASE_URL = process.env.PAWAPAY_ENV === "production"
  ? "https://api.pawapay.io"
  : "https://api.sandbox.pawapay.io";

const isConfigured = () => !!process.env.PAWAPAY_API_TOKEN;

// Zambian mobile money providers pawaPay supports.
const VALID_PROVIDERS = ["MTN_MOMO_ZMB", "AIRTEL_OAPI_ZMB", "ZAMTEL_ZMB"];

// Cleans a Zambian phone number into pawaPay's required MSISDN format:
// digits only, no leading '0', country code prepended. Returns null if it
// doesn't look like a valid Zambian number, so callers can reject early
// instead of sending a request pawaPay will just reject anyway.
function cleanZambianPhone(rawPhone) {
  if (!rawPhone) return null;
  const digits = String(rawPhone).replace(/\D/g, "");
  if (digits.startsWith("260") && digits.length === 12) return digits;
  if (digits.startsWith("0") && digits.length === 10) return `260${digits.slice(1)}`;
  if (digits.length === 9) return `260${digits}`;
  return null;
}

// pawaPay's customerMessage only allows letters, numbers and spaces (4-22
// chars) — a booking reference with '#' or punctuation gets rejected
// outright, so this strips anything that isn't allowed.
function sanitizeCustomerMessage(message) {
  const cleaned = String(message || "ZedBnB payment").replace(/[^a-zA-Z0-9 ]/g, "").trim();
  const safe = cleaned.length >= 4 ? cleaned : "ZedBnB payment";
  return safe.slice(0, 22);
}

/**
 * Direct-charges a guest's mobile money account. No redirect involved — the
 * guest gets a PIN prompt on their own phone. The initial response only
 * tells you whether pawaPay ACCEPTED the request for processing; call
 * checkDepositStatus (or wait for the webhook) to find out whether it
 * actually completed.
 *
 * @param {{ amount: number, currency?: string, phoneNumber: string, provider: string, reason?: string, clientReferenceId?: string }} params
 */
async function initializePayment({ amount, currency, phoneNumber, provider, reason, clientReferenceId }) {
  if (!isConfigured()) {
    return { configured: false, depositId: null, status: null, failureReason: null };
  }

  const cleanedPhone = cleanZambianPhone(phoneNumber);
  if (!cleanedPhone) {
    return {
      configured: true,
      depositId: null,
      status: "REJECTED",
      failureReason: { failureCode: "INVALID_PHONE_NUMBER", failureMessage: "Enter a valid Zambian mobile number." },
    };
  }
  if (!VALID_PROVIDERS.includes(provider)) {
    return {
      configured: true,
      depositId: null,
      status: "REJECTED",
      failureReason: { failureCode: "INVALID_PROVIDER", failureMessage: "Choose MTN, Airtel or Zamtel." },
    };
  }

  // We generate the depositId ourselves BEFORE calling pawaPay, per their
  // reconciliation guidance, so we always have a reference to look up even
  // if the request times out or the response never arrives.
  const depositId = crypto.randomUUID();

  const response = await fetch(`${PAWAPAY_BASE_URL}/v2/deposits`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAWAPAY_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      depositId,
      payer: {
        type: "MMO",
        accountDetails: { phoneNumber: cleanedPhone, provider },
      },
      ...(clientReferenceId ? { clientReferenceId: String(clientReferenceId).slice(0, 100) } : {}),
      customerMessage: sanitizeCustomerMessage(reason),
      amount: String(amount),
      currency: currency || "ZMW",
    }),
  });

  const data = await response.json();
  return {
    configured: true,
    depositId: data.depositId || depositId,
    // ACCEPTED (processing) | REJECTED (see failureReason) | DUPLICATE_IGNORED
    status: data.status || "REJECTED",
    failureReason: data.failureReason || null,
  };
}

// Reads the final status of a deposit — used by the polling endpoint the
// frontend hits right after charge initiation ("check your phone..."), and
// as a fallback if the webhook callback is ever missed. Normalizes
// pawaPay's response shape since the Check Deposit Status endpoint has been
// observed nesting the real status under a `data` key rather than returning
// it flat.
async function checkDepositStatus(depositId) {
  if (!isConfigured()) {
    return { configured: false, status: null, failureReason: null, raw: null };
  }
  const response = await fetch(`${PAWAPAY_BASE_URL}/v2/deposits/${depositId}`, {
    headers: { Authorization: `Bearer ${process.env.PAWAPAY_API_TOKEN}` },
  });
  const data = await response.json();

  // Handle whichever shape comes back: a bare object, a nested
  // { status: 'FOUND', data: {...} }, or an array of deposit objects.
  let record = data;
  if (Array.isArray(data)) {
    record = data[0];
  } else if (data && data.data && typeof data.data === "object") {
    record = Array.isArray(data.data) ? data.data[0] : data.data;
  }

  return {
    configured: true,
    status: record?.status || null,
    failureReason: record?.failureReason || record?.failureMessage || null,
    raw: data,
  };
}

module.exports = {
  initializePayment,
  checkDepositStatus,
  isConfigured,
  cleanZambianPhone,
  VALID_PROVIDERS,
};
