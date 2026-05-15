"use client";

import { useEffect, useState } from "react";
import API_URL from "@/lib/api";

interface User {
  _id: string;
  email: string;
  balance: number;
  role: string;
  frozen: boolean;
  revenue: number;
}

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

interface Log {
  _id: string;
  action: string;
  email: string;
  createdAt: string;
}

interface Request {
  _id: string;
  email: string;
  type: string;
  method: string;
  amount: number;
  wallet: string;
  status: string;
}

interface Support {
  _id: string;
  email: string;
  subject: string;
  message: string;
  status: string;
}

export default function AdminPage() {
  const [users, setUsers] =
    useState<User[]>([]);

  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  const [logs, setLogs] =
    useState<Log[]>([]);

  const [requests, setRequests] =
    useState<Request[]>([]);

  const [supports, setSupports] =
    useState<Support[]>([]);

  const [revenue, setRevenue] =
    useState(0);

  useEffect(() => {
    checkAdmin();
    loadUsers();
    loadRevenue();
    loadLogs();
    loadRequests();
    loadSupports();
  }, []);

  const checkAdmin = async () => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      window.location.href =
        "/login";

      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/me`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await res.json();

      if (
        data.role !== "admin"
      ) {
        alert("Access denied");

        window.location.href =
          "/dashboard";
      }

    } catch (err) {
      alert("Server error");
    }
  };

  const loadUsers = async () => {
    try {
      const token =
        localStorage.getItem(
          "token"
        );

      const res = await fetch(
        `${API_URL}/users`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await res.json();

      setUsers(data);

      loadTransactions(data);

    } catch (err) {
      console.log(err);
    }
  };

  const loadTransactions =
    async (usersData: User[]) => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const allTx =
          await Promise.all(
            usersData.map(
              async (user) => {
                const res =
                  await fetch(
                    `${API_URL}/transactions/${user.email}`,
                    {
                      headers: {
                        Authorization:
                          `Bearer ${token}`,
                      },
                    }
                  );

                return await res.json();
              }
            )
          );

        const merged =
          allTx.flat();

        const unique =
          merged.filter(
            (
              tx,
              index,
              self
            ) =>
              index ===
              self.findIndex(
                (t) =>
                  t._id ===
                  tx._id
              )
          );

        setTransactions(
          unique
        );

      } catch (err) {
        console.log(err);
      }
    };

  const loadRevenue =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/admin-revenue`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        setRevenue(
          data.revenue || 0
        );

      } catch (err) {
        console.log(err);
      }
    };

  const loadLogs =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/logs`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        setLogs(data || []);

      } catch (err) {
        console.log(err);
      }
    };

  const loadRequests =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/requests`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        setRequests(data);

      } catch (err) {
        console.log(err);
      }
    };

  const loadSupports =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/support-tickets`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        setSupports(data);

      } catch (err) {
        console.log(err);
      }
    };

  const addBalance = async (
    userId: string
  ) => {
    const amount =
      prompt(
        "Enter amount"
      );

    if (!amount) return;

    try {
      const token =
        localStorage.getItem(
          "token"
        );

      await fetch(
        `${API_URL}/add-balance`,
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
            amount,
          }),
        }
      );

      alert(
        "Balance added"
      );

      loadUsers();
      loadRevenue();

    } catch (err) {
      alert("Server error");
    }
  };

  const freezeUser = async (
    userId: string
  ) => {
    try {
      const token =
        localStorage.getItem(
          "token"
        );

      await fetch(
        `${API_URL}/freeze-user`,
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
          }),
        }
      );

      loadUsers();

    } catch (err) {
      alert("Server error");
    }
  };

  const deleteUser = async (
    userId: string
  ) => {
    const yes =
      confirm(
        "Delete user?"
      );

    if (!yes) return;

    try {
      const token =
        localStorage.getItem(
          "token"
        );

      await fetch(
        `${API_URL}/delete-user/${userId}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      loadUsers();

    } catch (err) {
      alert("Server error");
    }
  };

  const approveRequest =
    async (id: string) => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        await fetch(
          `${API_URL}/approve-request/${id}`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        loadRequests();
        loadUsers();
        loadRevenue();

      } catch (err) {
        alert("Server error");
      }
    };

  const rejectRequest =
    async (id: string) => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        await fetch(
          `${API_URL}/reject-request/${id}`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        loadRequests();

      } catch (err) {
        alert("Server error");
      }
    };

  return (
    <div
      style={{
        padding: 30,
        background: "#0f172a",
        minHeight: "100vh",
        color: "white",
      }}
    >
      <h1>
        🛡 Admin Dashboard
      </h1>

      <br />

      <div
        style={{
          background: "#111827",
          padding: 25,
          borderRadius: 15,
          marginBottom: 30,
        }}
      >
        <h2>
          💰 Total Revenue
        </h2>

        <br />

        <h1>
          $
          {revenue.toFixed(
            2
          )}
        </h1>
      </div>

      <h2>
        🏦 Requests
      </h2>

      <br />

      {requests.length === 0 ? (
        <p>
          No requests yet
        </p>
      ) : (
        requests.map(
          (request) => (
            <div
              key={request._id}
              style={{
                background:
                  "#111827",
                padding: 20,
                borderRadius: 15,
                marginBottom: 15,
              }}
            >
              <p>
                <strong>
                  User:
                </strong>{" "}
                {request.email}
              </p>

              <p>
                <strong>
                  Type:
                </strong>{" "}
                {request.type}
              </p>

              <p>
                <strong>
                  Method:
                </strong>{" "}
                {request.method}
              </p>

              <p>
                <strong>
                  Amount:
                </strong>{" "}
                $
                {request.amount}
              </p>

              <p>
                <strong>
                  Wallet:
                </strong>{" "}
                {request.wallet ||
                  "-"}
              </p>

              <p>
                <strong>
                  Status:
                </strong>{" "}
                {request.status}
              </p>

              {request.status ===
                "pending" && (
                <>
                  <button
                    onClick={() =>
                      approveRequest(
                        request._id
                      )
                    }
                    style={{
                      marginTop: 10,
                      width: "100%",
                      padding: 12,
                      background:
                        "#16a34a",
                      border: "none",
                      borderRadius: 10,
                      color:
                        "white",
                      cursor:
                        "pointer",
                    }}
                  >
                    Approve
                  </button>

                  <button
                    onClick={() =>
                      rejectRequest(
                        request._id
                      )
                    }
                    style={{
                      marginTop: 10,
                      width: "100%",
                      padding: 12,
                      background:
                        "#dc2626",
                      border: "none",
                      borderRadius: 10,
                      color:
                        "white",
                      cursor:
                        "pointer",
                    }}
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          )
        )
      )}

      <br />
      <br />

      <h2>
        👥 Users
      </h2>

      <br />

      {users.map((user) => (
        <div
          key={user._id}
          style={{
            background: "#111827",
            padding: 20,
            borderRadius: 15,
            marginBottom: 15,
          }}
        >
          <p>
            <strong>Email:</strong>{" "}
            {user.email}
          </p>

          <p>
            <strong>Balance:</strong>{" "}
            ${user.balance}
          </p>

          <p>
            <strong>Revenue:</strong>{" "}
            ${user.revenue || 0}
          </p>

          <p>
            <strong>Role:</strong>{" "}
            {user.role}
          </p>

          <p>
            <strong>Frozen:</strong>{" "}
            {user.frozen
              ? "Yes"
              : "No"}
          </p>

          <button
            onClick={() =>
              addBalance(
                user._id
              )
            }
            style={{
              marginTop: 10,
              width: "100%",
              padding: 12,
              background: "#16a34a",
              border: "none",
              borderRadius: 10,
              color: "white",
              cursor: "pointer",
            }}
          >
            Add Balance
          </button>

          <button
            onClick={() =>
              freezeUser(
                user._id
              )
            }
            style={{
              marginTop: 10,
              width: "100%",
              padding: 12,
              background: "#dc2626",
              border: "none",
              borderRadius: 10,
              color: "white",
              cursor: "pointer",
            }}
          >
            {user.frozen
              ? "Unfreeze User"
              : "Freeze User"}
          </button>

          <button
            onClick={() =>
              deleteUser(
                user._id
              )
            }
            style={{
              marginTop: 10,
              width: "100%",
              padding: 12,
              background: "#7f1d1d",
              border: "none",
              borderRadius: 10,
              color: "white",
              cursor: "pointer",
            }}
          >
            Delete User
          </button>
        </div>
      ))}

      <br />
      <br />

      <h2>
        📜 All Transactions
      </h2>

      <br />

      {transactions.length === 0 ? (
        <p>
          No transactions yet
        </p>
      ) : (
        transactions.map(
          (tx, index) => (
            <div
              key={index}
              style={{
                background:
                  "#111827",
                padding: 20,
                borderRadius: 15,
                marginBottom: 15,
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

      <br />
      <br />

      <h2>
        🆘 Support Tickets
      </h2>

      <br />

      {supports.length === 0 ? (
        <p>
          No tickets yet
        </p>
      ) : (
        supports.map(
          (ticket) => (
            <div
              key={ticket._id}
              style={{
                background:
                  "#111827",
                padding: 20,
                borderRadius: 15,
                marginBottom: 15,
              }}
            >
              <p>
                <strong>
                  User:
                </strong>{" "}
                {ticket.email}
              </p>

              <p>
                <strong>
                  Subject:
                </strong>{" "}
                {ticket.subject}
              </p>

              <p>
                <strong>
                  Message:
                </strong>{" "}
                {ticket.message}
              </p>

              <p>
                <strong>
                  Status:
                </strong>{" "}
                {ticket.status}
              </p>
            </div>
          )
        )
      )}

      <br />
      <br />

      <h2>
        📋 Activity Logs
      </h2>

      <br />

      {logs.length === 0 ? (
        <p>
          No logs yet
        </p>
      ) : (
        logs.map((log) => (
          <div
            key={log._id}
            style={{
              background:
                "#111827",
              padding: 20,
              borderRadius: 15,
              marginBottom: 15,
            }}
          >
            <p>
              <strong>
                Action:
              </strong>{" "}
              {log.action}
            </p>

            <p>
              <strong>
                User:
              </strong>{" "}
              {log.email}
            </p>

            <p>
              <strong>
                Date:
              </strong>{" "}
              {new Date(
                log.createdAt
              ).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
}