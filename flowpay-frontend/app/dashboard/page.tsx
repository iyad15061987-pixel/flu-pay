"use client";

import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import WalletCard from "../components/WalletCard";
import StatsCard from "../components/StatsCard";
import BalanceChart from "../components/BalanceChart";
import QRCard from "../components/QRCard";
import UserCard from "../components/UserCard";
import NotificationCard from "../components/NotificationCard";
import CurrencyCard from "../components/CurrencyCard";
import SearchUsers from "../components/SearchUsers";

import API_URL from "@/lib/api";

export default function DashboardPage() {
  const [balance, setBalance] =
    useState(0);

    const [analytics, setAnalytics] =
  useState<any>(null);

  const [transactions, setTransactions] =
    useState<any[]>([]);

  const [transferEmail, setTransferEmail] =
    useState("");

  const [transferAmount, setTransferAmount] =
    useState("");

  const [userId, setUserId] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [token, setToken] =
    useState("");

  useEffect(() => {
    const savedUserId =
      localStorage.getItem("userId");

    const savedEmail =
      localStorage.getItem("email");

    const savedToken =
      localStorage.getItem("token");

    if (
      !savedUserId ||
      !savedEmail ||
      !savedToken
    ) {
      window.location.href =
        "/login";

      return;
    }

    setUserId(savedUserId);
    setEmail(savedEmail);
    setToken(savedToken);

    loadBalance(
      savedUserId,
      savedToken
    );

    loadTransactions(
      savedEmail,
      savedToken
  );
 const loadAnalytics =
  async (
    email: string,
    token: string
  ) => {
    try {
      const res =
        await fetch(
          `${API_URL}/analytics/${email}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await res.json();

      setAnalytics(data);

    } catch (err) {
      console.log(err);
    }
  };
}, []);

  const loadBalance = async (
    id: string,
    token: string
  ) => {
    try {
      const res = await fetch(
        `${API_URL}/balance/${id}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await res.json();

      setBalance(
        data.balance || 0
      );

    } catch (err) {
      console.log(err);
    }
  };

  const loadTransactions =
    async (
      email: string,
      token: string
    ) => {
      try {
        const res =
          await fetch(
            `${API_URL}/transactions/${email}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        setTransactions(
          data || []
        );

      } catch (err) {
        console.log(err);
      }
    };

  const sendMoney = async () => {
    if (
      !transferEmail ||
      !transferAmount
    ) {
      alert(
        "Fill all fields"
      );

      return;
    }

    try {
      const res =
        await fetch(
          `${API_URL}/transfer`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              fromUserId:
                userId,

              toEmail:
                transferEmail,

              amount:
                transferAmount,
            }),
          }
        );

      const data =
        await res.json();

      alert(
        `${data.message}\nFee: $${data.fee || 0}`
      );

      loadBalance(
        userId,
        token
      );

      loadTransactions(
        email,
        token
      );

      setTransferEmail("");

      setTransferAmount("");

    } catch (err) {
      alert(
        "Server error"
      );
    }
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
          width: "100%",
        }}
      >
        <Navbar />

        <div
          style={{
            padding: 30,
          }}
        >
          <h1
            style={{
              color: "white",
              marginBottom: 30,
            }}
          >
            Dashboard
          </h1>

          <UserCard />

          <br />
          <br />

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(300px,1fr))",
              gap: 20,
            }}
          >
            <WalletCard balance={balance} />

            <StatsCard
              title="Transactions"
              value={transactions.length.toString()}
            />

            <StatsCard
              title="Account"
              value="Verified"
            />
          </div>

          <br />
          <br />

          <BalanceChart />

          <br />
          <br />

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(350px,1fr))",
              gap: 20,
            }}
          >
            <div
              style={{
                background: "#111827",
                borderRadius: 20,
                padding: 25,
                color: "white",
              }}
            >
              <h2>
                💸 Send Money
              </h2>

              <br />

              <SearchUsers
                onSelect={(email) =>
                  setTransferEmail(
                    email
                  )
                }
              />

              <br />

              <input
                type="email"
                placeholder="Receiver Email"
                value={
                  transferEmail
                }
                onChange={(e) =>
                  setTransferEmail(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  padding: 15,
                  marginBottom: 15,
                  borderRadius: 10,
                  border: "none",
                }}
              />

              <input
                type="number"
                placeholder="Amount"
                value={
                  transferAmount
                }
                onChange={(e) =>
                  setTransferAmount(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  padding: 15,
                  marginBottom: 15,
                  borderRadius: 10,
                  border: "none",
                }}
              />

              <button
                onClick={sendMoney}
                style={{
                  width: "100%",
                  padding: 15,
                  background:
                    "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                Send Money
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
                <h2>
                  🏦 External Operations
                </h2>

                <br />

                <button
                  onClick={async () => {
                    const amount =
                      prompt(
                        "Deposit amount"
                      );

                    if (!amount)
                      return;

                    const res =
                      await fetch(
                        `${API_URL}/external-deposit`,
                        {
                          method:
                            "POST",

                          headers:
                            {
                              "Content-Type":
                                "application/json",

                              Authorization:
                                `Bearer ${token}`,
                            },

                          body: JSON.stringify(
                            {
                              userId,
                              amount,
                            }
                          ),
                        }
                      );

                    const data =
                      await res.json();

                    alert(
                      `${data.message}\nFee: $${data.fee}`
                    );

                    loadBalance(
                      userId,
                      token
                    );

                    loadTransactions(
                      email,
                      token
                    );
                  }}
                  style={{
                    width: "100%",
                    padding: 15,
                    marginBottom: 15,
                    border: "none",
                    borderRadius: 10,
                    background:
                      "#16a34a",
                    color:
                      "white",
                    cursor:
                      "pointer",
                  }}
                >
                  External Deposit
                  (3.5%)
                </button>

                <button
                  onClick={async () => {
                    const amount =
                      prompt(
                        "Withdraw amount"
                      );

                    if (!amount)
                      return;

                    const res =
                      await fetch(
                        `${API_URL}/external-withdraw`,
                        {
                          method:
                            "POST",

                          headers:
                            {
                              "Content-Type":
                                "application/json",

                              Authorization:
                                `Bearer ${token}`,
                            },

                          body: JSON.stringify(
                            {
                              userId,
                              amount,
                            }
                          ),
                        }
                      );

                    const data =
                      await res.json();

                    alert(
                      `${data.message}\nFee: $${data.fee}`
                    );

                    loadBalance(
                      userId,
                      token
                    );

                    loadTransactions(
                      email,
                      token
                    );
                  }}
                  style={{
                    width: "100%",
                    padding: 15,
                    border: "none",
                    borderRadius: 10,
                    background:
                      "#dc2626",
                    color:
                      "white",
                    cursor:
                      "pointer",
                  }}
                >
                  External Withdraw
                  (3.5%)
                </button>
              </div>
            </div>

            <QRCard
              email={email}
            />
          </div>

          <br />
          <br />

          <div
            style={{
              background: "#111827",
              borderRadius: 20,
              padding: 25,
              color: "white",
            }}
          >
            <h2>
              📜 Transaction History
            </h2>

            <br />

            {transactions.length ===
            0 ? (
              <p>
                No transactions
                yet
              </p>
            ) : (
              transactions.map(
                (
                  tx,
                  index
                ) => (
                  <div
                    key={index}
                    style={{
                      background:
                        "#1f2937",
                      padding: 15,
                      borderRadius: 12,
                      marginBottom: 12,
                    }}
                  >
                    <p>
                      <strong>
                        Type:
                      </strong>{" "}
                      {tx.type}
                    </p>

                    <p>
                      <strong>
                        From:
                      </strong>{" "}
                      {
                        tx.fromEmail
                      }
                    </p>

                    <p>
                      <strong>
                        To:
                      </strong>{" "}
                      {tx.toEmail}
                    </p>

                    <p>
                      <strong>
                        Amount:
                      </strong>{" "}
                      $
                      {tx.amount}
                    </p>

                    <p>
                      <strong>
                        Fee:
                      </strong>{" "}
                      $
                      {tx.fee}
                    </p>

                    <p>
                      <strong>
                        Net:
                      </strong>{" "}
                      $
                      {tx.netAmount}
                    </p>

                    <p>
                      <strong>
                        Date:
                      </strong>{" "}
                      {new Date(
                        tx.createdAt
                      ).toLocaleString()}
                    </p>
                  </div>
                )
              )
            )}
          </div>

          <br />
          <br />

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(300px,1fr))",
              gap: 20,
            }}
          >
            <NotificationCard />

            <CurrencyCard />
          </div>
        </div>
      </div>
    </div>
  );
}