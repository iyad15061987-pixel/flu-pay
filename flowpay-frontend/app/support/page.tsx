"use client";

import { useState } from "react";

import Sidebar from "../components/Sidebar";

import API_URL from "@/lib/api";

export default function SupportPage() {
  const [subject, setSubject] =
    useState("");

  const [message, setMessage] =
    useState("");

  const sendSupport =
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
            `${API_URL}/create-support`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                email,
                subject,
                message,
              }),
            }
          );

        const data =
          await res.json();

        alert(data.message);

        setSubject("");

        setMessage("");

      } catch (err) {
        alert("Server error");
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
          🆘 Support
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
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) =>
              setSubject(
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: 15,
              borderRadius: 10,
              border: "none",
              marginBottom: 15,
            }}
          />

          <textarea
            placeholder="Message"
            value={message}
            onChange={(e) =>
              setMessage(
                e.target.value
              )
            }
            style={{
              width: "100%",
              height: 200,
              padding: 15,
              borderRadius: 10,
              border: "none",
              marginBottom: 15,
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
            Send Ticket
          </button>
        </div>
      </div>
    </div>
  );
}