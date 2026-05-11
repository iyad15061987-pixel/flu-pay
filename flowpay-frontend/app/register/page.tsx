"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const data = await api.register(email, password);

      alert(data.message);

      if (data.message === "Account created successfully") {
        window.location.href = "/login";
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
          Create Account
        </h1>

        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 20,
          }}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 20,
          }}
        />

        <button
          onClick={handleRegister}
          style={{
            width: "100%",
            padding: 15,
            background: "#16a34a",
            color: "white",
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          Create Account
        </button>
      </div>
    </div>
  );
}