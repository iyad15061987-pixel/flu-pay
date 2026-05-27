const PDFDocument =
  require("pdfkit");

module.exports =
  (invoice, res) => {
    const doc =
      new PDFDocument();

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",

      `inline; filename=invoice-${invoice._id}.pdf`
    );

    doc.pipe(res);

    // =========================
    // HEADER
    // =========================

    doc
      .fontSize(28)
      .text(
        "FlowPay Invoice",
        {
          align:
            "center",
        }
      );

    doc.moveDown();

    // =========================
    // DETAILS
    // =========================

    doc
      .fontSize(16)
      .text(
        `Invoice ID: ${invoice._id}`
      );

    doc.text(
      `Merchant: ${invoice.merchantEmail}`
    );

    doc.text(
      `Customer: ${invoice.customerEmail}`
    );

    doc.text(
      `Amount: $${invoice.amount}`
    );

    doc.text(
      `Currency: ${invoice.currency}`
    );

    doc.text(
      `Status: ${invoice.status}`
    );

    doc.text(
      `Created: ${invoice.createdAt}`
    );

    if (
      invoice.paidAt
    ) {
      doc.text(
        `Paid At: ${invoice.paidAt}`
      );
    }

    doc.moveDown();

    doc
      .fontSize(18)
      .text(
        "Description"
      );

    doc
      .fontSize(14)
      .text(
        invoice.description ||
          "No description"
      );

    doc.moveDown(2);

    // =========================
    // FOOTER
    // =========================

    doc
      .fontSize(12)
      .text(
        "Powered by FlowPay",
        {
          align:
            "center",
        }
      );

    doc.end();
  };