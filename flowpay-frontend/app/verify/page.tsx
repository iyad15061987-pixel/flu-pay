"use client";

import {
  useState,
} from "react";

import API_URL from "@/lib/api";

export default function VerifyPage() {
  const [email, setEmail] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const verifyEmail =
    async () => {
      try {
        setLoading(true);

        const res =
          await fetch(
            `${API_URL}/verify-email`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                email,
                otp,
              }),
            }
          );

        const data =
          await res.json();

        alert(data.message);

        if (
          data.message ===
          "Email verified successfully"
        ) {
          window.location.href =
            "/login";
        }

      } catch (err) {
        console.log(err);

        alert(
          "Server error"
        );

      } finally {
        setLoading(false);
      }
    };

  return (
    <div
      style={{
        minHeight: "100vh",

        background:
          "#0f172a",

        display: "flex",

        justifyContent:
          "center",

        alignItems:
          "center",

        fontFamily:
          "Arial",
      }}
    >
      <div
        style={{
          background:
            "white",

          padding: 40,

          borderRadius: 20,

          width: 400,
        }}
      >
        <h1
          style={{
            textAlign:
              "center",

            marginBottom: 30,
          }}
        >
          Verify Email
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
          style={{
            width: "100%",

            padding: 15,

            marginBottom: 20,

            borderRadius: 10,

            border:
              "1px solid #d1d5db",
          }}
        />

        <input
          type="text"
          placeholder="OTP Code"
          value={otp}
          onChange={(e) =>
            setOtp(
              e.target.value
            )
          }
          style={{
            width: "100%",

            padding: 15,

            marginBottom: 20,

            borderRadius: 10,

            border:
              "1px solid #d1d5db",
          }}
        />

        <button
          onClick={
            verifyEmail
          }
          disabled={loading}
          style={{
            width: "100%",

            padding: 15,

            background:
              "#2563eb",

            color: "white",

            border: "none",

            borderRadius: 10,

            cursor:
              "pointer",

            fontSize: 16,

            fontWeight:
              "bold",
          }}
        >
          {loading
            ? "Verifying..."
            : "Verify Email"}
        </button>
      </div>
    </div>
  );
}