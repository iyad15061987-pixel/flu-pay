"use client";

import Link from "next/link";

export default function Sidebar() {
  const role =
    typeof window !==
      "undefined" &&
    localStorage.getItem(
      "role"
    );

  return (
    <div
      style={{
        width: 250,
        height: "100vh",
        background: "#111827",
        color: "white",
        padding: 25,
        position: "fixed",
        left: 0,
        top: 0,
      }}
    >
      <h1
        style={{
          marginBottom: 40,
        }}
      >
        🚀 FlowPay
      </h1>

      <nav
        style={{
          display: "flex",
          flexDirection:
            "column",
          gap: 15,
        }}
      >
        <Link
          href="/dashboard"
          style={{
            color: "white",
            textDecoration:
              "none",
          }}
        >
          🏠 Dashboard
        </Link>

        <Link
          href="/deposit"
          style={{
            color: "white",
            textDecoration:
              "none",
          }}
        >
          🏦 Deposit
        </Link>

        <Link
          href="/withdraw"
          style={{
            color: "white",
            textDecoration:
              "none",
          }}
        >
          💸 Withdraw
        </Link>

        <Link
          href="/profile"
          style={{
            color: "white",
            textDecoration:
              "none",
          }}
        >
          👤 Profile
        </Link>

        <Link
          href="/settings"
          style={{
            color: "white",
            textDecoration:
              "none",
          }}
        >
          <Link
  href="/requests"
  style={{
    color: "white",
    textDecoration:
      "none",
  }}
>
  📋 My Requests
<Link
  href="/notifications"
  style={{
    color: "white",
    textDecoration:
      "none",
  }}
>
  🔔 Notifications

</Link>
          ⚙ Settings
        </Link>

        {role ===
          "admin" && (
          <Link
            href="/admin"
            style={{
              color: "#22c55e",
              textDecoration:
                "none",
              fontWeight:
                "bold",
            }}
          >
            🛡 Admin Panel
          </Link>
        )}
      </nav>
    </div>
  );
}