// Thin wrapper around Flutterwave's v3 REST API (hosted "Standard" checkout —
// covers Zambian mobile money (MTN/Airtel) and cards in one flow).
//
// Real charges require FLUTTERWAVE_SECRET_KEY (and FLUTTERWAVE_WEBHOOK_HASH
// for webhook verification) to be set in the environment. Until a real key is
// added, initializePayment() degrades gracefully — the booking still gets
// created in the DB, just without a real payment link, so the rest of the
// app keeps working in local/dev environments without a live gateway account.

const FLW_BASE_URL = 'https://api.flutterwave.com/v3';

const isConfigured = () => !!process.env.FLUTTERWAVE_SECRET_KEY;

/**
 * @param {{ amount: number, currency?: string, txRef: string, customerEmail: string, customerName: string, redirectUrl: string, meta?: object, description?: string }} params
 */
async function initializePayment({ amount, currency, txRef, customerEmail, customerName, redirectUrl, meta = {}, description }) {
  if (!isConfigured()) {
    return { configured: false, link: null };
  }

  const response = await fetch(`${FLW_BASE_URL}/payments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tx_ref: txRef,
      amount,
      currency: currency || process.env.FLUTTERWAVE_CURRENCY || 'ZMW',
      redirect_url: redirectUrl,
      customer: {
        email: customerEmail,
        name: customerName,
      },
      customizations: {
        title: 'ZedBnB',
        description: description || 'ZedBnB booking payment',
      },
      meta,
    }),
  });

  const data = await response.json();
  if (data.status !== 'success' || !data.data?.link) {
    const err = new Error(data.message || 'Flutterwave payment initialization failed');
    err.flutterwaveResponse = data;
    throw err;
  }

  return { configured: true, link: data.data.link };
}

async function verifyTransaction(transactionId) {
  if (!isConfigured()) {
    return { configured: false, data: null };
  }
  const response = await fetch(`${FLW_BASE_URL}/transactions/${transactionId}/verify`, {
    headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` },
  });
  const data = await response.json();
  return { configured: true, data: data.data, raw: data };
}

// Flutterwave signs webhook calls with a "verif-hash" header that should
// match the secret hash you set in the Flutterwave dashboard (Settings ->
// Webhooks). Plain string comparison, since this is a fixed shared secret,
// not an HMAC over the payload.
function isValidWebhookSignature(signatureHeader) {
  const secretHash = process.env.FLUTTERWAVE_WEBHOOK_HASH;
  if (!secretHash || !signatureHeader) return false;
  return signatureHeader === secretHash;
}

module.exports = { initializePayment, verifyTransaction, isValidWebhookSignature, isConfigured };
