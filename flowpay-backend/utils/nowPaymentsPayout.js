const axios =
  require("axios");

const NOWPAYMENTS_API =
  "https://api.nowpayments.io/v1";


// ======================================================
// COMMON HEADERS
// ======================================================

function getHeaders(token) {

  const headers = {

    "x-api-key":
      process.env.NOWPAYMENTS_API_KEY,

    "Content-Type":
      "application/json",

  };

  if (token) {

    headers.Authorization =
      `Bearer ${token}`;

  }

  return headers;

}


// ======================================================
// AUTHENTICATE
// ======================================================

async function authenticatePayouts() {

  const email =
    process.env.NOWPAYMENTS_EMAIL;

  const password =
    process.env.NOWPAYMENTS_PASSWORD;

  if (!email || !password) {

    throw new Error(
      "NOWPAYMENTS_EMAIL or NOWPAYMENTS_PASSWORD is missing"
    );

  }

  const response =
    await axios.post(

      `${NOWPAYMENTS_API}/auth`,

      {
        email,
        password,
      },

      {
        headers: {
          "Content-Type":
            "application/json",
        },

        timeout: 15000,

      }

    );


  if (
    !response.data ||
    !response.data.token
  ) {

    throw new Error(
      "NOWPayments authentication failed"
    );

  }

  return response.data;

}


// ======================================================
// GET PAYOUT BALANCE
// ======================================================

async function getPayoutBalance() {

  const auth =
    await authenticatePayouts();


  const response =
    await axios.get(

      `${NOWPAYMENTS_API}/balance`,

      {
        headers:
          getHeaders(
            auth.token
          ),

        timeout: 15000,

      }

    );


  return response.data;

}


// ======================================================
// ESTIMATE USD → TRX
// ======================================================

async function estimateCryptoAmount({

  amount,

  currencyFrom = "usd",

  currencyTo = "trx",

}) {

  const numericAmount =
    Number(amount);


  if (
    !Number.isFinite(
      numericAmount
    ) ||
    numericAmount <= 0
  ) {

    throw new Error(
      "Invalid amount for crypto estimate"
    );

  }


  const auth =
    await authenticatePayouts();


  const response =
    await axios.get(

      `${NOWPAYMENTS_API}/estimate`,

      {

        params: {

          amount:
            numericAmount,

          currency_from:
            String(
              currencyFrom
            )
              .toLowerCase(),

          currency_to:
            String(
              currencyTo
            )
              .toLowerCase(),

        },


        headers:
          getHeaders(
            auth.token
          ),


        timeout: 15000,

      }

    );


  if (
    !response.data
  ) {

    throw new Error(
      "NOWPayments returned empty estimate response"
    );

  }


  return response.data;

}


// ======================================================
// VALIDATE PAYOUT ADDRESS
// ======================================================

async function validatePayoutAddress({

  address,

  currency = "trx",

}) {

  if (!address) {

    throw new Error(
      "Payout address is required"
    );

  }


  const auth =
    await authenticatePayouts();


  const response =
    await axios.post(

      `${NOWPAYMENTS_API}/payout/validate`,

      {

        address,

        currency:
          String(
            currency
          )
            .toLowerCase(),

      },

      {

        headers:
          getHeaders(
            auth.token
          ),

        timeout: 15000,

      }

    );


  return response.data;

}


// ======================================================
// CREATE SINGLE TRX PAYOUT
// ======================================================

async function createPayout({

  address,

  amount,

  uniqueExternalId,

  ipnCallbackUrl,

  description,

}) {

  if (!address) {

    throw new Error(
      "Payout address is required"
    );

  }


  if (
    amount === undefined ||
    amount === null
  ) {

    throw new Error(
      "Payout amount is required"
    );

  }


  const numericAmount =
    Number(amount);


  if (
    !Number.isFinite(
      numericAmount
    ) ||
    numericAmount <= 0
  ) {

    throw new Error(
      "Invalid payout amount"
    );

  }


  const amountString =
    numericAmount
      .toFixed(6)
      .replace(
        /\.?0+$/,
        ""
      );


  const auth =
    await authenticatePayouts();


  const withdrawal = {

    address,

    currency:
      "trx",

    amount:
      amountString,

  };


  if (ipnCallbackUrl) {

    withdrawal.ipn_callback_url =
      ipnCallbackUrl;

  }


  if (description) {

    withdrawal.payout_description =
      description;

  }


  if (uniqueExternalId) {

    withdrawal.unique_external_id =
      uniqueExternalId;

  }


  const payload = {

    withdrawals: [
      withdrawal,
    ],

  };


  const response =
    await axios.post(

      `${NOWPAYMENTS_API}/payout`,

      payload,

      {

        headers:
          getHeaders(
            auth.token
          ),

        timeout: 20000,

      }

    );


  if (!response.data) {

    throw new Error(
      "NOWPayments returned an empty payout response"
    );

  }


  return response.data;

}


// ======================================================
// VERIFY PAYOUT 2FA
// ======================================================

async function verifyPayout({

  batchWithdrawalId,

  verificationCode,

}) {

  if (!batchWithdrawalId) {

    throw new Error(
      "batchWithdrawalId is required"
    );

  }


  if (!verificationCode) {

    throw new Error(
      "verificationCode is required"
    );

  }


  const auth =
    await authenticatePayouts();


  const response =
    await axios.post(

      `${NOWPAYMENTS_API}/payout/${encodeURIComponent(
        batchWithdrawalId
      )}/verify`,

      {

        verification_code:
          String(
            verificationCode
          ),

      },

      {

        headers:
          getHeaders(
            auth.token
          ),

        timeout: 15000,

      }

    );


  return response.data;

}


// ======================================================
// GET PAYOUT STATUS
// ======================================================

async function getPayoutStatus(
  payoutId
) {

  if (!payoutId) {

    throw new Error(
      "payoutId is required"
    );

  }


  const auth =
    await authenticatePayouts();


  const response =
    await axios.get(

      `${NOWPAYMENTS_API}/payout/${encodeURIComponent(
        payoutId
      )}`,

      {

        headers:
          getHeaders(
            auth.token
          ),

        timeout: 15000,

      }

    );


  return response.data;

}


// ======================================================
// EXPORT
// ======================================================

module.exports = {

  authenticatePayouts,

  getPayoutBalance,

  estimateCryptoAmount,

  validatePayoutAddress,

  createPayout,

  verifyPayout,

  getPayoutStatus,

};