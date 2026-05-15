"use client";

import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";

import API_URL from "@/lib/api";

export default function AdminPage() {
  const [users, setUsers] =
    useState<any[]>([]);

  const [depositRequests, setDepositRequests] =
    useState<any[]>([]);

  const [
    withdrawRequests,
    setWithdrawRequests,
  ] = useState<any[]>([]);

  const [search, setSearch] =
    useState("");

  useEffect(() => {
    loadUsers();

    loadDepositRequests();

    loadWithdrawRequests();
  }, []);

  const loadUsers =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

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

        const data =
          await res.json();

        setUsers(data);

      } catch (err) {
        console.log(err);
      }
    };

  const loadDepositRequests =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/admin/deposit-requests`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        setDepositRequests(
          data
        );

      } catch (err) {
        console.log(err);
      }
    };

  const loadWithdrawRequests =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/admin/withdraw-requests`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        setWithdrawRequests(
          data
        );

      } catch (err) {
        console.log(err);
      }
    };

  const approveDeposit =
    async (requestId: string) => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/approve-deposit`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                requestId,
              }),
            }
          );

        const data =
          await res.json();

        alert(data.message);

        loadDepositRequests();

        loadUsers();

      } catch (err) {
        alert("Server error");
      }
    };

  const approveWithdraw =
    async (requestId: string) => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/approve-withdraw`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                requestId,
              }),
            }
          );

        const data =
          await res.json();

        alert(data.message);

        loadWithdrawRequests();

        loadUsers();

      } catch (err) {
        alert("Server error");
      }
    };

  const freezeUser =
    async (
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
        console.log(err);
      }
    };

  const unfreezeUser =
    async (
      userId: string
    ) => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        await fetch(
          `${API_URL}/unfreeze-user`,
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
        console.log(err);
      }
    };

  const deleteUser =
    async (
      userId: string
    ) => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const confirmDelete =
          confirm(
            "Delete this user?"
          );

        if (
          !confirmDelete
        )
          return;

        await fetch(
          `${API_URL}/delete-user`,
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
        console.log(err);
      }
    };

  const filteredUsers =
    users.filter(
      (u: any) =>
        u.email
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

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
          🛡 Admin Panel
        </h1>

        <br />

        <h2>
          👥 Users
        </h2>

        <br />

        <input
          type="text"
          placeholder="Search user..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          style={{
            width: "100%",

            padding: 15,

            borderRadius: 10,

            marginBottom: 20,

            border: "none",
          }}
        />

        {filteredUsers.length ===
        0 ? (
          <div
            style={{
              background:
                "#111827",

              padding: 30,

              borderRadius: 20,

              textAlign:
                "center",
            }}
          >
            <h2>
              📭 Empty
            </h2>

            <br />

            <p>
              No users found
            </p>
          </div>
        ) : (
          filteredUsers.map(
            (user) => (
              <div
                key={user._id}
                style={{
                  background:
                    localStorage.getItem(
                      "theme"
                    ) ===
                    "light"
                      ? "white"
                      : "#111827",

                  padding: 25,

                  borderRadius: 20,

                  marginBottom: 20,

                  boxShadow:
                    "0 0 10px rgba(0,0,0,0.1)",
                }}
              >
                <p>
                  <strong>
                    Email:
                  </strong>{" "}
                  {user.email}
                </p>

                <br />

                <p>
                  <strong>
                    Balance:
                  </strong>{" "}
                  $
                  {
                    user.balance
                  }
                </p>

                <br />

                <p>
                  <strong>
                    Revenue:
                  </strong>{" "}
                  $
                  {
                    user.revenue
                  }
                </p>

                <br />

                <p>
                  <strong>
                    Frozen:
                  </strong>{" "}
                  {user.frozen
                    ? "Yes"
                    : "No"}
                </p>

                <br />

                <div
                  style={{
                    display: "flex",

                    gap: 10,

                    flexWrap:
                      "wrap",
                  }}
                >
                  <button
                    onClick={() =>
                      freezeUser(
                        user._id
                      )
                    }
                    style={{
                      padding:
                        "10px 20px",

                      background:
                        "#dc2626",

                      border:
                        "none",

                      borderRadius: 10,

                      color:
                        "white",

                      cursor:
                        "pointer",
                    }}
                  >
                    Freeze
                  </button>

                  <button
                    onClick={() =>
                      unfreezeUser(
                        user._id
                      )
                    }
                    style={{
                      padding:
                        "10px 20px",

                      background:
                        "#16a34a",

                      border:
                        "none",

                      borderRadius: 10,

                      color:
                        "white",

                      cursor:
                        "pointer",
                    }}
                  >
                    Unfreeze
                  </button>

                  <button
                    onClick={() =>
                      deleteUser(
                        user._id
                      )
                    }
                    style={{
                      padding:
                        "10px 20px",

                      background:
                        "#111827",

                      border:
                        "none",

                      borderRadius: 10,

                      color:
                        "white",

                      cursor:
                        "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          )
        )}

        <br />
        <br />

        <h2>
          🏦 Deposit Requests
        </h2>

        <br />

        {depositRequests.length ===
        0 ? (
          <div
            style={{
              background:
                "#111827",

              padding: 30,

              borderRadius: 20,

              textAlign:
                "center",
            }}
          >
            <h2>
              📭 Empty
            </h2>

            <br />

            <p>
              No deposit requests
            </p>
          </div>
        ) : (
          depositRequests.map(
            (request) => (
              <div
                key={request._id}
                style={{
                  background:
                    localStorage.getItem(
                      "theme"
                    ) ===
                    "light"
                      ? "white"
                      : "#111827",

                  padding: 25,

                  borderRadius: 20,

                  marginBottom: 20,

                  boxShadow:
                    "0 0 10px rgba(0,0,0,0.1)",
                }}
              >
                <p>
                  <strong>
                    Email:
                  </strong>{" "}
                  {
                    request.email
                  }
                </p>

                <br />

                <p>
                  <strong>
                    Amount:
                  </strong>{" "}
                  $
                  {
                    request.amount
                  }
                </p>

                <br />

                <p>
                  <strong>
                    Method:
                  </strong>{" "}
                  {
                    request.method
                  }
                </p>

                <br />

                <button
                  onClick={() =>
                    approveDeposit(
                      request._id
                    )
                  }
                  style={{
                    padding:
                      "10px 20px",

                    background:
                      "#16a34a",

                    border:
                      "none",

                    borderRadius: 10,

                    color:
                      "white",

                    cursor:
                      "pointer",
                  }}
                >
                  Approve Deposit
                </button>
              </div>
            )
          )
        )}

        <br />
        <br />

        <h2>
          💸 Withdraw Requests
        </h2>

        <br />

        {withdrawRequests.length ===
        0 ? (
          <div
            style={{
              background:
                "#111827",

              padding: 30,

              borderRadius: 20,

              textAlign:
                "center",
            }}
          >
            <h2>
              📭 Empty
            </h2>

            <br />

            <p>
              No withdraw requests
            </p>
          </div>
        ) : (
          withdrawRequests.map(
            (request) => (
              <div
                key={request._id}
                style={{
                  background:
                    localStorage.getItem(
                      "theme"
                    ) ===
                    "light"
                      ? "white"
                      : "#111827",

                  padding: 25,

                  borderRadius: 20,

                  marginBottom: 20,

                  boxShadow:
                    "0 0 10px rgba(0,0,0,0.1)",
                }}
              >
                <p>
                  <strong>
                    Email:
                  </strong>{" "}
                  {
                    request.email
                  }
                </p>

                <br />

                <p>
                  <strong>
                    Amount:
                  </strong>{" "}
                  $
                  {
                    request.amount
                  }
                </p>

                <br />

                <p>
                  <strong>
                    Method:
                  </strong>{" "}
                  {
                    request.method
                  }
                </p>

                <br />

                <p>
                  <strong>
                    Wallet:
                  </strong>{" "}
                  {
                    request.wallet
                  }
                </p>

                <br />

                <button
                  onClick={() =>
                    approveWithdraw(
                      request._id
                    )
                  }
                  style={{
                    padding:
                      "10px 20px",

                    background:
                      "#2563eb",

                    border:
                      "none",

                    borderRadius: 10,

                    color:
                      "white",

                    cursor:
                      "pointer",
                  }}
                >
                  Approve Withdraw
                </button>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}