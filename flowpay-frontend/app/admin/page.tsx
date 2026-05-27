"use client";

import {
  useEffect,
  useState,
} from "react";

import Sidebar from "../components/Sidebar";

import API_URL from "@/lib/api";

import { io } from "socket.io-client";

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function AdminPage() {

  const [mounted, setMounted] =
    useState(false);

  const [theme, setTheme] =
    useState("dark");

  const [transactions, setTransactions] =
    useState<any[]>([]);

  const [fraudAlerts, setFraudAlerts] =
    useState<any[]>([]);

  // =========================
  // WITHDRAWALS
  // =========================

  const [
    withdrawals,
    setWithdrawals,
  ] = useState<any[]>([]);

  const [analytics, setAnalytics] =
    useState<any>(null);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [
    socketConnected,
    setSocketConnected,
  ] = useState(false);

  // =========================
  // REAL CHART DATA
  // =========================

  const weeklyVolumeData =
    analytics?.weeklyVolume?.map(
      (item: any) => ({
        name:
          item._id,

        volume:
          item.volume,
      })
    ) || [];

  const userGrowthData =
    analytics?.userGrowth?.map(
      (item: any) => ({
        name:
          item._id,

        users:
          item.users,
      })
    ) || [];

  // =========================
  // EFFECT
  // =========================

  useEffect(() => {

    setMounted(true);

    const savedTheme =
      localStorage.getItem(
        "theme"
      );

    if (savedTheme) {
      setTheme(savedTheme);
    }

    const token =
      localStorage.getItem(
        "token"
      );

    const role =
      localStorage.getItem(
        "role"
      );

    if (!token) {

      window.location.href =
        "/login";

      return;
    }

    if (
      role !== "admin"
    ) {

      alert(
        "Admin access only"
      );

      window.location.href =
        "/dashboard";

      return;
    }

    // =========================
    // INITIAL DATA
    // =========================

    loadTransactions();

    loadFraudAlerts();

    loadAnalytics();

    loadWithdrawals();

    // =========================
    // SOCKET.IO
    // =========================

    const socket =
      io(
        API_URL.replace(
          "/api",
          ""
        ),
        {
          transports: [
            "websocket",
          ],
        }
      );

    // =========================
    // CONNECT
    // =========================

    socket.on(
      "connect",

      () => {

        console.log(
          "✅ Socket connected"
        );

        setSocketConnected(
          true
        );

        socket.emit(
          "join_admin"
        );

      }
    );

    // =========================
    // DISCONNECT
    // =========================

    socket.on(
      "disconnect",

      () => {

        console.log(
          "❌ Socket disconnected"
        );

        setSocketConnected(
          false
        );

      }
    );

    // =========================
    // SOCKET READY
    // =========================

    socket.on(
      "connected",

      (data) => {

        console.log(
          "Realtime Ready:",
          data
        );

      }
    );

    // =========================
    // LIVE TRANSACTIONS
    // =========================

    socket.on(
      "new_transaction",

      (tx) => {

        console.log(
          "💸 New Transaction:",
          tx
        );

        setTransactions(
          (prev) => [
            {
              ...tx,
              createdAt:
                new Date(),
            },
            ...prev,
          ]
        );

        loadAnalytics();

      }
    );

    // =========================
    // LIVE FRAUD ALERTS
    // =========================

    socket.on(
      "fraud_alert",

      (alert) => {

        console.log(
          "🚨 Fraud Alert:",
          alert
        );

        setFraudAlerts(
          (prev) => [
            alert,
            ...prev,
          ]
        );

      }
    );

    // =========================
    // LIVE WITHDRAWALS
    // =========================

    socket.on(
      "withdrawal_created",

      (withdrawal) => {

        console.log(
          "🏦 Withdrawal:",
          withdrawal
        );

        setWithdrawals(
          (prev) => [
            withdrawal,
            ...prev,
          ]
        );

      }
    );

    // =========================
    // WALLET UPDATE
    // =========================

    socket.on(
      "wallet_update",

      (data) => {

        console.log(
          "💰 Wallet Update:",
          data
        );

      }
    );

    // =========================
    // CLEANUP
    // =========================

    return () => {

      socket.off(
        "connect"
      );

      socket.off(
        "disconnect"
      );

      socket.off(
        "connected"
      );

      socket.off(
        "new_transaction"
      );

      socket.off(
        "fraud_alert"
      );

      socket.off(
        "withdrawal_created"
      );

      socket.off(
        "wallet_update"
      );

      socket.disconnect();

    };

  }, []);

  // =========================
  // LOAD ANALYTICS
  // =========================

  const loadAnalytics =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/admin/analytics`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        setAnalytics(
          data
        );

      } catch (err) {

        console.log(err);

      }

    };

  // =========================
  // LOAD TRANSACTIONS
  // =========================

  const loadTransactions =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/admin/transactions`,
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
          data
        );

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);

      }

    };

  // =========================
  // LOAD FRAUD ALERTS
  // =========================

  const loadFraudAlerts =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/admin/fraud-alerts`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        setFraudAlerts(
          data
        );

      } catch (err) {

        console.log(err);

      }

    };

  // =========================
  // LOAD WITHDRAWALS
  // =========================

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

  // =========================
  // APPROVE WITHDRAWAL
  // =========================

  const approveWithdrawal =
    async (id: string) => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const res =
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

        const data =
          await res.json();

        alert(
          data.message
        );

        loadWithdrawals();

      } catch (err) {

        console.log(err);

      }

    };

  // =========================
  // REJECT WITHDRAWAL
  // =========================

  const rejectWithdrawal =
    async (id: string) => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/admin/withdrawals/${id}/reject`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                reason:
                  "Rejected by admin",
              }),
            }
          );

        const data =
          await res.json();

        alert(
          data.message
        );

        loadWithdrawals();

      } catch (err) {

        console.log(err);

      }

    };

  // =========================
  // FILTERED TRANSACTIONS
  // =========================

  const filteredTransactions =
    transactions.filter(
      (tx: any) =>
        tx.fromEmail
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        tx.toEmail
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  // =========================
  // LOADING
  // =========================

  if (!mounted) {
    return null;
  }

  if (loading) {

    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f172a",
          display: "flex",
          justifyContent:
            "center",
          alignItems:
            "center",
          color: "white",
          fontSize: 24,
        }}
      >
        Loading...
      </div>
    );

  }

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

        {/* HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            marginBottom: 30,
          }}
        >

          <div>

            <h1>
              🏦 FlowPay Admin Center
            </h1>

            <div
              style={{
                marginTop: 10,
                fontSize: 14,
                color:
                  socketConnected
                    ? "#16a34a"
                    : "#dc2626",
              }}
            >

              {socketConnected
                ? "🟢 Live monitoring connected"
                : "🔴 Disconnected"}

            </div>

          </div>

          <button
            onClick={() => {

              localStorage.clear();

              window.location.href =
                "/login";

            }}

            style={{
              padding:
                "10px 20px",

              background:
                "#dc2626",

              color:
                "white",

              border:
                "none",

              borderRadius:
                10,

              cursor:
                "pointer",
            }}
          >
            Logout
          </button>

        </div>

        {/* ANALYTICS */}

        {analytics && (

          <div
            style={{
              display: "grid",

              gridTemplateColumns:
                "repeat(auto-fit, minmax(250px, 1fr))",

              gap: 20,

              marginBottom: 40,
            }}
          >

            <Card
              title="👥 Total Users"
              value={
                analytics.totalUsers
              }
            />

            <Card
              title="💸 Total Volume"
              value={`$${analytics.totalVolume}`}
            />

            <Card
              title="📈 Daily Volume"
              value={`$${analytics.dailyVolume}`}
            />

            <Card
              title="📊 Monthly Volume"
              value={`$${analytics.monthlyVolume}`}
            />

            <Card
              title="💰 Fees Earned"
              value={`$${analytics.totalFees}`}
            />

            <Card
              title="🚨 Fraud Alerts"
              value={
                analytics.suspiciousTransactions
              }
            />

            <Card
              title="🪪 Total KYC"
              value={
                analytics.totalKyc
              }
            />

            <Card
              title="✅ Approved KYC"
              value={
                analytics.approvedKyc
              }
            />

          </div>

        )}

        {/* CHARTS */}

        <div
          style={{
            display: "grid",

            gridTemplateColumns:
              "1fr 1fr",

            gap: 20,

            marginBottom: 40,
          }}
        >

          <div
            style={{
              background:
                theme === "light"
                  ? "white"
                  : "#111827",

              padding: 25,

              borderRadius: 20,
            }}
          >

            <h2>
              📈 Weekly Volume
            </h2>

            <br />

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <LineChart
                data={
                  weeklyVolumeData
                }
              >

                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="#2563eb"
                  strokeWidth={3}
                />

                <CartesianGrid
                  stroke="#374151"
                />

                <XAxis
                  dataKey="name"
                />

                <YAxis />

                <Tooltip />

              </LineChart>

            </ResponsiveContainer>

          </div>

          <div
            style={{
              background:
                theme === "light"
                  ? "white"
                  : "#111827",

              padding: 25,

              borderRadius: 20,
            }}
          >

            <h2>
              👥 User Growth
            </h2>

            <br />

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <BarChart
                data={
                  userGrowthData
                }
              >

                <Bar
                  dataKey="users"
                  fill="#16a34a"
                />

                <CartesianGrid
                  stroke="#374151"
                />

                <XAxis
                  dataKey="name"
                />

                <YAxis />

                <Tooltip />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* SEARCH */}

        <input
          type="text"

          placeholder="Search transaction..."

          value={search}

          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }

          style={{
            width: "100%",

            padding: 15,

            borderRadius: 12,

            marginBottom: 30,

            border: "none",
          }}
        />

        {/* FRAUD ALERTS */}

        <h2>
          🚨 Fraud Alerts
        </h2>

        <br />

        {fraudAlerts.map(
          (
            alert: any,
            index: number
          ) => (

            <div
              key={index}

              style={{
                background:
                  "#7f1d1d",

                padding: 25,

                borderRadius: 20,

                marginBottom: 20,

                color:
                  "white",
              }}
            >

              <p>
                <strong>
                  Type:
                </strong>{" "}
                {alert.type ||
                  "Fraud Alert"}
              </p>

              <br />

              <p>
                <strong>
                  Severity:
                </strong>{" "}
                {alert.severity ||
                  "high"}
              </p>

              <br />

              <p>
                <strong>
                  User:
                </strong>{" "}
                {alert.user ||
                  alert.transaction
                    ?.fromEmail}
              </p>

              <br />

              <p>
                <strong>
                  Amount:
                </strong>{" "}
                $
                {alert.amount ||
                  alert.transaction
                    ?.amount}
              </p>

            </div>

          )
        )}

        {/* WITHDRAWALS */}

        <h2>
          🏦 Treasury Withdrawal Center
        </h2>

        <br />

        {withdrawals.map(
          (
            withdrawal: any,
            index: number
          ) => (

            <div
              key={index}

              style={{
                background:
                  "#111827",

                padding: 25,

                borderRadius: 20,

                marginBottom: 20,
              }}
            >

              <p>
                <strong>
                  User:
                </strong>{" "}
                {withdrawal.email}
              </p>

              <br />

              <p>
                <strong>
                  Amount:
                </strong>{" "}
                ${withdrawal.amount}
              </p>

              <br />

              <p>
                <strong>
                  Method:
                </strong>{" "}
                {withdrawal.method}
              </p>

              <br />

              <p>
                <strong>
                  Destination:
                </strong>{" "}
                {withdrawal.destination}
              </p>

              <br />

              <p>
                <strong>
                  Risk:
                </strong>{" "}

                <span
                  style={{
                    color:
                      withdrawal.riskLevel ===
                      "high"
                        ? "#dc2626"
                        : "#16a34a",

                    fontWeight:
                      "bold",
                  }}
                >
                  {withdrawal.riskLevel}
                </span>

              </p>

              <br />

              <p>
                <strong>
                  Status:
                </strong>{" "}
                {withdrawal.status}
              </p>

              <br />

              {withdrawal.status ===
                "pending" && (

                <div
                  style={{
                    display: "flex",

                    gap: 10,
                  }}
                >

                  <button
                    onClick={() =>
                      approveWithdrawal(
                        withdrawal._id
                      )
                    }

                    style={{
                      padding:
                        "10px 20px",

                      background:
                        "#16a34a",

                      color:
                        "white",

                      border:
                        "none",

                      borderRadius:
                        10,

                      cursor:
                        "pointer",

                      fontWeight:
                        "bold",
                    }}
                  >
                    Approve
                  </button>

                  <button
                    onClick={() =>
                      rejectWithdrawal(
                        withdrawal._id
                      )
                    }

                    style={{
                      padding:
                        "10px 20px",

                      background:
                        "#dc2626",

                      color:
                        "white",

                      border:
                        "none",

                      borderRadius:
                        10,

                      cursor:
                        "pointer",

                      fontWeight:
                        "bold",
                    }}
                  >
                    Reject
                  </button>

                </div>

              )}

            </div>

          )
        )}

        {/* LIVE TRANSACTIONS */}

        <h2>
          💸 Live Transactions
        </h2>

        <br />

        {filteredTransactions.map(
          (
            tx: any,
            index: number
          ) => (

            <div
              key={index}

              style={{
                background:
                  theme === "light"
                    ? "white"
                    : "#111827",

                padding: 25,

                borderRadius: 20,

                marginBottom: 20,
              }}
            >

              <p>
                <strong>
                  From:
                </strong>{" "}
                {tx.fromEmail}
              </p>

              <br />

              <p>
                <strong>
                  To:
                </strong>{" "}
                {tx.toEmail}
              </p>

              <br />

              <p>
                <strong>
                  Amount:
                </strong>{" "}
                ${tx.amount}
              </p>

              <br />

              <p>
                <strong>
                  Fee:
                </strong>{" "}
                ${tx.fee}
              </p>

              <br />

              <p>
                <strong>
                  Net:
                </strong>{" "}
                ${tx.netAmount}
              </p>

              <br />

              <p>
                <strong>
                  Date:
                </strong>{" "}
                {new Date(
                  tx.createdAt
                ).toLocaleString()}
              </p>

              <br />

              {tx.amount >=
                10000 && (

                <div
                  style={{
                    background:
                      "#dc2626",

                    color:
                      "white",

                    padding: 15,

                    borderRadius: 12,

                    fontWeight:
                      "bold",
                  }}
                >
                  🚨 Large transaction detected
                </div>

              )}

            </div>

          )
        )}

      </div>

    </div>
  );
}

// =========================
// CARD COMPONENT
// =========================

function Card({
  title,
  value,
}: any) {

  return (
    <div
      style={{
        background:
          "#111827",

        padding: 25,

        borderRadius: 20,

        color:
          "white",
      }}
    >

      <h3>
        {title}
      </h3>

      <br />

      <h1>
        {value}
      </h1>

    </div>
  );
}