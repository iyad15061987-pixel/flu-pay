"use client";

import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";

import API_URL from "@/lib/api";

export default function ProfilePage() {
  const [profile, setProfile] =
    useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile =
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
            `${API_URL}/profile/${email}`,
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

  if (!profile) {
    return (
      <div
        style={{
          background:
            "#0f172a",
          minHeight:
            "100vh",
          color: "white",
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
          👤 Profile
        </h1>

        <br />

        <div
          style={{
            background:
              "#111827",
            padding: 30,
            borderRadius: 20,
            maxWidth: 700,
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
            />

            <br />
            <br />

            <p>
              Personal Receive QR
            <br />

<div
  style={{
    background:
      "#1f2937",
    padding: 15,
    borderRadius: 10,
    wordBreak:
      "break-all",
  }}
>
  {window.location.origin}
  /pay/
  {profile.email}
</div>
            </p>
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
              Total Transactions:
            </strong>{" "}
            {
              profile.totalTransactions
            }
          </p>

          <br />

          <p>
            <strong>
              Account Created:
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