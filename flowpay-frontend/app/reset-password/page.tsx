"use client";

import {
  useState,
} from "react";

import API_URL from "@/lib/api";

export default function ResetPasswordPage() {
  const [otp, setOtp] =
    useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  const resetPassword =
    async () => {
      try {
        setLoading(true);

        const email =
          localStorage.getItem(
            "resetEmail"
          );

        const res =
          await fetch(
            `${API_URL}/reset-password`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                email,
                otp,
                newPassword,
              }),
            }
          );

        const data =
          await res.json();

        alert(data.message);

        if (
          data.message ===
          "Password reset successfully"
        ) {
          window.location.href =
            "/login";
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
          Reset Password
        </h1>

        <br />

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
          }}
        />

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) =>
            setNewPassword(
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
            resetPassword
          }
          disabled={loading}
          style={{
            width: "100%",

            padding: 15,

            background:
              "#16a34a",

            color: "white",

            border: "none",

            borderRadius: 10,
          }}
        >
          {loading
            ? "Resetting..."
            : "Reset Password"}
        </button>
      </div>
    </div>
  );
}