const express =
  require("express");

const PDFDocument =
  require("pdfkit");

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

router.get(
  "/payment-links/:id/pdf",

  auth,

  async (req, res) => {
    try {

      const invoice =
        await PaymentLink.findOne({
          _id:
            req.params.id,

          userId:
            req.user.id,
        });

      if (!invoice) {

        return res.status(404).json({
          message:
            "Invoice not found",
        });
      }

      const doc =
        new PDFDocument();

      res.setHeader(
        "Content-Type",
        "application/pdf"
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`
      );

      doc.pipe(res);

      doc.fontSize(24);
      doc.text(
        "FlowPay Invoice"
      );

      doc.moveDown();

      doc.fontSize(14);

      doc.text(
        `Invoice Number: ${invoice.invoiceNumber}`
      );

      doc.text(
        `Customer: ${invoice.customerName || "-"}`
      );

      doc.text(
        `Email: ${invoice.customerEmail || "-"}`
      );

      doc.text(
        `Amount: $${invoice.amount}`
      );

      doc.text(
        `Status: ${invoice.status}`
      );

      doc.text(
        `Created: ${new Date(invoice.createdAt).toLocaleString()}`
      );

      if (
        invoice.paidAt
      ) {
        doc.text(
          `Paid At: ${new Date(invoice.paidAt).toLocaleString()}`
        );
      }

      doc.moveDown();

      doc.text(
        `Description: ${invoice.description || "-"}`
      );

      doc.end();

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