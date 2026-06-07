"use client";

import {
  useState,
} from "react";

import API_URL from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const sendReset =
    async () => {
      try {
        setLoading(true);

        const res =
          await fetch(
            `${API_URL}/forgot-password`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                email,
              }),
            }
          );

        const data =
          await res.json();

        alert(data.message);

        if (
          data.message ===
          "Password reset code sent"
        ) {
          localStorage.setItem(
            "resetEmail",
            email
          );

          window.location.href =
            "/reset-password";
        }

      } catch (err) {
        console.log(err);

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
        <h1>
          Forgot Password
        </h1>

        <br />

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
          }}
        />

        <button
          onClick={
            sendReset
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
          }}
        >
          {loading
            ? "Sending..."
            : "Send Reset Code"}
        </button>
      </div>
    </div>
  );
}