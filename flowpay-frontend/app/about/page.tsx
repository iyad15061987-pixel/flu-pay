export default function AboutPage() {
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
      <h1>About FlowPay</h1>

      <p style={{ color: "#6b7280", marginBottom: "30px" }}>
        Last Updated: June 2026
      </p>

      <h2>Our Mission</h2>

      <p>
        FlowPay was created to provide secure,
        transparent, and accessible financial
        technology services for individuals,
        businesses, and organizations worldwide.
      </p>

      <h2>What We Offer</h2>

      <ul>
        <li>Digital Wallet Services</li>
        <li>Account Funding and Withdrawals</li>
        <li>Virtual Cards</li>
        <li>Payment Links</li>
        <li>Peer-to-Peer Transfers</li>
        <li>Compliance and Security Controls</li>
      </ul>

      <h2>Security and Compliance</h2>

      <p>
        FlowPay utilizes KYC, AML, fraud
        prevention, transaction monitoring,
        and risk management procedures to
        maintain a secure platform.
      </p>

      <h2>Our Commitment</h2>

      <p>
        We are committed to innovation,
        transparency, customer protection,
        and continuous platform improvement.
      </p>

      <hr style={{ margin: "40px 0" }} />

      <p style={{ color: "#6b7280" }}>
        Operated by Global Mercy Foundation.
      </p>
    </div>
  );
}