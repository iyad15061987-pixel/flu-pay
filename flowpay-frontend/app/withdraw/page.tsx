"use client";

import {
  useEffect,
  useState,
} from "react";

import Sidebar from "../components/Sidebar";

import API_URL from "@/lib/api";

export default function WithdrawPage() {
  const [mounted, setMounted] =
    useState(false);

  const [theme, setTheme] =
    useState("dark");

  const [amount, setAmount] =
    useState("");

  const [method, setMethod] =
  useState("paypal");

  const [wallet, setWallet] =
    useState("");
  const [cryptoCurrency, setCryptoCurrency] =
    useState("USDT TRC20");


  useEffect(() => {
    setMounted(true);

    const savedTheme =
      localStorage.getItem(
        "theme"
      );

    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const numericAmount =
    Number(amount || 0);

  const fee =
    method === "crypto"
      ? Math.max(1.00, numericAmount * 0.01)
      : numericAmount * 0.035;

  const netAmount =
    numericAmount -
    fee;

  const createWithdraw =
    async () => {
      try {

        if (
          !Number.isFinite(numericAmount) ||
          numericAmount < 1
        ) {
          alert("Minimum withdrawal amount is $1");
          return;
        }

        const token =
          localStorage.getItem(
            "token"
          );

        const userId =
          localStorage.getItem(
            "userId"
          );

        const email =
          localStorage.getItem(
            "email"
          );

        const res =
          await fetch(
            `${API_URL}/withdrawals`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

           body: JSON.stringify({
  amount,
  method,
  destination: wallet,
  payoutCurrency:
    method === "crypto"
      ? cryptoCurrency
      : null,
}),

            }
          );

        const data =
          await res.json();

        alert(data.message);

        setAmount("");

        setWallet("");

      } catch (err) {
        alert("Server error");
      }
    };

  if (!mounted) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",

        background:
          theme === "light"
            ? "#f3f4f6"
            : "#0f172a",

        minHeight: "100vh",
      }}
    >
      <Sidebar />

      <div
        style={{
          marginLeft: 250,

          padding: 40,

          width: "100%",

          color:
            theme === "light"
              ? "#111827"
              : "white",
        }}
      >
        <h1 style={{
          marginBottom: 10,
          fontSize: 30,
          fontWeight: "700",
        }}>
          💸 Withdraw Request
        </h1>

        <p style={{
          marginBottom: 25,
          opacity: 0.7,
        }}>
          Choose your withdrawal method and enter the required details.
        </p>

        <div
          style={{
            background:
              theme === "light"
                ? "white"
                : "#111827",

            padding: 30,
            borderRadius: 20,
            maxWidth: 700,

            boxShadow:
              "0 0 10px rgba(0,0,0,0.1)",
          }}
        >

          <h2 style={{
            marginBottom: 15,
          }}>
            💳 Withdraw Method
          </h2>

          <select
            value={method}
            onChange={(e) =>
              setMethod(
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: 15,
              borderRadius: 10,
              marginBottom: 15,
              fontSize: 16,
            }}
          >
            <option value="paypal">
              PayPal
            </option>

            <option value="bank">
              Bank Transfer
            </option>

            <option value="crypto">
              Crypto
            </option>
          </select>

          {method === "crypto" && (
            <>
              <label style={{
                display: "block",
                marginBottom: 8,
                fontWeight: "600",
              }}>
                Cryptocurrency
              </label>

              <select
                value={cryptoCurrency}
                onChange={(e) =>
                  setCryptoCurrency(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  padding: 15,
                  borderRadius: 10,
                  marginBottom: 15,
                  fontSize: 16,
                }}
              >
                <option value="USDT TRC20">
                  USDT TRC20
                </option>

                <option value="BTC">
                  BTC
                </option>

                <option value="ETH">
                  ETH
                </option>
              </select>
            </>
          )}

          <label style={{
            display: "block",
            marginBottom: 8,
            fontWeight: "600",
          }}>
            {method === "paypal"
              ? "PayPal Email"
              : method === "bank"
                ? "Bank Account / IBAN"
                : `${cryptoCurrency} Wallet Address`}
          </label>

          <input
            type="text"
            placeholder={
              method === "paypal"
                ? "Enter PayPal email"
                : method === "bank"
                  ? "Enter Bank Account / IBAN"
                  : `Enter ${cryptoCurrency} wallet address`
            }
            value={wallet}
            onChange={(e) =>
              setWallet(
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: 15,
              borderRadius: 10,
              border: "none",
              marginBottom: 15,

              background:
                theme === "light"
                  ? "#f9fafb"
                  : "#1f2937",

              color:
                theme === "light"
                  ? "#111827"
                  : "white",

              fontSize: 16,
            }}
          />

          <label style={{
            display: "block",
            marginBottom: 8,
            fontWeight: "600",
          }}>
            Amount
          </label>

          <input
            type="number"
            min="1"
            step="0.01"
            placeholder="Minimum $1"
            value={amount}
            onChange={(e) =>
              setAmount(
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: 15,
              borderRadius: 10,
              border: "none",
              marginBottom: 20,

              background:
                theme === "light"
                  ? "#f9fafb"
                  : "#1f2937",

              color:
                theme === "light"
                  ? "#111827"
                  : "white",

              fontSize: 16,
            }}
          />

          <div
            style={{
              background:
                theme === "light"
                  ? "#e5e7eb"
                  : "#1f2937",

              padding: 20,
              borderRadius: 15,
              marginBottom: 20,
            }}
          >
            <p>
              💵 Withdraw:
              <strong>
                {" "}
                ${Number(
                  amount || 0
                ).toFixed(2)}
              </strong>
            </p>

            <br />

            <p>
              🧾 Fee:
              <strong>
                {" "}
                {method === "crypto"
                  ? "1% (minimum $1)"
                  : "3.5%"}
              </strong>
              {" — "}
              <strong>
                ${fee.toFixed(2)}
              </strong>
            </p>

            <br />

            <p>
              ✅ You Will Receive:
              <strong>
                {" "}
                ${netAmount.toFixed(2)}
              </strong>
            </p>
          </div>

          <button
            onClick={
              createWithdraw
            }
            style={{
              width: "100%",
              padding: 15,
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: 16,
            }}
          >
            Create Withdraw Request
          </button>

          <br />
          <br />

          <div
            style={{
              background:
                theme === "light"
                  ? "#e5e7eb"
                  : "#1f2937",

              padding: 20,
              borderRadius: 15,
            }}
          >
            <h3>
              📌 Important
            </h3>

            <br />

            <p>
              Withdraw requests require
              admin approval before
              processing.
            </p>

            <br />

            <p>
              <strong>
                Withdrawal Fees
              </strong>
            </p>

            <p>
              • PayPal: 3.5%
            </p>

            <p>
              • Bank Transfer: 3.5%
            </p>

            <p>
              • Crypto: 1% (minimum fee $1)
            </p>

            <p>
              • Minimum withdrawal: $1
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
