"use client";

import { useState } from "react";
import API_URL from "@/lib/api";

export default function DepositPage() {
  const [amount, setAmount] =
    useState("");

  const [method, setMethod] =
    useState("PayPal");

  const createRequest =
    async () => {
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

      const res = await fetch(
        `${API_URL}/create-deposit-request`,
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
          }),
        }
      );

      const data =
        await res.json();

      alert(data.message);

      setAmount("");
    };

  return (
    <div
      style={{
        background: "#0f172a",
        minHeight: "100vh",
        padding: 40,
        color: "white",
      }}
    >
      <h1>
        🏦 Deposit Request
      </h1>

      <br />

      <div
        style={{
          background:
            "#111827",
          padding: 30,
          borderRadius: 20,
          maxWidth: 500,
        }}
      >
        <p>
          PayPal Email:
        </p>

        <br />

        <div
          style={{
            background:
              "#1f2937",
            padding: 15,
            borderRadius: 10,
          }}
        >
          payments@flowpay.com
        </div>

        <br />

        <p>
          Crypto Wallet:
        </p>

        <br />

        <div
          style={{
            background:
              "#1f2937",
            padding: 15,
            borderRadius: 10,
            wordBreak:
              "break-all",
          }}
        >
          USDT TRC20:
          <br />
          TXxxxxxxxxxxxxxxxx
        </div>

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
            Crypto
          </option>
        </select>

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

        <button
          onClick={
            createRequest
          }
          style={{
            width: "100%",
            padding: 15,
            background:
              "#16a34a",
            color: "white",
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
          }}
        >
          Create Deposit Request
        </button>
      </div>
    </div>
  );
}