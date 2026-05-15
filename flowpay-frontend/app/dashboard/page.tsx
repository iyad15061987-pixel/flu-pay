"use client";

import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";

import BalanceChart from "../components/BalanceChart";

import API_URL from "@/lib/api";

interface Transaction {
  _id: string;
  fromEmail: string;
  toEmail: string;
  amount: number;
  fee: number;
  netAmount: number;
  type: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [email, setEmail] =
    useState("");

  const [balance, setBalance] =
    useState(0);

  const [
    receiverEmail,
    setReceiverEmail,
  ] = useState("");

  const [amount, setAmount] =
    useState("");

  const [
    transactions,
    setTransactions,
  ] = useState<Transaction[]>(
    []
  );

  const [analytics, setAnalytics] =
    useState<any>(null);

  const [activities, setActivities] =
    useState<any[]>([]);

  const fee =
    Number(amount || 0) *
    0.0001;

  const netAmount =
    Number(amount || 0) -
    fee;

  useEffect(() => {
    const savedEmail =
      localStorage.getItem(
        "email"
      );

    const savedToken =
      localStorage.getItem(
        "token"
      );

    if (
      !savedEmail ||
      !savedToken
    ) {
      window.location.href =
        "/login";

      return;
    }

    setEmail(savedEmail);

    loadUser(
      savedEmail,
      savedToken
    );

    loadTransactions(
      savedEmail,
      savedToken
    );

    loadAnalytics(
      savedEmail,
      savedToken
    );

    loadActivities(
      savedEmail,
      savedToken
    );

    const payEmail =
      localStorage.getItem(
        "payEmail"
      );

    const payAmount =
      localStorage.getItem(
        "payAmount"
      );

    if (payEmail) {
      setReceiverEmail(
        payEmail
      );

      localStorage.removeItem(
        "payEmail"
      );
    }

    if (payAmount) {
      setAmount(payAmount);

      localStorage.removeItem(
        "payAmount"
      );
    }
  }, []);

  const loadUser = async (
    userEmail: string,
    token: string
  ) => {
    try {
      const res = await fetch(
        `${API_URL}/user/${userEmail}`,
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
      userEmail: string,
      token: string
    ) => {
      try {
        const res =
          await fetch(
            `${API_URL}/transactions/${userEmail}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        setTransactions(data);

      } catch (err) {
        console.log(err);
      }
    };

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

  const loadActivities =
    async (
      userEmail: string,
      token: string
    ) => {
      try {
        const txRes =
          await fetch(
            `${API_URL}/transactions/${userEmail}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const txData =
          await txRes.json();

        const formatted =
          txData.map(
            (tx: any) => ({
              type:
                tx.type,

              amount:
                tx.amount,

              createdAt:
                tx.createdAt,
            })
          );

        setActivities(
          formatted.slice(
            0,
            10
          )
        );

      } catch (err) {
        console.log(err);
      }
    };

  const transfer =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

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
                fromEmail:
                  email,

                toEmail:
                  receiverEmail,

                amount,
              }),
            }
          );

        const data =
          await res.json();

        alert(data.message);

        setAmount("");

        setReceiverEmail("");

        loadUser(
          email,
          token || ""
        );

        loadTransactions(
          email,
          token || ""
        );

        loadAnalytics(
          email,
          token || ""
        );

        loadActivities(
          email,
          token || ""
        );

      } catch (err) {
        alert("Server error");
      }
    };

  const downloadReceipt =
    (tx: any) => {
      const content = `
FLOWPAY RECEIPT

Type: ${tx.type}

From: ${tx.fromEmail}

To: ${tx.toEmail}

Amount: $${tx.amount}

Fee: $${tx.fee}

Net Amount: $${tx.netAmount}

Date:
${new Date(
  tx.createdAt
).toLocaleString()}
`;

      const blob =
        new Blob([content], {
          type: "text/plain",
        });

      const url =
        URL.createObjectURL(
          blob
        );

      const a =
        document.createElement(
          "a"
        );

      a.href = url;

      a.download =
        "receipt.txt";

      a.click();

      URL.revokeObjectURL(
        url
      );
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
          🚀 Dashboard
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

            marginBottom: 30,

            maxWidth: 500,

            boxShadow:
              "0 0 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2>
            💰 Wallet Balance
          </h2>

          <br />

          <h1>
            ${balance}
          </h1>

          <br />

          <p>
            Logged in as:
          </p>

          <strong>
            {email}
          </strong>
        </div>

        <BalanceChart
          balance={balance}
        />

        {analytics && (
          <>
            <h2>
              📊 Analytics
            </h2>

            <br />

            <div
              style={{
                display: "grid",

                gridTemplateColumns:
                  "repeat(auto-fit,minmax(220px,1fr))",

                gap: 20,

                marginBottom: 40,
              }}
            >
              <div
                style={{
                  background:
                    localStorage.getItem(
                      "theme"
                    ) ===
                    "light"
                      ? "white"
                      : "#111827",

                  padding: 20,

                  borderRadius: 15,
                }}
              >
                <h3>
                  💸 Total Sent
                </h3>

                <br />

                <h2>
                  $
                  {
                    analytics.totalSent
                  }
                </h2>
              </div>

              <div
                style={{
                  background:
                    localStorage.getItem(
                      "theme"
                    ) ===
                    "light"
                      ? "white"
                      : "#111827",

                  padding: 20,

                  borderRadius: 15,
                }}
              >
                <h3>
                  💰 Total Received
                </h3>

                <br />

                <h2>
                  $
                  {
                    analytics.totalReceived
                  }
                </h2>
              </div>

              <div
                style={{
                  background:
                    localStorage.getItem(
                      "theme"
                    ) ===
                    "light"
                      ? "white"
                      : "#111827",

                  padding: 20,

                  borderRadius: 15,
                }}
              >
                <h3>
                  🏦 Deposits
                </h3>

                <br />

                <h2>
                  {
                    analytics.deposits
                  }
                </h2>
              </div>

              <div
                style={{
                  background:
                    localStorage.getItem(
                      "theme"
                    ) ===
                    "light"
                      ? "white"
                      : "#111827",

                  padding: 20,

                  borderRadius: 15,
                }}
              >
                <h3>
                  💸 Withdraws
                </h3>

                <br />

                <h2>
                  {
                    analytics.withdraws
                  }
                </h2>
              </div>

              <div
                style={{
                  background:
                    localStorage.getItem(
                      "theme"
                    ) ===
                    "light"
                      ? "white"
                      : "#111827",

                  padding: 20,

                  borderRadius: 15,
                }}
              >
                <h3>
                  📋 Requests
                </h3>

                <br />

                <h2>
                  {
                    analytics.totalRequests
                  }
                </h2>
              </div>

              <div
                style={{
                  background:
                    localStorage.getItem(
                      "theme"
                    ) ===
                    "light"
                      ? "white"
                      : "#111827",

                  padding: 20,

                  borderRadius: 15,
                }}
              >
                <h3>
                  🔔 Notifications
                </h3>

                <br />

                <h2>
                  {
                    analytics.totalNotifications
                  }
                </h2>
              </div>

              <div
                style={{
                  background:
                    localStorage.getItem(
                      "theme"
                    ) ===
                    "light"
                      ? "white"
                      : "#111827",

                  padding: 20,

                  borderRadius: 15,
                }}
              >
                <h3>
                  💵 Total Fees
                </h3>

                <br />

                <h2>
                  $
                  {
                    analytics.totalFees
                  }
                </h2>
              </div>
            </div>
          </>
        )}

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

            marginBottom: 40,

            maxWidth: 500,

            boxShadow:
              "0 0 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2>
            💸 Internal Transfer
          </h2>

          <br />

          <input
            type="email"
            placeholder="Receiver Email"
            value={
              receiverEmail
            }
            onChange={(e) =>
              setReceiverEmail(
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
              💵 Amount:
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
              🧾 Fee:
              <strong>
                {" "}
                $
                {fee.toFixed(4)}
              </strong>
            </p>

            <br />

            <p>
              ✅ Receiver Gets:
              <strong>
                {" "}
                $
                {netAmount.toFixed(
                  4
                )}
              </strong>
            </p>
          </div>

          <button
            onClick={transfer}
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
            Send Money
          </button>

          <br />
          <br />

          <p>
            Internal transfer
            fee:
            <strong>
              {" "}
              0.01%
            </strong>
          </p>
        </div>

        <h2>
          🧠 Recent Activity
        </h2>

        <br />

        <div
          style={{
            marginBottom: 40,
          }}
        >
          {activities.length ===
          0 ? (
            <p>
              No activity yet
            </p>
          ) : (
            activities.map(
              (
                activity,
                index
              ) => (
                <div
                  key={index}
                  style={{
                    background:
                      localStorage.getItem(
                        "theme"
                      ) ===
                      "light"
                        ? "white"
                        : "#111827",

                    padding: 20,

                    borderRadius: 15,

                    marginBottom: 15,

                    borderLeft:
                      "5px solid #22c55e",

                    boxShadow:
                      "0 0 10px rgba(0,0,0,0.1)",
                  }}
                >
                  <h3>
                    {
                      activity.type
                    }
                  </h3>

                  <br />

                  <p>
                    Amount:
                    <strong>
                      {" "}
                      $
                      {
                        activity.amount
                      }
                    </strong>
                  </p>

                  <br />

                  <p>
                    {new Date(
                      activity.createdAt
                    ).toLocaleString()}
                  </p>
                </div>
              )
            )
          )}
        </div>

        <h2>
          📜 Transaction History
        </h2>

        <br />

        {transactions.length ===
        0 ? (
          <p>
            No transactions yet
          </p>
        ) : (
          transactions.map(
            (tx) => (
              <div
                key={tx._id}
                style={{
                  background:
                    localStorage.getItem(
                      "theme"
                    ) ===
                    "light"
                      ? "white"
                      : "#111827",

                  padding: 20,

                  borderRadius: 15,

                  marginBottom: 15,

                  boxShadow:
                    "0 0 10px rgba(0,0,0,0.1)",
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

                <br />

                <button
                  onClick={() =>
                    downloadReceipt(
                      tx
                    )
                  }
                  style={{
                    marginTop: 10,

                    padding: 10,

                    background:
                      "#2563eb",

                    border: "none",

                    borderRadius: 10,

                    color: "white",

                    cursor:
                      "pointer",
                  }}
                >
                  📄 Download
                  Receipt
                </button>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}