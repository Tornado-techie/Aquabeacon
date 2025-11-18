// routes/mpesa.js
const express = require('express');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

dotenv.config();
const router = express.Router();
router.use(bodyParser.json());

const {
  MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET,
  MPESA_SHORTCODE,
  MPESA_PASSKEY,
  MPESA_CALLBACK_BASE_URL,
  MPESA_ENV
} = process.env;

const base =
  MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

// 1) helper — get OAuth token
async function getAccessToken() {
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
  const url = `${base}/oauth/v1/generate?grant_type=client_credentials`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Basic ${auth}` }
  });
  const data = await res.json();
  return data.access_token;
}

// 2) helper — generate password for Lipa Na M-Pesa
function lipaPassword() {
  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0,14); // YYYYMMDDHHMMSS
  // password = base64(shortcode + passkey + timestamp)
  const pw = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');
  return { password: pw, timestamp };
}

// 3) initiate STK Push
router.post('/stkpush', async (req, res) => {
  try {
    const { amount, phone, accountReference = 'AquaBeacon', transactionDesc = 'AquaBeacon subscription' } = req.body;
    if(!amount || !phone) return res.status(400).json({ error: 'phone and amount required' });

    const token = await getAccessToken();
    const { password, timestamp } = lipaPassword();

    const body = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone.replace(/^\+/, ''),      // e.g. 2547xxxxxxx
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: phone.replace(/^\+/, ''),
      CallBackURL: `${MPESA_CALLBACK_BASE_URL}/api/mpesa/stkcallback`,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc
    };

    const response = await fetch(`${base}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    // save data.CheckoutRequestID to DB against the user/session to track later if needed
    // sample response contains CheckoutRequestID and ResponseCode etc.
    return res.json(data);

  } catch (err) {
    console.error('STK push error', err);
    return res.status(500).json({ error: 'Failed to initiate STK push' });
  }
});

// 4) callback handler for STK Push results
router.post('/stkcallback', async (req, res) => {
  // Daraja sends a JSON payload to this endpoint — log and respond 200
  console.log('STK Callback received:', JSON.stringify(req.body, null, 2));

  // IMPORTANT: Immediately respond HTTP 200 to acknowledge receipt
  res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });

  // Then process the payload: save the transaction result in DB, update user's subscription, send email/SMS, etc.
  // Example payload is under req.body.Body.stkCallback
  try {
    const stkCallback = req.body.Body?.stkCallback;
    if (!stkCallback) return;

    // Example fields:
    // stkCallback.CheckoutRequestID
    // stkCallback.ResultCode (0 success)
    // stkCallback.ResultDesc
    // stkCallback.CallbackMetadata.Item -> contains MpesaReceiptNumber, Amount, PhoneNumber, etc.

    // parse metadata
    const items = stkCallback?.CallbackMetadata?.Item || [];
    const meta = {};
    items.forEach(it => { meta[it.Name] = it.Value; });

    // Save to DB or update subscription:
    // e.g. save({
    //   checkoutRequestID: stkCallback.CheckoutRequestID,
    //   resultCode: stkCallback.ResultCode,
    //   mpesaReceiptNumber: meta?.MpesaReceiptNumber,
    //   amount: meta?.Amount,
    //   phone: meta?.PhoneNumber,
    //   transactionDate: meta?.TransactionDate
    // })

    // If ResultCode === 0 -> payment successful -> unlock features
  } catch (err) {
    console.error('Error processing STK callback:', err);
  }
});

module.exports = router;
