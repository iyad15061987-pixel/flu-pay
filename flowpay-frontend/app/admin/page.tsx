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
  // CHART DATA
  // =========================

  const chartData = [
    {
      name: "Mon",
      volume: 12000,
      users: 20,
    },

    {
      name: "Tue",
      volume: 18000,
      users: 35,
    },

    {
      name: "Wed",
      volume: 24000,
      users: 50,
    },

    {
      name: "Thu",
      volume: 16000,
      users: 28,
    },

    {
      name: "Fri",
      volume: 42000,
      users: 65,
    },

    {
      name: "Sat",
      volume: 38000,
      users: 55,
    },

    {
      name: "Sun",
      volume: 52000,
      users: 80,
    },
  ];

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

    loadTransactions();

    loadFraudAlerts();

    loadAnalytics();

    // =========================
    // SOCKET.IO
    // =========================

    const socket =
      io(
        API_URL.replace(
          "/api",
          ""
        )
      );

    socket.on(
      "connect",

      () => {

        console.log(
          "✅ Socket connected"
        );

        setSocketConnected(
          true
        );
      }
    );

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
    // LIVE TRANSACTIONS
    // =========================

    socket.on(
      "new_transaction",

      (tx) => {

        setTransactions(
          (prev) => [
            tx,
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

        setFraudAlerts(
          (prev) => [
            alert,
            ...prev,
          ]
        );
      }
    );

    // =========================
    // CLEANUP
    // =========================

    return () => {
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
  // FILTER
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
          {/* WEEKLY VOLUME */}

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
                data={chartData}
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

          {/* USER GROWTH */}

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
                data={chartData}
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
                  Risk Score:
                </strong>{" "}
                {alert.riskScore}
              </p>

              <br />

              <p>
                <strong>
                  Flags:
                </strong>{" "}
                {alert.flags.join(
                  ", "
                )}
              </p>

              <br />

              <p>
                <strong>
                  From:
                </strong>{" "}
                {
                  alert.transaction
                    .fromEmail
                }
              </p>

              <br />

              <p>
                <strong>
                  To:
                </strong>{" "}
                {
                  alert.transaction
                    .toEmail
                }
              </p>

              <br />

              <p>
                <strong>
                  Amount:
                </strong>{" "}
                $
                {
                  alert.transaction
                    .amount
                }
              </p>
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