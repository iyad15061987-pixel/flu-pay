const express =
  require("express");

const crypto =
  require("crypto");

const router =
  express.Router();

const {
  auth,
} = require(
  "../middleware/auth"
);

const PaymentLink =
  require(
    "../models/PaymentLink"
  );

const User =
  require(
    "../models/User"
  );

  const Notification =
  require(
    "../models/Notification"
  );

const Transaction =
  require(
    "../models/Transaction"
  );

  const createLedgerEntry =
  require(
    "../utils/ledger"
  );

// =========================
// CREATE PAYMENT LINK
// =========================

router.post(
  "/payment-links",

  auth,

  async (req, res) => {
    try {

const {
  title,
  amount,
  description,
  customerName,
  customerEmail,
  dueDate,
} = req.body;


      const code =
        crypto
          .randomBytes(8)
          .toString("hex");

          const invoiceNumber =
  "INV-" +
  Date.now();

  const link =
  await PaymentLink.create({
    userId:
      req.user.id,

    email:
      req.user.email,

    invoiceNumber,

    customerName,

    customerEmail,

    dueDate,

    title,

    amount,

    description,

    code,
  });

      return res.json(
        link
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
// MY PAYMENT LINKS
// =========================

router.get(
  "/payment-links",

  auth,

  async (req, res) => {
    try {

      const links =
        await PaymentLink.find({
          userId:
            req.user.id,
        }).sort({
          createdAt: -1,
        });

      return res.json(
        links
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
// PUBLIC PAYMENT LINK
// =========================

router.get(
  "/pay/:code",

  async (req, res) => {
    try {

      const link =
        await PaymentLink.findOne({
          code:
            req.params.code,
        });

       if (!link) {

  return res.status(404).json({
    message:
      "Link not found",
  });
}

if (
  !link.active
) {

  return res.status(400).json({
    message:
      "Payment link disabled",
  });
}

      return res.json(
        link
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
// COMPLETE PAYMENT
// =========================

router.post(
  "/pay/:code/complete",

  async (req, res) => {
    try {

      const link =
        await PaymentLink.findOneAndUpdate(
          {
            code:
              req.params.code,

            status: {
              $ne: "paid",
            },
          },
          {
            $set: {
              status:
                "paid",

              paidAt:
                new Date(),
            },
          },
          {
            new: true,
          }
        );

      if (!link) {

        return res.status(400).json({
          message:
            "Payment already completed or not found",
        });

      }

      const merchant =
        await User.findById(
          link.userId
        );

      if (!merchant) {

        return res.status(404).json({
          message:
            "Merchant not found",
        });

      }
const beforeBalance =
  merchant.balance;

merchant.balance +=
  Number(
    link.amount
  );

await merchant.save();

link.status =
  "paid";

link.paidAt =
  new Date();

await link.save();

await createLedgerEntry({
  userId:
    merchant._id,

  email:
    merchant.email,

  type:
    "Payment Link",
amount:
  Number(
    link.amount
  ),

fee: 0,

netAmount:
  Number(
    link.amount
  ),

type:
  "payment_link",

method:
  "paypal",

reference:
  link.code,

status:
  "completed",
});

return res.json({
  success: true,

  message:
    "Payment completed",
});

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
// PAYMENT LINKS ANALYTICS
// =========================

router.get(
  "/payment-links/stats",

  auth,

  async (req, res) => {
    try {

      const links =
        await PaymentLink.find({
          userId:
            req.user.id,
        });

      const totalLinks =
        links.length;

      const paidLinks =
        links.filter(
          (l) =>
            l.status ===
            "paid"
        ).length;

      const pendingLinks =
        links.filter(
          (l) =>
            l.status !==
            "paid"
        ).length;

      const revenue =
        links
          .filter(
            (l) =>
              l.status ===
              "paid"
          )
          .reduce(
            (
              total,
              link
            ) =>
              total +
              Number(
                link.amount
              ),
            0
          );

      return res.json({
        totalLinks,
        paidLinks,
        pendingLinks,
        revenue,
      });

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
// TOGGLE PAYMENT LINK
// =========================

router.post(
  "/payment-links/:id/toggle",

  auth,

  async (req, res) => {

    try {

      const link =
        await PaymentLink.findOne({
          _id:
            req.params.id,

          userId:
            req.user.id,
        });

      if (!link) {

        return res.status(404).json({
          message:
            "Payment link not found",
        });
      }

      link.active =
        !link.active;

      await link.save();

      return res.json({
        success: true,
        active:
          link.active,
      });

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
// REFUND PAYMENT
// =========================

router.post(
  "/payment-links/:id/refund",

  auth,

  async (req, res) => {

    try {

      const link =
        await PaymentLink.findOne({
          _id:
            req.params.id,

          userId:
            req.user.id,
        });

      if (!link) {

        return res.status(404).json({
          message:
            "Invoice not found",
        });
      }

      if (
        link.status !==
        "paid"
      ) {

        return res.status(400).json({
          message:
            "Only paid invoices can be refunded",
        });
      }

      const merchant =
        await User.findById(
          link.userId
        );

      if (!merchant) {

        return res.status(404).json({
          message:
            "Merchant not found",
        });
      }

      if (
        merchant.balance <
        link.amount
      ) {

        return res.status(400).json({
          message:
            "Insufficient balance for refund",
        });
      }

      merchant.balance -=
        Number(
          link.amount
        );

      await merchant.save();

      link.status =
        "refunded";

      await link.save();

      await Transaction.create({
        fromEmail:
          merchant.email,

        toEmail:
          "refund",

        amount:
          Number(
            link.amount
          ),

        fee: 0,

        netAmount:
          Number(
            link.amount
          ),

        type:
          "refund",

        method:
          "payment_link",

        reference:
          link.code,

        status:
          "completed",
      });

      await Notification.create({
        email:
          merchant.email,

        title:
          "↩️ Refund Issued",

        message:
          `Refund completed for invoice ${link.invoiceNumber}`,
      });

      return res.json({
        success: true,
        message:
          "Refund completed",
      });

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