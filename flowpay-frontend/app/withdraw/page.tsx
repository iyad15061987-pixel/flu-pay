"use client";

import { useState } from "react";

import Sidebar from "../components/Sidebar";

import API_URL from "@/lib/api";

export default function WithdrawPage() {
  const [amount, setAmount] =
    useState("");

  const [method, setMethod] =
    useState("PayPal");

  const [wallet, setWallet] =
    useState("");

  const fee =
    Number(amount || 0) *
    0.035;

  const netAmount =
    Number(amount || 0) -
    fee;

  const createWithdraw =
    async () => {
      try {
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
            `${API_URL}/create-withdraw-request`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                userId,
                email,
                amount,
                method,
                wallet,
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

  return (
    <div
      style={{
        display: "flex",

        background:
          localStorage.getItem(
            "theme"
          ) === "light"
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
            localStorage.getItem(
              "theme"
            ) === "light"
              ? "#111827"
              : "white",
        }}
      >
        <h1>
          💸 Withdraw Request
        </h1>

        <br />

        <div
          style={{
            background:
              localStorage.getItem(
                "theme"
              ) === "light"
                ? "white"
                : "#111827",

            padding: 30,

            borderRadius: 20,

            maxWidth: 700,

            boxShadow:
              "0 0 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2>
            💳 Withdraw Method
          </h2>

          <br />

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
            }}
          >
            <option>
              PayPal
            </option>

            <option>
              BTC
            </option>

            <option>
              USDT TRC20
            </option>

            <option>
              ETH
            </option>
          </select>

          <input
            type="text"
            placeholder="PayPal Email or Wallet Address"
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
            }}
          />

          <input
            type="number"
            placeholder="Amount"
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
              marginBottom: 15,
            }}
          />

          <div
            style={{
              background:
                localStorage.getItem(
                  "theme"
                ) ===
                "light"
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
                $
                {Number(
                  amount || 0
                ).toFixed(2)}
              </strong>
            </p>

            <br />

            <p>
              🧾 Fee 3.5%:
              <strong>
                {" "}
                $
                {fee.toFixed(2)}
              </strong>
            </p>

            <br />

            <p>
              ✅ You Will Receive:
              <strong>
                {" "}
                $
                {netAmount.toFixed(
                  2
                )}
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
              background:
                "#dc2626",

              color: "white",

              border: "none",

              borderRadius: 10,

              cursor: "pointer",
            }}
          >
            Create Withdraw
            Request
          </button>

          <br />
          <br />

          <div
            style={{
              background:
                localStorage.getItem(
                  "theme"
                ) ===
                "light"
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
              Withdraw requests
              require admin
              approval before
              processing.
            </p>

            <br />

            <p>
              External withdraw
              fee:
              <strong>
                {" "}
                3.5%
              </strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}