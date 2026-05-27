const axios =
  require("axios");

// =========================
// STATIC RATES
// =========================

global.exchangeRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  SAR: 3.75,
  AED: 3.67,
};

// =========================
// UPDATE RATES
// =========================

const updateRates =
  async () => {
    try {
      const res =
        await axios.get(
          "https://open.er-api.com/v6/latest/USD",
          {
            timeout: 5000,
          }
        );

      if (
        res.data &&
        res.data.rates
      ) {
        global.exchangeRates =
          res.data.rates;

        console.log(
          "✅ Exchange rates updated"
        );
      }

    } catch (err) {
      console.log(
        "⚠️ Exchange rate update failed"
      );

      console.log(
        err.message
      );
    }
  };

module.exports =
  updateRates;