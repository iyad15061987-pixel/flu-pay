const express =
  require("express");

const router =
  express.Router();

const {
  auth,
} = require(
  "../middleware/auth"
);

const ExchangeRate =
  require(
    "../models/ExchangeRate"
  );

router.get(
  "/exchange-rates",

  auth,

  adminOnly,

  async (req, res) => {
    try {
      const rates =
        await ExchangeRate.find();

      res.json(
        rates
      );

    } catch (err) {
      console.log(err);

      res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);

module.exports =
  router;