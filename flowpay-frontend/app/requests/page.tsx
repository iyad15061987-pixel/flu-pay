"use client";

import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";

import API_URL from "@/lib/api";

interface Request {
  _id: string;
  type: string;
  method: string;
  amount: number;
  wallet: string;
  status: string;
  createdAt: string;
}

export default function RequestsPage() {
  const [requests, setRequests] =
    useState<Request[]>([]);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const email =
          localStorage.getItem(
            "email"
          );

        const res =
          await fetch(
            `${API_URL}/my-requests/${email}`,
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
          padding: 40,
          width: "100%",
          color: "white",
        }}
      >
        <h1>
          📋 My Requests
        </h1>

        <br />

        {requests.length ===
        0 ? (
          <p>
            No requests yet
          </p>
        ) : (
          requests.map(
            (request) => (
              <div
                key={
                  request._id
                }
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
                  {
                    request.type
                  }
                </p>

                <p>
                  <strong>
                    Method:
                  </strong>{" "}
                  {
                    request.method
                  }
                </p>

                <p>
                  <strong>
                    Amount:
                  </strong>{" "}
                  $
                  {
                    request.amount
                  }
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
                  {
                    request.status
                  }
                </p>

                <p>
                  <strong>
                    Date:
                  </strong>{" "}
                  {new Date(
                    request.createdAt
                  ).toLocaleString()}
                </p>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}