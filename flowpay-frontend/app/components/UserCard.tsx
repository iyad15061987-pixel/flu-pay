"use client";

import { useEffect, useState } from "react";

export default function UserCard() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    const savedEmail =
      localStorage.getItem("email") || "";

    setEmail(savedEmail);

  }, []);

  return (
    <div
      style={{
        background: "#111827",
        padding: 25,
        borderRadius: 20,
        color: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
            fontWeight: "bold",
          }}
        >
          {email.charAt(0).toUpperCase()}
        </div>

        <div>
          <h2>{email}</h2>

          <p
            style={{
              color: "#9ca3af",
            }}
          >
            Verified FlowPay User
          </p>
        </div>
      </div>
    </div>
  );
}