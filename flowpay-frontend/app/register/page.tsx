"use client";

import {
  useState,
} from "react";

import API_URL from "@/lib/api";

export default function RegisterPage() {

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const handleRegister =
    async () => {

      try {

        setLoading(true);

        const res =
          await fetch(
            `${API_URL}/register`,
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

        const data =
          await res.json();

        alert(
          data.message
        );

        if (res.ok) {

          window.location.href =
            "/login";
        }

      } catch (err) {

        console.log(err);

        alert(
          "Server error"
        );

      } finally {

        setLoading(false);
      }
    };

  return (
    <div
      style={{
        minHeight: "100vh",

        background:
          "#0f172a",

        display: "flex",

        justifyContent:
          "center",

        alignItems:
          "center",

        fontFamily:
          "Arial",
      }}
    >
      <div
        style={{
          background:
            "white",

          padding: 40,

          borderRadius: 15,

          width: 400,

          boxShadow:
            "0 0 20px rgba(0,0,0,0.2)",
        }}
      >
        <h1
          style={{
            textAlign:
              "center",

            marginBottom: 30,
          }}
        >
          Create Account
        </h1>

        <input
          type="email"

          placeholder="Email"

          value={email}

          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }

          style={{
            width: "100%",

            padding: 12,

            marginBottom: 20,

            borderRadius: 10,

            border:
              "1px solid #d1d5db",
          }}
        />

        <input
          type="password"

          placeholder="Password"

          value={password}

          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }

          style={{
            width: "100%",

            padding: 12,

            marginBottom: 20,

            borderRadius: 10,

            border:
              "1px solid #d1d5db",
          }}
        />

        <button
          onClick={
            handleRegister
          }

          disabled={loading}

          style={{
            width: "100%",

            padding: 15,

            background:
              loading
                ? "#9ca3af"
                : "#16a34a",

            color: "white",

            border: "none",

            borderRadius: 10,

            cursor:
              loading
                ? "not-allowed"
                : "pointer",

            fontSize: 16,

            fontWeight:
              "bold",
          }}
        >
          {loading
            ? "Creating..."
            : "Create Account"}
        </button>

        <br />
        <br />

        <p
          style={{
            textAlign:
              "center",
          }}
        >
          Already have an account?
        </p>

        <br />

        <button
          onClick={() => {

            window.location.href =
              "/login";
          }}

          style={{
            width: "100%",

            padding: 12,

            background:
              "#2563eb",

            color: "white",

            border: "none",

            borderRadius: 10,

            cursor:
              "pointer",
          }}
        >
          Go To Login
        </button>
      </div>
    </div>
  );
}