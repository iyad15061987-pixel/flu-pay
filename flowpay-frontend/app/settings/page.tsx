"use client";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function SettingsPage() {
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
          <h1>⚙ Settings</h1>

          <br />

          <div
            style={{
              background: "#111827",
              padding: 25,
              borderRadius: 20,
              maxWidth: 700,
            }}
          >
            <h2>Account Settings</h2>

            <br />

            <p>
              FlowPay account settings panel.
            </p>

            <br />

            <button
              style={{
                padding: 15,
                background: "#2563eb",
                border: "none",
                color: "white",
                borderRadius: 10,
                cursor: "pointer",
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}