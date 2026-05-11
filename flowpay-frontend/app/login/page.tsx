"use client";

import { useState } from "react";

import { api } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const handleLogin = async () => {
    try {
      const data = await api.login(
        email,
        password
      );

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

        window.location.href =
          "/dashboard";

      } else {
        alert(data.message);
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
      }}
    >
      <div
        style={{
          background: "white",
          padding: 40,
          borderRadius: 20,
          width: 400,
        }}
      >
        <h1>Login</h1>

        <br />

        <input
          type="email"
          placeholder="Email"
          onChange={(e) =>
            setEmail(e.target.value)
          }
          style={{
            width: "100%",
            padding: 15,
            marginBottom: 15,
          }}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) =>
            setPassword(e.target.value)
          }
          style={{
            width: "100%",
            padding: 15,
            marginBottom: 15,
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
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}