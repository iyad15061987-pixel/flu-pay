export default function ContactPage() {
  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "40px auto",
        padding: "50px",
        background: "#ffffff",
        color: "#111827",
        borderRadius: "16px",
        lineHeight: "1.8",
        boxShadow:
          "0 2px 12px rgba(0,0,0,0.08)",
      }}
    >
      <h1>Contact Us</h1>

      <p style={{ color: "#6b7280", marginBottom: "30px" }}>
        Last Updated: June 2026
      </p>

      <h2>Customer Support</h2>

      <p>
        Our support team is available to assist
        with account issues, deposits, withdrawals,
        virtual cards, payment links, and compliance
        inquiries.
      </p>

      <h2>Email Support</h2>

      <p>
        support@flowpay.com
      </p>

      <h2>Compliance Department</h2>

      <p>
        compliance@flowpay.com
      </p>

      <h2>Response Times</h2>

      <p>
        Most inquiries are reviewed within
        1–3 business days.
      </p>

      <hr style={{ margin: "40px 0" }} />

      <p style={{ color: "#6b7280" }}>
        Operated by Global Mercy Foundation.
      </p>
    </div>
  );
}