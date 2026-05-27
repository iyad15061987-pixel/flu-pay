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

const FraudLog =
  require(
    "../models/FraudLog"
  );

const Transaction =
  require(
    "../models/Transaction"
  );

// =========================
// FRAUD LOGS
// =========================

router.get(
  "/admin/fraud-logs",

  auth,

  adminOnly,

  async (req, res) => {
    try {

      const logs =
        await FraudLog.find()
          .sort({
            createdAt: -1,
          });

      return res.json(
        logs
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

// =========================
// LIVE FRAUD ALERTS
// =========================

router.get(
  "/admin/fraud-alerts",

  auth,

  adminOnly,

  async (req, res) => {
    try {

      const transactions =
        await Transaction.find()
          .sort({
            createdAt: -1,
          })
          .limit(500);

      const alerts = [];

      for (
        const tx of transactions
      ) {

        let riskScore = 0;

        let flags = [];

        // =========================
        // LARGE TRANSACTION
        // =========================

        if (
          tx.amount >= 10000
        ) {

          riskScore += 50;

          flags.push(
            "Large transaction"
          );
        }

        // =========================
        // VERY LARGE
        // =========================

        if (
          tx.amount >= 50000
        ) {

          riskScore += 80;

          flags.push(
            "Very large transaction"
          );
        }

        // =========================
        // RAPID TRANSFERS
        // =========================

        const rapidTransfers =
          await Transaction.countDocuments(
            {
              fromEmail:
                tx.fromEmail,

              createdAt: {
                $gte:
                  new Date(
                    Date.now() -
                      5 *
                        60 *
                        1000
                  ),
              },
            }
          );

        if (
          rapidTransfers >= 5
        ) {

          riskScore += 40;

          flags.push(
            "Rapid transfers"
          );
        }

        // =========================
        // BUILD ALERT
        // =========================

        if (
          riskScore > 0
        ) {

          alerts.push({
            transaction:
              tx,

            riskScore,

            flags,
          });
        }
      }

      return res.json(
        alerts
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