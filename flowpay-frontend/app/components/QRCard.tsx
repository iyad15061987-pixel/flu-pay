"use client";

import QRCode from "react-qr-code";

type Props = {
  email: string;
};

export default function QRCard({
  email,
}: Props) {
  return (
    <div
      style={{
        background: "#111827",
        padding: 25,
        borderRadius: 20,
        color: "white",
        textAlign: "center",
      }}
    >
      <h2
        style={{
          marginBottom: 20,
        }}
      >
        📷 My QR Code
      </h2>

      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 20,
          display: "inline-block",
        }}
      >
        <QRCode
          value={email}
          size={220}
        />
      </div>

      <br />
      <br />

      <p>{email}</p>

      <br />

      <p
        style={{
          color: "#9ca3af",
        }}
      >
        Scan this QR to send money instantly
      </p>
    </div>
  );
}