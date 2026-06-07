"use client";

import {
  useState,
} from "react";

import API_URL from "@/lib/api";

export default function LoginPage() {

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [twoFactorCode, setTwoFactorCode] =
    useState("");

  const [requires2FA, setRequires2FA] =
    useState(false);

  const [tempUserId, setTempUserId] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // =========================
  // LOGIN
  // =========================

  const handleLogin =
    async () => {

      try {

        setLoading(true);

        const res =
          await fetch(
            `${API_URL}/login`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                email,
                password,
              }),
            }
          );

        const data =
          await res.json();

        // =========================
        // 2FA REQUIRED
        // =========================

        if (
          data.requiresTwoFactor
        ) {

          setRequires2FA(
            true
          );

          setTempUserId(
            data.userId
          );

          setLoading(false);

          return;

        }

        // =========================
        // SUCCESS LOGIN
        // =========================

        if (data.token) {

          completeLogin(
            data
          );

        } else {

          alert(
            data.message ||
              "Login failed"
          );

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

  // =========================
  // VERIFY 2FA LOGIN
  // =========================

  const verify2FA =
    async () => {

      try {

        setLoading(true);

        const res =
          await fetch(
            `${API_URL}/2fa/login`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                userId:
                  tempUserId,

                token:
                  twoFactorCode,
              }),
            }
          );

        const data =
          await res.json();

        if (data.token) {

          completeLogin(
            data
          );

        } else {

          alert(
            data.message ||
              "Invalid 2FA code"
          );

        }

      } catch (err) {

        console.log(err);

        alert(
          "2FA verification failed"
        );

      } finally {

        setLoading(false);

      }

    };

  // =========================
  // COMPLETE LOGIN
  // =========================

  const completeLogin =
    (data: any) => {

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "userId",
        data.userId
      );

      localStorage.setItem(
        "email",
        data.email
      );

      localStorage.setItem(
        "role",
        data.role
      );

      alert(
        "Login successful"
      );

      if (
        data.role ===
        "admin"
      ) {

        window.location.href =
          "/admin";

      } else {

        window.location.href =
          "/dashboard";

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

          borderRadius: 15,

          width: 420,

          boxShadow:
            "0 0 20px rgba(0,0,0,0.2)",
        }}
      >

        <h1
          style={{
            textAlign:
              "center",

            marginBottom: 30,
          }}
        >

          {requires2FA
            ? "🔐 Two-Factor Authentication"
            : "🏦 FlowPay Login"}

        </h1>

        {/* ========================= */}
        {/* NORMAL LOGIN */}
        {/* ========================= */}

        {!requires2FA && (

          <>

            {/* EMAIL */}

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

                padding: 12,

                marginBottom: 20,

                borderRadius: 10,

                border:
                  "1px solid #d1d5db",
              }}
            />

            {/* PASSWORD */}

            <input
              type="password"

              placeholder="Password"

              value={password}

              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }

              style={{
                width: "100%",

                padding: 12,

                marginBottom: 20,

                borderRadius: 10,

                border:
                  "1px solid #d1d5db",
              }}
            />

            {/* LOGIN BUTTON */}

            <button
              onClick={
                handleLogin
              }

              disabled={
                loading
              }

              style={{
                width: "100%",

                padding: 15,

                background:
                  loading
                    ? "#9ca3af"
                    : "#2563eb",

                color:
                  "white",

                border:
                  "none",

                borderRadius:
                  10,

                cursor:
                  loading
                    ? "not-allowed"
                    : "pointer",

                fontSize: 16,

                fontWeight:
                  "bold",
              }}
            >

              {loading
                ? "Logging in..."
                : "Login"}

            </button>

          </>

        )}

        {/* ========================= */}
        {/* 2FA SCREEN */}
        {/* ========================= */}

        {requires2FA && (

          <>

            <p
              style={{
                marginBottom: 20,

                textAlign:
                  "center",

                color:
                  "#374151",
              }}
            >

              Enter the 6-digit code from your Google Authenticator app.

            </p>

            {/* OTP */}

            <input
              type="text"

              placeholder="123456"

              value={
                twoFactorCode
              }

              onChange={(e) =>
                setTwoFactorCode(
                  e.target.value
                )
              }

              maxLength={6}

              style={{
                width: "100%",

                padding: 15,

                marginBottom: 20,

                borderRadius: 10,

                border:
                  "1px solid #d1d5db",

                textAlign:
                  "center",

                fontSize: 22,

                letterSpacing: 6,

                fontWeight:
                  "bold",
              }}
            />

            {/* VERIFY BUTTON */}

            <button
              onClick={
                verify2FA
              }

              disabled={
                loading
              }

              style={{
                width: "100%",

                padding: 15,

                background:
                  loading
                    ? "#9ca3af"
                    : "#16a34a",

                color:
                  "white",

                border:
                  "none",

                borderRadius:
                  10,

                cursor:
                  loading
                    ? "not-allowed"
                    : "pointer",

                fontSize: 16,

                fontWeight:
                  "bold",
              }}
            >

              {loading
                ? "Verifying..."
                : "Verify 2FA"}

            </button>

            <br />
            <br />

            {/* BACK BUTTON */}

            <button
              onClick={() => {

                setRequires2FA(
                  false
                );

                setTwoFactorCode(
                  ""
                );

              }}

              style={{
                width: "100%",

                padding: 12,

                background:
                  "#6b7280",

                color:
                  "white",

                border:
                  "none",

                borderRadius:
                  10,

                cursor:
                  "pointer",
              }}
            >
              Back
            </button>

          </>

        )}

        <br />
        <br />

        {/* REGISTER */}

        {!requires2FA && (

          <button
            onClick={() => {

              window.location.href =
                "/register";

            }}

            style={{
              width: "100%",

              padding: 12,

              background:
                "#16a34a",

              color:
                "white",

              border:
                "none",

              borderRadius:
                10,

              cursor:
                "pointer",
            }}
          >
            Create Account
          </button>

        )}

      </div>

    </div>
  );
}