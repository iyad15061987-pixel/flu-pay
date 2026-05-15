"use client";

import { useEffect, useState } from "react";

import API_URL from "@/lib/api";

export default function PublicPayPage({
  params,
}: any) {
  const [user, setUser] =
    useState<any>(null);

  const [amount, setAmount] =
    useState("");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser =
    async () => {
      try {
        const res =
          await fetch(
            `${API_URL}/pay/${params.email}`
          );

        const data =
          await res.json();

        setUser(data);

      } catch (err) {
        console.log(err);
      }
    };

  const payNow = () => {
    localStorage.setItem(
      "payEmail",
      params.email
    );

    localStorage.setItem(
      "payAmount",
      amount
    );

    window.location.href =
      "/dashboard";
  };

  if (!user) {
    return (
      <div
        style={{
          background:
            "#0f172a",
          minHeight:
            "100vh",
          color: "white",
          padding: 40,
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#0f172a",
        minHeight: "100vh",
        display: "flex",
        justifyContent:
          "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          background:
            "#111827",
          padding: 40,
          borderRadius: 20,
          width: 450,
          color: "white",
          textAlign: "center",
        }}
      >
        <h1>
          💸 Pay User
        </h1>

        <br />

        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${user.email}`}
          width="200"
        />

        <br />
        <br />

        <h2>
          {user.email}
        </h2>

        <br />

        <p>
          Send money instantly
          using FlowPay
        </p>

        <br />

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
          onClick={payNow}
          style={{
            width: "100%",
            padding: 15,
            background:
              "#16a34a",
            border: "none",
            borderRadius: 10,
            color: "white",
            cursor: "pointer",
          }}
        >
          Continue Payment
        </button>
      </div>
    </div>
  );
}