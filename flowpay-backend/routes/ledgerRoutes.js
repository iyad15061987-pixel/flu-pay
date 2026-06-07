const express =
  require("express");

const router =
  express.Router();

const {
  auth,
  adminOnly,
} = require(
  "../middleware/auth"
);

const LedgerEntry =
  require(
    "../models/LedgerEntry"
  );

// =========================
// GET USER LEDGER
// =========================

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

      return res.json(
        entries
      );

    } catch (err) {

      console.log(err);

      return res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);

module.exports =
  router;