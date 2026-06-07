"use client";

import {
  useEffect,
  useState,
} from "react";

import Sidebar from "../components/Sidebar";

import API_URL from "@/lib/api";

export default function SettingsPage() {

  const [
    password,
    setPassword,
  ] = useState("");

  // =========================
  // 2FA
  // =========================

  const [
    twoFactorEnabled,
    setTwoFactorEnabled,
  ] = useState(false);

  const [
    qrCode,
    setQrCode,
  ] = useState("");

  const [
    twoFactorCode,
    setTwoFactorCode,
  ] = useState("");

  const [
    disablePassword,
    setDisablePassword,
  ] = useState("");

  // =========================
  // LOAD USER
  // =========================

  const loadUser =
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
        ) {

          window.location.href =
            "/login";

          return;

        }

        const res =
          await fetch(
            `${API_URL}/user/${email}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        setTwoFactorEnabled(
          data.twoFactorEnabled ||
            false
        );

      } catch (err) {

        console.log(err);

      }

    };

  // =========================
  // UPDATE PASSWORD
  // =========================

  const updatePassword =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/update-password`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                password,
              }),
            }
          );

        const data =
          await res.json();

        alert(
          data.message
        );

        setPassword("");

      } catch (err) {

        console.log(err);

      }

    };

  // =========================
  // SETUP 2FA
  // =========================

  const setup2FA =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/2fa/setup`,
            {
              method: "POST",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        setQrCode(
          data.qrCode
        );

      } catch (err) {

        console.log(err);

        alert(
          "Failed to setup 2FA"
        );

      }

    };

  // =========================
  // VERIFY 2FA
  // =========================

  const verify2FA =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/2fa/verify`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                token:
                  twoFactorCode,
              }),
            }
          );

        const data =
          await res.json();

        alert(
          data.message
        );

        if (
          data.message ===
          "2FA enabled successfully"
        ) {

          setTwoFactorEnabled(
            true
          );

          setQrCode("");

          setTwoFactorCode(
            ""
          );

        }

      } catch (err) {

        console.log(err);

        alert(
          "2FA verification failed"
        );

      }

    };

  // =========================
  // DISABLE 2FA
  // =========================

  const disable2FA =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/2fa/disable`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                password:
                  disablePassword,
              }),
            }
          );

        const data =
          await res.json();

        alert(
          data.message
        );

        if (
          data.message ===
          "2FA disabled successfully"
        ) {

          setTwoFactorEnabled(
            false
          );

          setDisablePassword(
            ""
          );

        }

      } catch (err) {

        console.log(err);

        alert(
          "Failed to disable 2FA"
        );

      }

    };

  // =========================
  // EFFECT
  // =========================

  useEffect(() => {

    loadUser();

  }, []);

  return (
    <div
      style={{
        display: "flex",

        background:
          "#0f172a",

        minHeight:
          "100vh",

        color:
          "white",
      }}
    >

      <Sidebar />

      <div
        style={{
          marginLeft: 250,

          padding: 40,

          width: "100%",
        }}
      >

        <h1>
          ⚙️ Settings
        </h1>

        <br />

        {/* ========================= */}
        {/* PASSWORD */}
        {/* ========================= */}

        <div
          style={{
            background:
              "#111827",

            padding: 30,

            borderRadius: 20,

            maxWidth: 700,

            marginBottom: 30,
          }}
        >

          <h2>
            🔑 Change Password
          </h2>

          <br />

          <input
            type="password"

            placeholder="New Password"

            value={password}

            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }

            style={{
              width: "100%",

              padding: 15,

              borderRadius: 12,

              border: "none",

              marginBottom: 20,
            }}
          />

          <button
            onClick={
              updatePassword
            }

            style={{
              width: "100%",

              padding: 15,

              background:
                "#2563eb",

              color: "white",

              border: "none",

              borderRadius: 12,

              cursor:
                "pointer",

              fontWeight:
                "bold",
            }}
          >
            Update Password
          </button>

        </div>

        {/* ========================= */}
        {/* 2FA */}
        {/* ========================= */}

        <div
          style={{
            background:
              "#111827",

            padding: 30,

            borderRadius: 20,

            maxWidth: 700,
          }}
        >

          <h2>
            🔐 Two-Factor Authentication
          </h2>

          <br />

          <p>
            Status:
            {" "}

            <strong
              style={{
                color:
                  twoFactorEnabled
                    ? "#16a34a"
                    : "#dc2626",
              }}
            >

              {twoFactorEnabled
                ? "Enabled"
                : "Disabled"}

            </strong>
          </p>

          <br />

          {/* ENABLE */}

          {!twoFactorEnabled && (

            <button
              onClick={
                setup2FA
              }

              style={{
                padding:
                  "12px 20px",

                background:
                  "#2563eb",

                color:
                  "white",

                border:
                  "none",

                borderRadius:
                  10,

                cursor:
                  "pointer",

                fontWeight:
                  "bold",
              }}
            >
              Enable 2FA
            </button>

          )}

          {/* QR */}

          {qrCode && (

            <div
              style={{
                marginTop: 30,
              }}
            >

              <h3>
                Scan QR Code
              </h3>

              <br />

              <img
                src={qrCode}
                alt="QR Code"

                style={{
                  width: 220,

                  background:
                    "white",

                  padding: 10,

                  borderRadius: 15,
                }}
              />

              <br />
              <br />

              <input
                type="text"

                placeholder="Enter 6-digit code"

                value={
                  twoFactorCode
                }

                onChange={(e) =>
                  setTwoFactorCode(
                    e.target.value
                  )
                }

                style={{
                  width: 300,

                  padding: 12,

                  borderRadius: 10,

                  border:
                    "none",

                  marginBottom: 15,
                }}
              />

              <br />

              <button
                onClick={
                  verify2FA
                }

                style={{
                  padding:
                    "12px 20px",

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

                  fontWeight:
                    "bold",
                }}
              >
                Verify & Enable
              </button>

            </div>

          )}

          {/* DISABLE */}

          {twoFactorEnabled && (

            <div
              style={{
                marginTop: 30,
              }}
            >

              <input
                type="password"

                placeholder="Confirm password"

                value={
                  disablePassword
                }

                onChange={(e) =>
                  setDisablePassword(
                    e.target.value
                  )
                }

                style={{
                  width: 300,

                  padding: 12,

                  borderRadius: 10,

                  border:
                    "none",

                  marginBottom: 15,
                }}
              />

              <br />

              <button
                onClick={
                  disable2FA
                }

                style={{
                  padding:
                    "12px 20px",

                  background:
                    "#dc2626",

                  color:
                    "white",

                  border:
                    "none",

                  borderRadius:
                    10,

                  cursor:
                    "pointer",

                  fontWeight:
                    "bold",
                }}
              >
                Disable 2FA
              </button>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}