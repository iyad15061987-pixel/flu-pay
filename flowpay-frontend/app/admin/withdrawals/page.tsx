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

  const complete =
    async (id: string) => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        await fetch(
          `${API_URL}/admin/withdrawals/${id}/complete`,
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
          ًںڈ¦ Withdrawal Requests
        </h1>

        <br />

        {withdrawals.map((w) => {
          const status = String(
            w.status || ""
          ).toLowerCase();

          const method = String(
            w.method || "paypal"
          ).toLowerCase();

          const isCrypto =
            method === "crypto";

          return (
            <div
              key={w._id}
              style={{
                background: "#111827",
                border: "1px solid #1f2937",
                padding: 24,
                borderRadius: 16,
                marginBottom: 18,
                boxShadow:
                  "0 8px 24px rgba(0,0,0,0.18)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  gap: 20,
                  flexWrap: "wrap",
                  marginBottom: 20,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#94a3b8",
                      marginBottom: 6,
                    }}
                  >
                    Withdrawal Amount
                  </div>

                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: "bold",
                    }}
                  >
                    ${Number(
                      w.amount || 0
                    ).toFixed(2)}
                  </div>
                </div>

                <div
                  style={{
                    padding:
                      "8px 14px",
                    borderRadius: 999,
                    background:
                      status === "pending"
                        ? "#78350f"
                        : status === "approved"
                        ? "#14532d"
                        : status === "processing"
                        ? "#1e3a8a"
                        : status === "completed"
                        ? "#064e3b"
                        : status === "rejected"
                        ? "#7f1d1d"
                        : "#374151",
                    color: "white",
                    fontWeight: "bold",
                    textTransform:
                      "capitalize",
                  }}
                >
                  {status}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 14,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    background: "#0f172a",
                    padding: 16,
                    borderRadius: 12,
                  }}
                >
                  <div
                    style={{
                      color: "#94a3b8",
                      fontSize: 13,
                      marginBottom: 6,
                    }}
                  >
                    User
                  </div>

                  <div
                    style={{
                      wordBreak:
                        "break-word",
                    }}
                  >
                    {w.email}
                  </div>
                </div>

                <div
                  style={{
                    background: "#0f172a",
                    padding: 16,
                    borderRadius: 12,
                  }}
                >
                  <div
                    style={{
                      color: "#94a3b8",
                      fontSize: 13,
                      marginBottom: 6,
                    }}
                  >
                    Method
                  </div>

                  <div
                    style={{
                      fontWeight: "bold",
                      textTransform:
                        "capitalize",
                    }}
                  >
                    {isCrypto
                      ? "Crypto"
                      : method === "bank"
                      ? "Bank Transfer"
                      : "PayPal"}
                  </div>
                </div>

                <div
                  style={{
                    background: "#0f172a",
                    padding: 16,
                    borderRadius: 12,
                  }}
                >
                  <div
                    style={{
                      color: "#94a3b8",
                      fontSize: 13,
                      marginBottom: 6,
                    }}
                  >
                    Fee
                  </div>

                  <div>
                    ${Number(
                      w.fee || 0
                    ).toFixed(2)}
                  </div>
                </div>

                <div
                  style={{
                    background: "#0f172a",
                    padding: 16,
                    borderRadius: 12,
                  }}
                >
                  <div
                    style={{
                      color: "#94a3b8",
                      fontSize: 13,
                      marginBottom: 6,
                    }}
                  >
                    Net Amount
                  </div>

                  <div
                    style={{
                      fontWeight: "bold",
                    }}
                  >
                    ${Number(
                      w.netAmount || 0
                    ).toFixed(2)}
                  </div>
                </div>

                {isCrypto && (
                  <div
                    style={{
                      background: "#0f172a",
                      padding: 16,
                      borderRadius: 12,
                    }}
                  >
                    <div
                      style={{
                        color: "#94a3b8",
                        fontSize: 13,
                        marginBottom: 6,
                      }}
                    >
                      Payout Currency
                    </div>

                    <div
                      style={{
                        fontWeight: "bold",
                      }}
                    >
                      {w.payoutCurrency ||
                        "Not specified"}
                    </div>
                  </div>
                )}
              </div>

              <div
                style={{
                  background: "#0f172a",
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    color: "#94a3b8",
                    fontSize: 13,
                    marginBottom: 6,
                  }}
                >
                  Destination
                </div>

                <div
                  style={{
                    wordBreak:
                      "break-all",
                    fontFamily:
                      "monospace",
                    fontSize: 14,
                  }}
                >
                  {w.destination}
                </div>
              </div>

              {status === "pending" && (
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    onClick={() =>
                      approve(w._id)
                    }
                    style={{
                      background:
                        "#16a34a",
                      border: "none",
                      padding:
                        "11px 20px",
                      borderRadius: 10,
                      color: "white",
                      fontWeight:
                        "bold",
                      cursor:
                        "pointer",
                    }}
                  >
                    Approve
                  </button>

                  <button
                    onClick={() =>
                      reject(w._id)
                    }
                    style={{
                      background:
                        "#dc2626",
                      border: "none",
                      padding:
                        "11px 20px",
                      borderRadius: 10,
                      color: "white",
                      fontWeight:
                        "bold",
                      cursor:
                        "pointer",
                    }}
                  >
                    Reject
                  </button>
                </div>
              )}

              {(status === "approved" ||
                status === "processing") && (
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                  }}
                >
                  <button
                    onClick={() =>
                      complete(w._id)
                    }
                    style={{
                      background:
                        "#2563eb",
                      border: "none",
                      padding:
                        "11px 20px",
                      borderRadius: 10,
                      color: "white",
                      fontWeight:
                        "bold",
                      cursor:
                        "pointer",
                    }}
                  >
                    Complete
                  </button>
                </div>
              )}
            </div>
          );
        })}      </div>
    </div>
  );
}