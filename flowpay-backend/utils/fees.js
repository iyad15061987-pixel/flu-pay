// ======================================================
// FLOWPAY FEES
// ======================================================

// Internal transfer
const calculateInternalFee = (amount) => {
  const numericAmount = Number(amount) || 0;

  return numericAmount * 0.0001;
};


// ======================================================
// EXTERNAL
// PayPal / Bank / Stripe
// ======================================================

const calculateExternalFee = (amount) => {
  const numericAmount = Number(amount) || 0;

  return numericAmount * 0.035;
};


// ======================================================
// CRYPTO
//
// Configurable from .env:
//
// CRYPTO_FEE_RATE=0.01
// CRYPTO_MIN_FEE=0.10
//
// Example:
// $10 -> $0.10 fee -> $9.90 net
// ======================================================

const calculateCryptoFee = (amount) => {
  const numericAmount = Number(amount) || 0;

  if (
    !Number.isFinite(numericAmount) ||
    numericAmount <= 0
  ) {
    return 0;
  }

  const rate =
    Number(
      process.env.CRYPTO_FEE_RATE
    );

  const minimumFee =
    Number(
      process.env.CRYPTO_MIN_FEE
    );

  const feeRate =
    Number.isFinite(rate) &&
    rate >= 0
      ? rate
      : 0.01;

  const minFee =
    Number.isFinite(minimumFee) &&
    minimumFee >= 0
      ? minimumFee
      : 0.10;

  const percentageFee =
    numericAmount * feeRate;

  return Math.max(
    minFee,
    percentageFee
  );
};


// ======================================================
// FEE RATE
// ======================================================

const getFeeRate = (method) => {
  const normalized =
    String(method || "")
      .toLowerCase()
      .trim();

  if (
    normalized === "crypto" ||
    normalized === "cryptocurrency" ||
    normalized === "blockchain" ||
    normalized === "nowpayments"
  ) {
    return Number(
      process.env.CRYPTO_FEE_RATE
    ) || 0.01;
  }

  if (
    normalized === "paypal" ||
    normalized === "bank" ||
    normalized === "bank_transfer" ||
    normalized === "stripe"
  ) {
    return 0.035;
  }

  if (
    normalized === "internal" ||
    normalized === "transfer"
  ) {
    return 0.0001;
  }

  return 0.035;
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
  calculateInternalFee,
  calculateExternalFee,
  calculateCryptoFee,
  getFeeRate,
};