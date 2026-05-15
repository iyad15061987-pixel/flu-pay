"use client";

import {
  useEffect,
  useState,
} from "react";

import Sidebar from "../components/Sidebar";

import API_URL from "@/lib/api";

export default function RequestsPage() {
  const [requests, setRequests] =
    useState<any[]>([]);

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

        const depositRes =
          await fetch(
            `${API_URL}/user-deposit-requests/${email}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const withdrawRes =
          await fetch(
            `${API_URL}/user-withdraw-requests/${email}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const deposits =
          await depositRes.json();

        const withdraws =
          await withdrawRes.json();

        setRequests([
          ...deposits,
          ...withdraws,
        ]);

      } catch (err) {
        console.log(err);
      }
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
          📋 My Requests
        </h1>

        <br />

        {requests.length ===
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
              No requests yet
            </p>
          </div>
        ) : (
          requests.map(
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
                    Type:
                  </strong>{" "}
                  {
                    request.type
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
                    Status:
                  </strong>{" "}
                  {
                    request.status
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
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}