"use client";

import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function ProfilePage() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    const savedEmail =
      localStorage.getItem("email") || "";

    setEmail(savedEmail);
  }, []);

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
          width: "100%",
        }}
      >
        <Navbar />

        <div
          style={{
            padding: 30,
            color: "white",
          }}
        >
          <h1>👤 Profile</h1>

          <br />

          <div
            style={{
              background: "#111827",
              padding: 30,
              borderRadius: 20,
              maxWidth: 700,
            }}
          >
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
                marginBottom: 20,
              }}
            >
              {email.charAt(0).toUpperCase()}
            </div>

            <h2>{email}</h2>

            <br />

            <p>
              FlowPay verified account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}