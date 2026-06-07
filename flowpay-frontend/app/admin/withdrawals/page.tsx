"use client";

import {
  useEffect,
  useState,
} from "react";

import Sidebar from "@/app/components/Sidebar";

import API_URL from "@/lib/api";

export default function AdminWithdrawalsPage() {
  const [
    withdrawals,
    setWithdrawals,
  ] = useState<any[]>([]);

  const loadWithdrawals =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/admin/withdrawals`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        setWithdrawals(
          data
        );

      } catch (err) {
        console.log(err);
      }
    };

  const approve =
    async (id: string) => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        await fetch(
          `${API_URL}/admin/withdrawals/${id}/approve`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        loadWithdrawals();

      } catch (err) {
        console.log(err);
      }
    };

  const reject =
    async (id: string) => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        await fetch(
          `${API_URL}/admin/withdrawals/${id}/reject`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        loadWithdrawals();

      } catch (err) {
        console.log(err);
      }
    };

  useEffect(() => {
    loadWithdrawals();
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
          🏦 Withdrawal Requests
        </h1>

        <br />

        {withdrawals.map(
          (w) => (
            <div
              key={w._id}
              style={{
                background:
                  "#111827",

                padding: 20,

                borderRadius: 14,

                marginBottom: 15,
              }}
            >
              <h3>
                ${w.amount}
              </h3>

              <p>
                {w.email}
              </p>

              <p>
                {w.destination}
              </p>

              <p>
                Status:
                {" "}
                {w.status}
              </p>

              <br />

              {w.status ===
                "pending" && (
                <div
                  style={{
                    display:
                      "flex",

                    gap: 10,
                  }}
                >
                  <button
                    onClick={() =>
                      approve(
                        w._id
                      )
                    }
                    style={{
                      background:
                        "#16a34a",

                      border:
                        "none",

                      padding:
                        "10px 15px",

                      borderRadius: 10,

                      color:
                        "white",
                    }}
                  >
                    Approve
                  </button>

                  <button
                    onClick={() =>
                      reject(
                        w._id
                      )
                    }
                    style={{
                      background:
                        "#dc2626",

                      border:
                        "none",

                      padding:
                        "10px 15px",

                      borderRadius: 10,

                      color:
                        "white",
                    }}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}