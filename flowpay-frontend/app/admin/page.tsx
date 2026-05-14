"use client";

import { useEffect, useState } from "react";
import API_URL from "@/lib/api";

interface User {
  _id: string;
  email: string;
  balance: number;
  role: string;
  frozen: boolean;
}

interface Transaction {
  _id: string;
  fromEmail: string;
  toEmail: string;
  amount: number;
  createdAt: string;
}

export default function AdminPage() {
  const [users, setUsers] =
    useState<User[]>([]);

  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  useEffect(() => {
    checkAdmin();
    loadUsers();
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
  );
}