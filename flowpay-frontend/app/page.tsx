"use client";

export default function HomePage() {
  return (
    <div
      style={{
        background:
          "#0f172a",

        minHeight:
          "100vh",

        color: "white",

        display: "flex",

        flexDirection:
          "column",

        justifyContent:
          "center",

        alignItems:
          "center",

        padding: 30,

        textAlign:
          "center",
      }}
    >
      <h1
        style={{
          fontSize: 60,

          marginBottom: 20,
        }}
      >
        🚀 FlowPay
      </h1>

      <p
        style={{
          maxWidth: 700,

          fontSize: 20,

          lineHeight: 1.7,

          marginBottom: 40,
        }}
      >
        Modern Digital Wallet
        Platform with Crypto,
        PayPal, Internal
        Transfers, Analytics,
        Notifications and
        Smart Financial
        Management.
      </p>

      <div
        style={{
          display: "flex",

          gap: 20,

          flexWrap: "wrap",

          justifyContent:
            "center",
        }}
      >
        <a
          href="/register"
          style={{
            padding:
              "15px 30px",

            background:
              "#16a34a",

            borderRadius: 15,

            color: "white",

            textDecoration:
              "none",

            fontWeight:
              "bold",
          }}
        >
          Create Account
        </a>

        <a
          href="/login"
          style={{
            padding:
              "15px 30px",

            background:
              "#2563eb",

            borderRadius: 15,

            color: "white",

            textDecoration:
              "none",

            fontWeight:
              "bold",
          }}
        >
          Login
        </a>
      </div>

      <br />
      <br />

      <div
        style={{
          display: "grid",

          gridTemplateColumns:
            "repeat(auto-fit,minmax(250px,1fr))",

          gap: 20,

          width: "100%",

          maxWidth: 1000,
        }}
      >
        {[
          "💸 Instant Transfers",
          "🪙 Crypto Wallets",
          "📈 Analytics",
          "🔔 Notifications",
          "🌍 Multi Currency",
          "🧾 Receipts",
        ].map((item) => (
          <div
            key={item}
            style={{
              background:
                "#111827",

              padding: 25,

              borderRadius: 20,
            }}
          >
            <h2>{item}</h2>
          </div>
        ))}
      </div>

      <br />
      <br />

      <p
        style={{
          opacity: 0.7,
        }}
      >
        © 2026 FlowPay Wallet
      </p>
    </div>
  );
}