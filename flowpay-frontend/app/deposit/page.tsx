"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
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
        display: "flex",
        background: "#0f172a",
        minHeight: "100vh",
      }}
    >
      <Sidebar />

      <div
        style={{
          marginLeft: 250,
          padding: 40,
          width: "100%",
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
            maxWidth: 900,
          }}
        >
          <h2>
            💳 PayPal
          </h2>

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
            <div
              style={{
                background:
                  "#1f2937",
                padding: 20,
                borderRadius: 15,
                textAlign:
                  "center",
              }}
            >
              <h3>
                BTC
              </h3>

              <br />

              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=bc1qztfc7yp5p8mjr9002sdweh7ks9gydhm0lrcpty"
                width="150"
              />

              <br />
              <br />

              <p
                style={{
                  wordBreak:
                    "break-all",
                }}
              >
                bc1qztfc7yp5p8mjr9002sdweh7ks9gydhm0lrcpty
              </p>
            </div>

            <div
              style={{
                background:
                  "#1f2937",
                padding: 20,
                borderRadius: 15,
                textAlign:
                  "center",
              }}
            >
              <h3>
                USDT TRC20
              </h3>

              <br />

              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TCriCVuuWBWV8DW9aFNfjFvtrd5anyZSwp"
                width="150"
              />

              <br />
              <br />

              <p
                style={{
                  wordBreak:
                    "break-all",
                }}
              >
                TCriCVuuWBWV8DW9aFNfjFvtrd5anyZSwp
              </p>
            </div>

            <div
              style={{
                background:
                  "#1f2937",
                padding: 20,
                borderRadius: 15,
                textAlign:
                  "center",
              }}
            >
              <h3>
                ETH
              </h3>

              <br />

              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=0x3fa91e9Cb73306C4566D2fEf640E212B9bf034CE"
                width="150"
              />

              <br />
              <br />

              <p
                style={{
                  wordBreak:
                    "break-all",
                }}
              >
                0x3fa91e9Cb73306C4566D2fEf640E212B9bf034CE
              </p>
            </div>
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
                "#1f2937",
              padding: 20,
              borderRadius: 15,
            }}
          >
            <h3>
              📌 Important
            </h3>

            <br />

            <p>
              After sending your
              payment, create a
              deposit request so
              admin can verify
              and approve it.
            </p>

            <br />

            <p>
              External deposits
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