"use client";
import { Wallet } from "lucide-react";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    const savedEmail =
      localStorage.getItem("email") || "";

    setEmail(savedEmail);
  }, []);

  return (
    <div
      style={{
        height: 80,
        background: "#111827",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 30px",
        color: "white",
      }}
    >
      <h2><img src="/flowpay-logo.png" alt="FlowPay" style={{width:"32px",height:"32px",maxWidth:"32px",maxHeight:"32px",minWidth:"32px",minHeight:"32px",objectFit:"contain",display:"block",flexShrink:0}} /> FlowPay</h2>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 15,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
          }}
        >
          {email ? email.charAt(0).toUpperCase() : "U"}
        </div>

        <span>{email}</span>
      </div>
    </div>
  );
}