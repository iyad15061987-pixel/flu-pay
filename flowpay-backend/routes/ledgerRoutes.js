const express =
  require("express");

const router =
  express.Router();

const {
  auth,
} = require(
  "../middleware/auth"
);

const LedgerEntry =
  require(
    "../models/LedgerEntry"
  );

router.get(
  "/ledger/:email",

  auth,

  adminOnly,

  async (req, res) => {
    try {
      const entries =
        await LedgerEntry.find({
          email:
            req.params.email,
        }).sort({
          createdAt: -1,
        });

      res.json(
        entries
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