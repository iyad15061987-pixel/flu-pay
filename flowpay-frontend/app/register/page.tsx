"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const data = await api.register(email, password);

      if (data.message) {
        alert("Account created successfully");
        window.location.href = "/login";
      } else {
        alert("Error creating account");
      }
    } catch (err) {
      alert("Server error");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Create Account</h2>

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />

      <button onClick={handleRegister}>Register</button>
    </div>
  );
}