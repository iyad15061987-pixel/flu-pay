"use client";

import {
  useEffect,
  useState,
} from "react";

import Sidebar from "../components/Sidebar";

import API_URL from "@/lib/api";

interface RequestItem {
  _id: string;

  type: string;

  amount: number;

  status: string;

  method: string;
}

export default function RequestsPage() {
  const [mounted, setMounted] =
    useState(false);

  const [theme, setTheme] =
    useState("dark");

  const [requests, setRequests] =
    useState<RequestItem[]>(
      []
    );

  useEffect(() => {
    setMounted(true);

    const savedTheme =
      localStorage.getItem(
        "theme"
      );

    if (savedTheme) {
      setTheme(savedTheme);
    }

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

        if (
          !token ||
          !email
        ) {
          return;
        }

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

  if (!mounted) {
    return null;
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
        <h1>
          📋 My Requests
        </h1>

        <br />

        {requests.length ===
        0 ? (
          <div
            style={{
              background:
                theme === "light"
                  ? "white"
                  : "#111827",

              padding: 30,

              borderRadius: 20,

              textAlign:
                "center",

              boxShadow:
                "0 0 10px rgba(0,0,0,0.1)",
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
            (
              request:
                RequestItem,
              index: number
            ) => (
              <div
                key={
                  request._id ||
                  index
                }
                style={{
                  background:
                    theme ===
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