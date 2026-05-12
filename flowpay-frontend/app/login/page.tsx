"use client";

import { useState } from "react";

import API_URL from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch(
        `${API_URL}/login`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await res.json();

      if (data.token) {
        localStorage.setItem(
          "token",
          data.token
        );

        localStorage.setItem(
          "userId",
          data.userId
        );

        localStorage.setItem(
          "email",
          data.email
        );

        alert("Login successful");

        window.location.href =
          "/dashboard";
      } else {
        alert(
          data.message ||
            "Login failed"
        );
      }
    } catch (err) {
      alert("Server error");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          background: "white",
          padding: 40,
          borderRadius: 15,
          width: 400,
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: 30,
          }}
        >
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          onChange={(e) =>
            setEmail(e.target.value)
          }
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 20,
          }}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 20,
          }}
        />

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: 15,
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}