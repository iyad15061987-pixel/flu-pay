"use client";

import {
  useEffect,
  useState,
  useCallback,
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

  const [accounting, setAccounting] =
    useState<any>(null);

  const [treasuryHealth, setTreasuryHealth] =
    useState<any>(null);

  const [users, setUsers] =
    useState<any[]>([]);

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

  const chartData =
    analytics?.weeklyVolume?.map(
      (item: any) => {

        const user =
          analytics?.userGrowth?.find(
            (u: any) =>
              u._id === item._id
          );

        return {

          name: item._id,

          volume: Number(
            item.volume || 0
          ),

          transactions: Number(
            item.transactions || 0
          ),

          users: Number(
            user?.users || 0
          ),

        };

      }
    ) || [];


  // =========================
  // LOAD ANALYTICS
  // =========================

  const loadAnalytics =
    useCallback(async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          return;
        }

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

        if (!res.ok) {
          console.log(
            "Analytics request failed:",
            res.status
          );
          return;
        }

        const data =
          await res.json();

        setAnalytics(data);

      } catch (err) {

        console.log(
          "Analytics error",
          err
        );

      }

    }, []);


  // =========================
  // LOAD ACCOUNTING
  // =========================

  const loadAccounting =
    useCallback(async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          return;
        }

        const res =
          await fetch(
            `${API_URL}/accounting/dashboard`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (!res.ok) {
          console.log(
            "Accounting request failed:",
            res.status
          );
          return;
        }

        const data =
          await res.json();

        setAccounting(data);

      } catch (err) {

        console.log(
          "Accounting error",
          err
        );

      }

    }, []);


  // =========================
  // LOAD TREASURY HEALTH
  // =========================

  const loadTreasuryHealth =
    useCallback(async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          return;
        }

        const res =
          await fetch(
            `${API_URL}/treasury/health`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (!res.ok) {
          console.log(
            "Treasury health request failed:",
            res.status
          );
          return;
        }

        const data =
          await res.json();

        setTreasuryHealth(data);

      } catch (err) {

        console.log(
          "Treasury health error",
          err
        );

      }

    }, []);


  // =========================
  // LOAD USERS
  // =========================

  const loadUsers =
    useCallback(async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          return;
        }

        const res =
          await fetch(
            `${API_URL}/admin/users`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (!res.ok) {
          console.log(
            "Users request failed:",
            res.status
          );
          return;
        }

        const data =
          await res.json();

        setUsers(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (err) {

        console.log(
          "Users error",
          err
        );

      }

    }, []);


  // =========================
  // LOAD TRANSACTIONS
  // =========================

  const loadTransactions =
    useCallback(async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          return;
        }

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

        if (!res.ok) {
          console.log(
            "Transactions request failed:",
            res.status
          );
          return;
        }

        const data =
          await res.json();

        setTransactions(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (err) {

        console.log(
          "Transactions error",
          err
        );

      } finally {

        setLoading(false);

      }

    }, []);


  // =========================
  // LOAD FRAUD ALERTS
  // =========================

  const loadFraudAlerts =
    useCallback(async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          return;
        }

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

        if (!res.ok) {
          console.log(
            "Fraud request failed:",
            res.status
          );
          return;
        }

        const data =
          await res.json();

        setFraudAlerts(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (err) {

        console.log(
          "Fraud error",
          err
        );

      }

    }, []);


  // =========================
  // INITIAL LOAD + SOCKET
  // =========================

  useEffect(() => {

    setMounted(true);

    const saved =
      localStorage.getItem(
        "theme"
      );

    if (saved) {
      setTheme(saved);
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

    if (role !== "admin") {

      alert(
        "Admin access only"
      );

      window.location.href =
        "/dashboard";

      return;

    }

    loadAnalytics();

    loadAccounting();

    loadUsers();

    loadTransactions();

    loadTreasuryHealth();

    loadFraudAlerts();


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
          "Socket connected"
        );

        setSocketConnected(true);

      }
    );


    socket.on(
      "disconnect",
      () => {

        setSocketConnected(false);

      }
    );


    socket.on(
      "new_transaction",
      (tx: any) => {

        setTransactions(
          prev => [
            tx,
            ...prev
          ]
        );

        loadAnalytics();

        loadAccounting();

        loadTreasuryHealth();

      }
    );


    socket.on(
      "fraud_alert",
      (alert: any) => {

        setFraudAlerts(
          prev => [
            alert,
            ...prev
          ]
        );

      }
    );


    return () => {

      socket.disconnect();

    };

  }, [
    loadAnalytics,
    loadAccounting,
    loadUsers,
    loadTransactions,
    loadTreasuryHealth,
    loadFraudAlerts
  ]);


  // =========================
  // FILTER TRANSACTIONS
  // =========================

  const filteredTransactions =
    transactions.filter(
      (tx: any) =>

        tx.fromEmail
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )

        ||

        tx.toEmail
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )

    );


  // =========================
  // MOUNT CHECK
  // =========================

  if (!mounted) {
    return null;
  }


  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (

      <div
        style={{
          minHeight: "100vh",
          background: "#0f172a",
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 25
        }}
      >

        Loading...

      </div>

    );

  }


  // =========================
  // MAIN PAGE
  // =========================

  return (

    <div
      style={{
        display: "flex",

        background:
          theme === "light"
            ? "#f3f4f6"
            : "#0f172a",

        minHeight: "100vh"
      }}
    >

      <Sidebar />


      <div
        style={{
          marginLeft: 250,
          padding: 40,
          width: "100%",
          color: "white"
        }}
      >


        {/* =========================
            HEADER
        ========================= */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 30
          }}
        >

          <div>

            <h1>
              🛡️ FlowPay Admin Center
            </h1>


            <p
              style={{
                marginTop: 10,
                color:
                  socketConnected
                    ? "#16a34a"
                    : "#dc2626"
              }}
            >

              {
                socketConnected
                  ? "🟢 Live Connected"
                  : "🔴 Offline"
              }

            </p>

          </div>


          <button
            onClick={() => {

              localStorage.clear();

              window.location.href =
                "/login";

            }}
            style={{
              padding: "12px 20px",
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: 10,
              cursor: "pointer"
            }}
          >

            Logout

          </button>

        </div>


        {/* =========================
            ANALYTICS
        ========================= */}

        {
          analytics && (

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(250px,1fr))",
                gap: 20,
                marginBottom: 40
              }}
            >

              <Card
                title="👥 Total Users"
                value={
                  Number(
                    analytics.totalUsers || 0
                  )
                }
              />


              <Card
                title="💸 Total Volume"
                value={
                  `$${Number(
                    analytics.totalVolume || 0
                  ).toFixed(2)}`
                }
              />


              <Card
                title="📈 Daily Volume"
                value={
                  `$${Number(
                    analytics.dailyVolume || 0
                  ).toFixed(2)}`
                }
              />


              <Card
                title="📅 Monthly Volume"
                value={
                  `$${Number(
                    analytics.monthlyVolume || 0
                  ).toFixed(2)}`
                }
              />


              <Card
                title="💰 Fees"
                value={
                  `$${Number(
                    analytics.totalFees || 0
                  ).toFixed(4)}`
                }
              />


              <Card
                title="🚨 Fraud"
                value={
                  analytics.suspiciousTransactions || 0
                }
              />


              <Card
                title="🪪 KYC"
                value={
                  analytics.totalKyc || 0
                }
              />


              <Card
                title="❄️ Frozen Users"
                value={
                  analytics.frozenUsers || 0
                }
              />

            </div>

          )
        }


        {/* =========================
            ACCOUNTING
        ========================= */}

        {
          accounting && (

            <div
              style={{
                marginBottom: 40
              }}
            >

              <h2
                style={{
                  marginBottom: 20
                }}
              >
                🏦 Financial & Treasury Control
              </h2>


              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(240px,1fr))",
                  gap: 20
                }}
              >

                <Card
                  title="🏦 Treasury Balance"
                  value={
                    `$${Number(
                      accounting.treasuryBalance || 0
                    ).toFixed(4)}`
                  }
                />


                <Card
                  title="💰 Treasury Revenue"
                  value={
                    `$${Number(
                      accounting.treasuryRevenue || 0
                    ).toFixed(4)}`
                  }
                />


                <Card
                  title="💵 Platform Revenue"
                  value={
                    `$${Number(
                      accounting.platformRevenue || 0
                    ).toFixed(4)}`
                  }
                />


                <Card
                  title="🔄 Total Volume"
                  value={
                    `$${Number(
                      accounting.totalVolume || 0
                    ).toFixed(2)}`
                  }
                />


                <Card
                  title="⚠️ Liabilities"
                  value={
                    `$${Number(
                      accounting.liabilities || 0
                    ).toFixed(4)}`
                  }
                />


                <Card
                  title="🛡️ Reserves"
                  value={
                    `$${Number(
                      accounting.reserves || 0
                    ).toFixed(4)}`
                  }
                />


                <Card
                  title="📊 Coverage Ratio"
                  value={
                    `${Number(
                      accounting.coverageRatio || 0
                    ).toFixed(2)}%`
                  }
                />

              </div>


              {/* =========================
                  TREASURY STATUS
              ========================= */}

              <div
                style={{
                  marginTop: 20,
                  padding: 25,
                  borderRadius: 20,

                  background:
                    Number(
                      accounting.coverageRatio || 0
                    ) >= 100
                      ? "#14532d"
                      : "#7f1d1d",

                  color: "white"
                }}
              >

                <h3>

                  {
                    Number(
                      accounting.coverageRatio || 0
                    ) >= 100
                      ? "🟢 Treasury Coverage Healthy"
                      : "🔴 Treasury Coverage Critical"
                  }

                </h3>


                <p
                  style={{
                    marginTop: 10
                  }}
                >

                  Current coverage:
                  {" "}

                  {
                    Number(
                      accounting.coverageRatio || 0
                    ).toFixed(2)
                  }%

                </p>


                <p
                  style={{
                    marginTop: 8
                  }}
                >

                  Reserves:
                  {" "}

                  $
                  {
                    Number(
                      accounting.reserves || 0
                    ).toFixed(4)
                  }

                </p>


                <p
                  style={{
                    marginTop: 8
                  }}
                >

                  Liabilities:
                  {" "}

                  $
                  {
                    Number(
                      accounting.liabilities || 0
                    ).toFixed(4)
                  }

                </p>

              </div>

            </div>

          )
        }


        {/* =========================
            ACCOUNTING LEDGER
        ========================= */}

        {
          accounting?.latest && (

            <div
              style={{
                background: "#111827",
                padding: 25,
                borderRadius: 20,
                marginBottom: 40
              }}
            >

              <h2>
                📒 Accounting Ledger
              </h2>


              <br />


              {
                accounting.latest.map(
                  (
                    entry: any,
                    index: number
                  ) => (

                    <div
                      key={
                        entry._id || index
                      }
                      style={{
                        background: "#1f2937",
                        padding: 20,
                        borderRadius: 15,
                        marginBottom: 15
                      }}
                    >

                      <p>
                        <strong>
                          Account:
                        </strong>
                        {" "}
                        {entry.account}
                      </p>


                      <br />


                      <p>

                        <strong>
                          Type:
                        </strong>

                        {" "}

                        {
                          entry.type === "credit"
                            ? "🟢 Credit"
                            : "🔴 Debit"
                        }

                      </p>


                      <br />


                      <p>

                        <strong>
                          Amount:
                        </strong>

                        {" "}

                        $
                        {
                          Number(
                            entry.amount || 0
                          ).toFixed(4)
                        }

                      </p>


                      <br />


                      <p>

                        <strong>
                          Description:
                        </strong>

                        {" "}

                        {
                          entry.description ||
                          "-"
                        }

                      </p>


                      <br />


                      <p>

                        <strong>
                          Date:
                        </strong>

                        {" "}

                        {
                          entry.createdAt
                            ? new Date(
                                entry.createdAt
                              ).toLocaleString()
                            : "-"
                        }

                      </p>

                    </div>

                  )
                )
              }

            </div>

          )
        }


        {/* =========================
            TREASURY HEALTH
        ========================= */}

        {
          treasuryHealth && (

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(250px,1fr))",
                gap: 20,
                marginBottom: 40
              }}
            >

              <Card
                title="🏦 Treasury Status"
                value={
                  treasuryHealth.status === "healthy"
                    ? "🟢 Healthy"
                    : "🔴 Warning"
                }
              />


              <Card
                title="💳 Treasury Account"
                value={
                  treasuryHealth.account || "-"
                }
              />


              <Card
                title="💰 Balance"
                value={
                  `$${Number(
                    treasuryHealth.balance || 0
                  ).toFixed(4)}`
                }
              />


              <Card
                title="📈 Revenue"
                value={
                  `$${Number(
                    treasuryHealth.revenue || 0
                  ).toFixed(4)}`
                }
              />

            </div>

          )
        }


        {/* =========================
            CHARTS
        ========================= */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "1fr 1fr",
            gap: 20,
            marginBottom: 40
          }}
        >

          <div
            style={{
              background: "#111827",
              padding: 25,
              borderRadius: 20
            }}
          >

            <h2>
              📈 Volume Growth
            </h2>


            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <LineChart
                data={chartData}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="name"
                />

                <YAxis />

                <Tooltip />


                <Line
                  type="monotone"
                  dataKey="volume"
                />

              </LineChart>

            </ResponsiveContainer>

          </div>


          <div
            style={{
              background: "#111827",
              padding: 25,
              borderRadius: 20
            }}
          >

            <h2>
              👥 User Growth
            </h2>


            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <BarChart
                data={chartData}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="name"
                />

                <YAxis />

                <Tooltip />


                <Bar
                  dataKey="users"
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>


        {/* =========================
            USERS MANAGEMENT
        ========================= */}

        <h2>
          👥 Users Management
        </h2>


        <br />


        <div
          style={{
            background: "#111827",
            padding: 25,
            borderRadius: 20,
            marginBottom: 40
          }}
        >

          {
            users.map(
              (user: any) => (

                <div
                  key={user._id}
                  style={{
                    background: "#1f2937",
                    padding: 20,
                    borderRadius: 15,
                    marginBottom: 15
                  }}
                >

                  <p>
                    <strong>
                      Email:
                    </strong>
                    {" "}
                    {user.email}
                  </p>


                  <p>
                    <strong>
                      Balance:
                    </strong>
                    {" "}
                    $
                    {
                      Number(
                        user.balance || 0
                      ).toFixed(2)
                    }
                  </p>


                  <p>
                    <strong>
                      Role:
                    </strong>
                    {" "}
                    {user.role}
                  </p>


                  <p>
                    <strong>
                      Status:
                    </strong>
                    {" "}
                    {
                      user.frozen
                        ? "🔴 Frozen"
                        : "🟢 Active"
                    }
                  </p>


                  <br />


                  <button
                    onClick={async () => {

                      try {

                        const token =
                          localStorage.getItem(
                            "token"
                          );

                        await fetch(
                          `${API_URL}/admin/users/${user._id}/freeze`,
                          {
                            method: "PUT",

                            headers: {
                              Authorization:
                                `Bearer ${token}`
                            }
                          }
                        );

                        loadUsers();

                      } catch (err) {

                        console.log(
                          "Freeze error",
                          err
                        );

                      }

                    }}
                    style={{
                      padding: "10px 15px",
                      marginRight: 10,
                      cursor: "pointer"
                    }}
                  >

                    ❄️ Freeze

                  </button>


                  <button
                    onClick={async () => {

                      try {

                        const token =
                          localStorage.getItem(
                            "token"
                          );

                        await fetch(
                          `${API_URL}/admin/users/${user._id}/unfreeze`,
                          {
                            method: "PUT",

                            headers: {
                              Authorization:
                                `Bearer ${token}`
                            }
                          }
                        );

                        loadUsers();

                      } catch (err) {

                        console.log(
                          "Unfreeze error",
                          err
                        );

                      }

                    }}
                    style={{
                      padding: "10px 15px",
                      cursor: "pointer"
                    }}
                  >

                    🔥 Unfreeze

                  </button>

                </div>

              )
            )
          }

        </div>


        {/* =========================
            SEARCH
        ========================= */}

        <input
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
            marginBottom: 30
          }}
        />


        {/* =========================
            FRAUD ALERTS
        ========================= */}

        <h2>
          🚨 Fraud Alerts
        </h2>


        <br />


        {
          fraudAlerts.map(
            (
              alert: any,
              index: number
            ) => (

              <div
                key={
                  alert._id || index
                }
                style={{
                  background: "#7f1d1d",
                  padding: 25,
                  borderRadius: 20,
                  marginBottom: 20
                }}
              >

                <p>
                  Risk Score:
                  {" "}
                  {alert.riskScore ?? 0}
                </p>


                <p>
                  Flags:
                  {" "}
                  {
                    alert.flags?.join(", ") ||
                    "-"
                  }
                </p>


                <p>
                  Amount:
                  {" "}
                  $
                  {
                    Number(
                      alert.transaction?.amount ||
                      0
                    ).toFixed(2)
                  }
                </p>

              </div>

            )
          )
        }


        {/* =========================
            LIVE TRANSACTIONS
        ========================= */}

        <h2>
          💸 Live Transactions
        </h2>


        <br />


        {
          filteredTransactions.map(
            (
              tx: any,
              index: number
            ) => (

              <div
                key={
                  tx._id ||
                  tx.transactionId ||
                  index
                }
                style={{
                  background: "#111827",
                  padding: 25,
                  borderRadius: 20,
                  marginBottom: 20
                }}
              >

                <p>
                  <strong>
                    From:
                  </strong>
                  {" "}
                  {tx.fromEmail || "-"}
                </p>


                <p>
                  <strong>
                    To:
                  </strong>
                  {" "}
                  {tx.toEmail || "-"}
                </p>


                <p>
                  <strong>
                    Amount:
                  </strong>
                  {" "}
                  $
                  {
                    Number(
                      tx.amount || 0
                    ).toFixed(2)
                  }
                </p>


                <p>
                  <strong>
                    Fee:
                  </strong>
                  {" "}
                  $
                  {
                    Number(
                      tx.fee || 0
                    ).toFixed(4)
                  }
                </p>


                <p>
                  <strong>
                    Date:
                  </strong>
                  {" "}
                  {
                    tx.createdAt
                      ? new Date(
                          tx.createdAt
                        ).toLocaleString()
                      : "-"
                  }
                </p>

              </div>

            )
          )
        }

      </div>

    </div>

  );

}


// =========================
// CARD COMPONENT
// =========================

function Card({
  title,
  value
}: any) {

  return (

    <div
      style={{
        background: "#111827",
        padding: 25,
        borderRadius: 20,
        color: "white"
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