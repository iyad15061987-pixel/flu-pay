"use client";

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: 600,
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
            fontSize: 22,
            color: "#cbd5e1",
            marginBottom: 40,
          }}
        >
          Modern Digital Wallet System
        </p>

        <div
          style={{
            display: "flex",
            gap: 20,
            justifyContent: "center",
          }}
        >
          <a href="/login">
            <button
              style={{
                padding: "15px 35px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: 10,
                fontSize: 18,
                cursor: "pointer",
              }}
            >
              Login
            </button>
          </a>

          <a href="/register">
            <button
              style={{
                padding: "15px 35px",
                background: "#16a34a",
                color: "white",
                border: "none",
                borderRadius: 10,
                fontSize: 18,
                cursor: "pointer",
              }}
            >
              Create Account
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}