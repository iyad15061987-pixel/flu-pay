"use client";

import {
  Suspense,
  useState,
} from "react";

import {
  useSearchParams,
  useRouter,
} from "next/navigation";

import API_URL from "@/lib/api";

function VerifyEmailContent() {

  const router =
    useRouter();

  const params =
    useSearchParams();

  const email =
    params.get("email") || "";

  const [otp, setOtp] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const verifyEmail =
    async () => {

      try {

        setLoading(true);

        const res =
          await fetch(
            `${API_URL}/verify-email`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                email,
                otp,
              }),
            }
          );

        const data =
          await res.json();

        if (!res.ok) {

          alert(
            data.message
          );

          return;
        }

        alert(
          "Email verified successfully"
        );

        router.push(
          "/login"
        );

      } catch (err) {

        console.log(err);

        alert(
          "Connection error"
        );

      } finally {

        setLoading(false);

      }

    };

  const resendCode =
    async () => {

      try {

        const res =
          await fetch(
            `${API_URL}/resend-verification`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                email,
              }),
            }
          );

        const data =
          await res.json();

        alert(
          data.message
        );

      } catch (err) {

        console.log(err);

      }

    };

  return (

    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0f172a",
      }}
    >

      <div
        style={{
          width: 450,
          background: "#111827",
          padding: 30,
          borderRadius: 20,
          color: "white",
        }}
      >

        <h1>
          Verify Email
        </h1>

        <br />

        <p>
          Verification code sent to:
        </p>

        <strong>
          {email}
        </strong>

        <br />
        <br />

        <input
          type="text"
          placeholder="Enter 6 digit code"
          value={otp}
          onChange={(e) =>
            setOtp(
              e.target.value
            )
          }
          style={{
            width: "100%",
            padding: 15,
            borderRadius: 10,
          }}
        />

        <br />
        <br />

        <button
          onClick={
            verifyEmail
          }
          disabled={
            loading
          }
          style={{
            width: "100%",
            padding: 15,
            background:
              "#16a34a",
            color: "white",
            border: "none",
            borderRadius: 10,
          }}
        >
          Verify Email
        </button>

        <br />
        <br />

        <button
          onClick={
            resendCode
          }
          style={{
            width: "100%",
            padding: 15,
            background:
              "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 10,
          }}
        >
          Resend Code
        </button>

      </div>

    </div>

  );

}

export default function VerifyEmailPage() {

  return (

    <Suspense
      fallback={
        <div>
          Loading...
        </div>
      }
    >

      <VerifyEmailContent />

    </Suspense>

  );

}