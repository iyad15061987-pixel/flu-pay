"use client";

import { useState, useEffect } from "react";

import API_URL from "@/lib/api";

export default function WithdrawPage() {
  const [amount, setAmount] =
    useState("");

  useEffect(() => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      window.location.href =
        "/login";
    }
  }, []);

  const requestWithdraw =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const headers: Record<
          string,
          string
        > = {
          "Content-Type":
            "application/json",
        };

        if (token) {
          headers[
            "Authorization"
          ] = `Bearer ${token}`;
        }

        const res = await fetch(
          `${API_URL}/withdraw`,
          {
            method: "POST",

            headers,

            body: JSON.stringify({
              amount:
                Number(amount),
            }),
          }
        );

        const data =
          await res.json();

        alert(
          data.message ||
            "Withdrawal requested"
        );
      } catch (err) {
        alert("Server error");
      }
    };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        padding: 40,
      }}
    >
      <h1>Withdraw</h1>

      <br />

      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) =>
          setAmount(
            e.target.value
          )
        }
        style={{
          padding: 12,
          borderRadius: 10,
          border: "none",
          width: 300,
        }}
      />

      <br />
      <br />

      <button
        onClick={requestWithdraw}
        style={{
          padding: 15,
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 10,
          cursor: "pointer",
        }}
      >
        Request Withdraw
      </button>
    </div>
  );
}