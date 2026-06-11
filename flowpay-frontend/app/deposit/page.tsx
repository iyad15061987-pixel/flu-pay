"use client";

import {
  useEffect,
  useState,
} from "react";

import Sidebar from "../components/Sidebar";

import API_URL from "@/lib/api";

export default function DepositPage() {

  const [mounted, setMounted] =
    useState(false);

  const [theme, setTheme] =
    useState("dark");

  const [amount, setAmount] =
    useState("");

  const [method, setMethod] =
    useState("PayPal");

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

  if (!mounted) {
    return null;
  }

  const fee =
    Number(amount || 0) *
    0.035;

  const netAmount =
    Number(amount || 0) -
    fee;

  const createRequest =
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
 `${API_URL}/deposits`,
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

        console.log(
          "DEPOSIT RESPONSE:",
          data
        );

        if (!res.ok) {

          alert(
            data.message ||
            "Request failed"
          );

          return;

        }

        alert(
          data.message ||
          "Deposit request submitted successfully"
        );

        setAmount("");

      } catch (err) {

        console.log(err);

        alert(
          "Connection error"
        );

      }

    };

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

        <h1>
          🏦 Deposit Request
        </h1>

        <br />

        <div
          style={{
            background:
              theme === "light"
                ? "white"
                : "#111827",

            padding: 30,

            borderRadius: 20,

            maxWidth: 900,

            boxShadow:
              "0 0 10px rgba(0,0,0,0.1)",
          }}
        >

          <h2>
            💳 PayPal
          </h2>

          <br />

          <div
            style={{
              background:
                theme === "light"
                  ? "#e5e7eb"
                  : "#1f2937",

              padding: 15,

              borderRadius: 10,

              wordBreak:
                "break-all",
            }}
          >
            payments@flowpay.com
          </div>

          <button
            onClick={() =>
              navigator.clipboard.writeText(
                "payments@flowpay.com"
              )
            }
            style={{
              marginTop: 10,

              padding: 10,

              border: "none",

              borderRadius: 10,

              background:
                "#2563eb",

              color: "white",

              cursor: "pointer",
            }}
          >
            Copy PayPal
          </button>

          <br />
          <br />

          <h2>
            🪙 Crypto Wallets
          </h2>

          <br />

          <div
            style={{
              display: "grid",

              gridTemplateColumns:
                "repeat(auto-fit,minmax(250px,1fr))",

              gap: 20,
            }}
          >

            {[
              {
                name: "BTC",

                address:
                  "bc1qztfc7yp5p8mjr9002sdweh7ks9gydhm0lrcpty",
              },

              {
                name:
                  "USDT TRC20",

                address:
                  "TCriCVuuWBWV8DW9aFNfjFvtrd5anyZSwp",
              },

              {
                name: "ETH",

                address:
                  "0x3fa91e9Cb73306C4566D2fEf640E212B9bf034CE",
              },

            ].map(
              (
                wallet: any,
                index: number
              ) => (

                <div
                  key={index}
                  style={{
                    background:
                      theme === "light"
                        ? "#e5e7eb"
                        : "#1f2937",

                    padding: 20,

                    borderRadius: 15,

                    textAlign:
                      "center",
                  }}
                >

                  <h3>
                    {wallet.name}
                  </h3>

                  <br />

                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${wallet.address}`}
                    width="150"
                    alt="QR Code"
                  />

                  <br />
                  <br />

                  <p
                    style={{
                      wordBreak:
                        "break-all",
                    }}
                  >
                    {wallet.address}
                  </p>

                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(
                        wallet.address
                      )
                    }
                    style={{
                      marginTop: 10,

                      padding: 10,

                      border:
                        "none",

                      borderRadius:
                        10,

                      background:
                        "#2563eb",

                      color:
                        "white",

                      cursor:
                        "pointer",
                    }}
                  >
                    Copy Address
                  </button>

                </div>

              )
            )}

          </div>

          <br />
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

          <div
            style={{
              background:
                theme ===
                "light"
                  ? "#e5e7eb"
                  : "#1f2937",

              padding: 20,

              borderRadius: 15,

              marginBottom: 20,
            }}
          >

            <p>
              💵 Deposit:
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
              ✅ Balance Added:
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

          <br />
          <br />

          <div
            style={{
              background:
                theme ===
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
              After sending your payment,
              create a deposit request so
              admin can verify and approve it.
            </p>

            <br />

            <p>
              External deposits fee:
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