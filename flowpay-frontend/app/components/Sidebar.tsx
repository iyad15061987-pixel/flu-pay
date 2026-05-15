"use client";

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import API_URL from "@/lib/api";

export default function Sidebar() {
  const role =
    typeof window !==
      "undefined" &&
    localStorage.getItem(
      "role"
    );

  const [
    notifications,
    setNotifications,
  ] = useState<any[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const email =
          localStorage.getItem(
            "email"
          );

        if (
          !token ||
          !email
        )
          return;

        const res =
          await fetch(
            `${API_URL}/notifications/${email}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        setNotifications(
          data || []
        );

      } catch (err) {
        console.log(err);
      }
    };

  return (
    <div
      style={{
        width: 250,
        height: "100vh",
        background:
          localStorage.getItem(
            "theme"
          ) === "light"
            ? "white"
            : "#111827",

        color:
          localStorage.getItem(
            "theme"
          ) === "light"
            ? "#111827"
            : "white",

        padding: 25,

        position: "fixed",

        left: 0,

        top: 0,

        overflowY: "auto",

        boxShadow:
          "0 0 10px rgba(0,0,0,0.1)",
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
            color:
              localStorage.getItem(
                "theme"
              ) ===
              "light"
                ? "#111827"
                : "white",

            textDecoration:
              "none",
          }}
        >
          🏠 Dashboard
        </Link>

        <Link
          href="/deposit"
          style={{
            color:
              localStorage.getItem(
                "theme"
              ) ===
              "light"
                ? "#111827"
                : "white",

            textDecoration:
              "none",
          }}
        >
          🏦 Deposit
        </Link>

        <Link
          href="/withdraw"
          style={{
            color:
              localStorage.getItem(
                "theme"
              ) ===
              "light"
                ? "#111827"
                : "white",

            textDecoration:
              "none",
          }}
        >
          💸 Withdraw
        </Link>

        <Link
          href="/requests"
          style={{
            color:
              localStorage.getItem(
                "theme"
              ) ===
              "light"
                ? "#111827"
                : "white",

            textDecoration:
              "none",
          }}
        >
          📋 My Requests
        </Link>

        <Link
          href="/notifications"
          style={{
            color:
              localStorage.getItem(
                "theme"
              ) ===
              "light"
                ? "#111827"
                : "white",

            textDecoration:
              "none",
          }}
        >
          🔔 Notifications (
          {
            notifications.length
          }
          )
        </Link>

        <Link
          href="/support"
          style={{
            color:
              localStorage.getItem(
                "theme"
              ) ===
              "light"
                ? "#111827"
                : "white",

            textDecoration:
              "none",
          }}
        >
          🆘 Support
        </Link>

        <Link
          href="/profile"
          style={{
            color:
              localStorage.getItem(
                "theme"
              ) ===
              "light"
                ? "#111827"
                : "white",

            textDecoration:
              "none",
          }}
        >
          👤 Profile
        </Link>

        <Link
          href="/settings"
          style={{
            color:
              localStorage.getItem(
                "theme"
              ) ===
              "light"
                ? "#111827"
                : "white",

            textDecoration:
              "none",
          }}
        >
          ⚙ Settings
        </Link>

        {role ===
          "admin" && (
          <Link
            href="/admin"
            style={{
              color:
                "#22c55e",

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