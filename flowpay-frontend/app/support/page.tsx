"use client";

import { useState } from "react";

import Sidebar from "../components/Sidebar";

export default function SupportPage() {
  const [message, setMessage] =
    useState("");

  const sendSupport =
    () => {
      alert(
        "Support request sent"
      );

      setMessage("");
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
          🆘 Support
        </h1>

        <br />

        <div
          style={{
            background:
              localStorage.getItem(
                "theme"
              ) === "light"
                ? "white"
                : "#111827",

            padding: 30,

            borderRadius: 20,

            maxWidth: 700,
          }}
        >
          <textarea
            placeholder="Describe your issue..."
            value={message}
            onChange={(e) =>
              setMessage(
                e.target.value
              )
            }
            style={{
              width: "100%",

              height: 200,

              padding: 20,

              borderRadius: 10,

              marginBottom: 20,
            }}
          />

          <button
            onClick={
              sendSupport
            }
            style={{
              width: "100%",

              padding: 15,

              background:
                "#2563eb",

              border: "none",

              borderRadius: 10,

              color: "white",

              cursor: "pointer",
            }}
          >
            Send Support Request
          </button>
        </div>
      </div>
    </div>
  );
}