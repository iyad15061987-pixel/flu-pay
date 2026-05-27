const express =
  require("express");

const router =
  express.Router();

const {
  auth,
} = require(
  "../middleware/auth"
);

const Invoice =
  require(
    "../models/Invoice"
  );

// =========================
// MERCHANT ANALYTICS
// =========================

router.get(
  "/merchant/analytics",

  auth,

  adminOnly,

  async (req, res) => {
    try {
      const invoices =
        await Invoice.find({
          merchantId:
            req.user.id,
        });

      let totalRevenue = 0;

      let paidRevenue = 0;

      let pendingRevenue = 0;

      let paidCount = 0;

      let pendingCount = 0;

      invoices.forEach(
        (invoice) => {
          totalRevenue +=
            invoice.amount || 0;

          if (
            invoice.status ===
            "paid"
          ) {
            paidRevenue +=
              invoice.amount || 0;

            paidCount++;

          } else {
            pendingRevenue +=
              invoice.amount || 0;

            pendingCount++;
          }
        }
      );

      const successRate =
        invoices.length > 0
          ? (
              (paidCount /
                invoices.length) *
              100
            ).toFixed(2)
          : 0;

      res.json({
        totalInvoices:
          invoices.length,

        totalRevenue,

        paidRevenue,

        pendingRevenue,

        paidCount,

        pendingCount,

        successRate,
      });

    } catch (err) {
      console.log(err);

      res.status(500).json({
        message:
          "Analytics error",
      });
    }
  }
);

module.exports =
  router;