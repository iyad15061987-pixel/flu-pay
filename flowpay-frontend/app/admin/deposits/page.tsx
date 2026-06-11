"use client";

import { useEffect, useState } from "react";
import API_URL from "@/lib/api";

export default function AdminDepositsPage() {

  const [requests, setRequests] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const loadRequests =
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

        console.log(
          "ADMIN DEPOSITS RESPONSE:",
          data
        );

        if (
          Array.isArray(data)
        ) {

          setRequests(data);

        } else {

          setRequests([]);

        }

      } catch (err) {

        console.log(err);

        setRequests([]);

      } finally {

        setLoading(false);

      }

    };

  const approve =
    async (id: string) => {

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
                requestId: id,
              }),
            }
          );

        const data =
          await res.json();

        alert(
          data.message
        );

        loadRequests();

      } catch (err) {

        console.log(err);

        alert(
          "Approve failed"
        );

      }

    };

  useEffect(() => {

    loadRequests();

  }, []);

  return (

    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        padding: 40,
      }}
    >

      <h1
        style={{
          fontSize: 32,
          marginBottom: 25,
        }}
      >
        💰 Deposit Requests
      </h1>

      {loading && (

        <p>
          Loading...
        </p>

      )}

      {!loading &&
        requests.length === 0 && (

        <div
          style={{
            background: "#111827",
            padding: 25,
            borderRadius: 15,
            border:
              "1px solid #374151",
          }}
        >
          No pending deposit requests.
        </div>

      )}

      {requests.map(
        (item) => (

          <div
            key={item._id}
            style={{
              background:
                "#111827",

              border:
                "1px solid #374151",

              padding: 20,

              marginBottom: 20,

              borderRadius: 15,
            }}
          >

            <p>
              <strong>
                Email:
              </strong>{" "}
              {item.email}
            </p>

            <br />

            <p>
              <strong>
                Amount:
              </strong>{" "}
              $
              {item.amount}
            </p>

            <br />

            <p>
              <strong>
                Method:
              </strong>{" "}
              {item.method}
            </p>

            <br />

            <p>
              <strong>
                Status:
              </strong>{" "}
              {item.status}
            </p>

            <br />

            {item.status ===
              "Pending" && (

              <button
                onClick={() =>
                  approve(
                    item._id
                  )
                }
                style={{
                  background:
                    "#16a34a",

                  color:
                    "white",

                  border:
                    "none",

                  padding:
                    "10px 20px",

                  borderRadius:
                    10,

                  cursor:
                    "pointer",

                  fontWeight:
                    "bold",
                }}
              >
                ✅ Approve
              </button>

            )}

          </div>

        )
      )}

    </div>

  );

}