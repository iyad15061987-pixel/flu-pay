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

const User =
  require(
    "../models/User"
  );

const sendMail =
  require(
    "../utils/sendMail"
  );

const generateInvoicePdf =
  require(
    "../utils/generateInvoicePdf"
  );

const crypto =
  require("crypto");

// =========================
// CREATE INVOICE
// =========================

router.post(
  "/merchant/invoices",

  auth,

  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.user.id
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      // =========================
      // VALIDATION
      // =========================

      const {
        customerEmail,
        amount,
        currency,
        description,
      } = req.body;

      if (
        !customerEmail ||
        !amount
      ) {
        return res.status(400).json({
          message:
            "Missing required fields",
        });
      }

      // =========================
      // TOKEN
      // =========================

      const token =
        crypto
          .randomBytes(16)
          .toString("hex");

      const paymentLink =
        `http://localhost/pay/${token}`;

      // =========================
      // CREATE INVOICE
      // =========================

      const invoice =
        await Invoice.create({
          merchantId:
            user._id,

          merchantEmail:
            user.email,

          customerEmail,

          amount,

          currency:
            currency ||
            "USD",

          description,

          paymentLink,

          token,
        });

      // =========================
      // SEND EMAIL
      // =========================

      try {
        await sendMail({
          to:
            customerEmail,

          subject:
            "FlowPay Invoice",

          text:
            `You received a payment request.\n\nAmount: $${amount}\n\nDescription: ${description || "No description"}\n\nPay here:\n${paymentLink}`,
        });

      } catch (mailErr) {
        console.log(
          "Mail error:",
          mailErr.message
        );
      }

      // =========================
      // RESPONSE
      // =========================

      res.json(invoice);

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
// LIST INVOICES
// =========================

router.get(
  "/merchant/invoices",

  auth,

  async (req, res) => {
    try {
      const invoices =
        await Invoice.find({
          merchantId:
            req.user.id,
        }).sort({
          createdAt: -1,
        });

      res.json(invoices);

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
// GET INVOICE BY TOKEN
// =========================

router.get(
  "/merchant/invoice/:token",

  async (req, res) => {
    try {
      const invoice =
        await Invoice.findOne({
          token:
            req.params
              .token,
        });

      if (!invoice) {
        return res.status(404).json({
          message:
            "Invoice not found",
        });
      }

      res.json(invoice);

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
// MARK INVOICE AS PAID
// =========================

router.post(
  "/merchant/pay/:token",

  async (req, res) => {
    try {
      const invoice =
        await Invoice.findOne({
          token:
            req.params
              .token,
        });

      if (!invoice) {
        return res.status(404).json({
          message:
            "Invoice not found",
        });
      }

      if (
        invoice.status ===
        "paid"
      ) {
        return res.status(400).json({
          message:
            "Invoice already paid",
        });
      }

      // =========================
      // MERCHANT
      // =========================

      const merchant =
        await User.findById(
          invoice.merchantId
        );

      if (!merchant) {
        return res.status(404).json({
          message:
            "Merchant not found",
        });
      }

      // =========================
      // CREDIT BALANCE
      // =========================

      merchant.balance +=
        invoice.amount;

      await merchant.save();

      // =========================
      // UPDATE INVOICE
      // =========================

      invoice.status =
        "paid";

      invoice.paidAt =
        new Date();

      await invoice.save();

      // =========================
      // REALTIME EVENT
      // =========================

      if (global.io) {
        global.io.emit(
          "invoice_paid",

          {
            invoiceId:
              invoice._id,

            merchant:
              merchant.email,

            amount:
              invoice.amount,
          }
        );
      }

      console.log(
        `💰 Invoice paid: ${invoice._id}`
      );

      // =========================
      // RESPONSE
      // =========================

      res.json({
        message:
          "Payment completed",

        invoice,
      });

    } catch (err) {
      console.log(err);

      res.status(500).json({
        message:
          "Payment error",
      });
    }
  }
);

// =========================
// DOWNLOAD PDF
// =========================

router.get(
  "/merchant/invoice-pdf/:id",

  auth,

  async (req, res) => {
    try {
      const invoice =
        await Invoice.findById(
          req.params.id
        );

      if (!invoice) {
        return res.status(404).json({
          message:
            "Invoice not found",
        });
      }

      generateInvoicePdf(
        invoice,
        res
      );

    } catch (err) {
      console.log(err);

      res.status(500).json({
        message:
          "PDF generation failed",
      });
    }
  }
);

module.exports =
  router;