"use client";

import {
  useEffect,
  useState,
} from "react";

import Sidebar from "../components/Sidebar";

export default function SupportPage() {
  const [mounted, setMounted] =
    useState(false);

  const [theme, setTheme] =
    useState("dark");

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    setMounted(true);

    const savedTheme =
      localStorage.getItem(
        "theme"
      );

    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const sendSupport =
    () => {
      alert(
        "Support request sent"
      );

      setMessage("");
    };

  if (!mounted) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",

        background:
          theme === "light"
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
            theme === "light"
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
              theme === "light"
                ? "white"
                : "#111827",

            padding: 30,

            borderRadius: 20,

            maxWidth: 700,

            boxShadow:
              "0 0 10px rgba(0,0,0,0.1)",
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

              border: "none",

              resize: "none",

              background:
                theme === "light"
                  ? "#f9fafb"
                  : "#1f2937",

              color:
                theme === "light"
                  ? "#111827"
                  : "white",
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

              fontWeight:
                "bold",
            }}
          >
            Send Support Request
          </button>
        </div>
      </div>
    </div>
  );
}