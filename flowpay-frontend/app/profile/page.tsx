"use client";

import {
  useEffect,
  useState,
} from "react";

import Sidebar from "../components/Sidebar";

import API_URL from "@/lib/api";

interface Profile {
  email: string;

  balance: number;

  revenue: number;

  currency: string;

  role: string;

  frozen: boolean;

  totalTransactions?: number;

  createdAt: string;
}

export default function ProfilePage() {
  const [mounted, setMounted] =
    useState(false);

  const [theme, setTheme] =
    useState("dark");

  const [profile, setProfile] =
    useState<Profile | null>(
      null
    );

  const [origin, setOrigin] =
    useState("");

  useEffect(() => {
    setMounted(true);

    const savedTheme =
      localStorage.getItem(
        "theme"
      );

    if (savedTheme) {
      setTheme(savedTheme);
    }

    if (
      typeof window !==
      "undefined"
    ) {
      setOrigin(
        window.location.origin
      );
    }

    loadProfile();
  }, []);

  const loadProfile =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          window.location.href =
            "/login";

          return;
        }

        const res =
          await fetch(
            `${API_URL}/profile`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        setProfile(data);

      } catch (err) {
        console.log(err);
      }
    };

  if (!mounted) {
    return null;
  }

  if (!profile) {
    return (
      <div
        style={{
          background:
            theme === "light"
              ? "#f3f4f6"
              : "#0f172a",

          minHeight:
            "100vh",

          color:
            theme === "light"
              ? "#111827"
              : "white",

          padding: 40,
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
        <h1>
          👤 Profile
        </h1>

        <br />

        <div
          style={{
            background:
              theme === "light"
                ? "white"
                : "#111827",

            padding: 30,

            borderRadius: 20,

            maxWidth: 700,

            boxShadow:
              "0 0 10px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              textAlign:
                "center",

              marginBottom: 30,
            }}
          >
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${profile.email}`}
              width="200"
              alt="QR Code"
            />

            <br />
            <br />

            <p>
              Personal Receive QR
            </p>

            <br />

            <div
              style={{
                background:
                  theme ===
                  "light"
                    ? "#e5e7eb"
                    : "#1f2937",

                padding: 15,

                borderRadius: 10,

                wordBreak:
                  "break-all",
              }}
            >
              {origin}
              /pay/
              {profile.email}
            </div>
          </div>

          <p>
            <strong>
              Email:
            </strong>{" "}
            {profile.email}
          </p>

          <br />

          <p>
            <strong>
              Balance:
            </strong>{" "}
            $
            {profile.balance}
          </p>

          <br />

          <p>
            <strong>
              Revenue:
            </strong>{" "}
            $
            {profile.revenue}
          </p>

          <br />

          <p>
            <strong>
              Currency:
            </strong>{" "}
            {profile.currency}
          </p>

          <br />

          <p>
            <strong>
              Role:
            </strong>{" "}
            {profile.role}
          </p>

          <br />

          <p>
            <strong>
              Frozen:
            </strong>{" "}
            {profile.frozen
              ? "Yes"
              : "No"}
          </p>

          <br />

          <p>
            <strong>
              Total
              Transactions:
            </strong>{" "}
            {profile.totalTransactions ||
              0}
          </p>

          <br />

          <p>
            <strong>
              Account
              Created:
            </strong>{" "}
            {new Date(
              profile.createdAt
            ).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}