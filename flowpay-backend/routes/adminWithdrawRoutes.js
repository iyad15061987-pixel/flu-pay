const allowRoles =
  require(
    "../middleware/roles"
  );

const express =
  require("express");

const axios =
  require("axios");

const router =
  express.Router();

const adminAuth =
  require(
    "../middleware/adminAuth"
  );

const WithdrawalRequest =
  require(
    "../models/WithdrawalRequest"
  );

// =========================
// GET PENDING
// =========================

router.get(
  "/admin/pending-withdrawals",

  adminauth,

  adminOnly,

  async (req, res) => {
    try {
      const requests =
        await WithdrawalRequest.find(
          {
            status:
              "Pending",
          }
        ).sort({
          createdAt: -1,
        });

      res.json(
        requests
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

// =========================
// APPROVE WITHDRAW
// =========================

router.post(
  "/admin/approve-withdrawal",

  adminAuth,

  allowRoles(
  "SuperAdmin",
  "Treasury"
),

  async (req, res) => {
    try {
      const {
        withdrawalId,
      } = req.body;

      const request =
        await WithdrawalRequest.findById(
          withdrawalId
        );

      if (!request) {
        return res.status(404).json({
          message:
            "Request not found",
        });
      }

      if (
        request.approvedBy.includes(
          req.user.email
        )
      ) {
        return res.status(400).json({
          message:
            "Already approved",
        });
      }

      request.approvals +=
        1;

      request.approvedBy.push(
        req.user.email
      );

      // =========================
      // MULTI SIG
      // =========================

      if (
        request.approvals >=
        2
      ) {
        const payout =
          await axios.post(
            "https://api.nowpayments.io/v1/payout",

            {
              withdrawals: [
                {
                  address:
                    request.address,

                  currency:
                    request.currency,

                  amount:
                    request.amount -
                    request.fee,

                  userData:
                    request.email,
                },
              ],
            },

            {
              headers: {
                "x-api-key":
                  process
                    .env
                    .NOWPAYMENTS_API_KEY,

                "Content-Type":
                  "application/json",
              },
            }
          );

        request.status =
          "Approved";

        request.txHash =
          JSON.stringify(
            payout.data
          );
      }

      await request.save();

      res.json({
        message:
          request.approvals >=
          2
            ? "Withdrawal approved and sent"
            : "First approval completed",
      });

    } catch (err) {
      console.log(
        err.response?.data ||
          err
      );

      res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);

module.exports =
  router;