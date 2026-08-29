"use client";

import {
  Suspense,
  useEffect,
  useState,
} from "react";

import { useSearchParams } from "next/navigation";

import API_URL from "@/lib/api";

function SuccessContent() {
  const searchParams =
    useSearchParams();

  const [status, setStatus] =
    useState<
      "loading" |
      "success" |
      "error"
    >("loading");

  const [message, setMessage] =
    useState(
      "Processing PayPal payment..."
    );

  useEffect(() => {
    const capture = async () => {

      const token =
        localStorage.getItem(
          "token"
        );

      const orderId =
        searchParams.get(
          "token"
        );

      if (!orderId) {

        setStatus("error");

        setMessage(
          "PayPal order ID was not found."
        );

        return;
      }

      if (!token) {

        setStatus("error");

        setMessage(
          "Your session has expired. Please log in again."
        );

        return;
      }

      try {

        const res =
          await fetch(
            `${API_URL}/paypal/capture-order`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  orderId,
                }),
            }
          );

        const data =
          await res.json();

        if (!res.ok) {

          console.error(
            "PayPal capture failed:",
            data
          );

          setStatus("error");

          setMessage(
            data.message ||
            "PayPal payment could not be completed."
          );

          return;
        }

        if (
          data.success !== true
        ) {

          setStatus("error");

          setMessage(
            data.message ||
            "PayPal payment was not confirmed."
          );

          return;
        }

        setStatus("success");

        setMessage(
          data.message ||
          "PayPal deposit completed successfully."
        );

      } catch (err) {

        console.error(
          "PayPal capture connection error:",
          err
        );

        setStatus("error");

        setMessage(
          "Unable to connect to FlowPay. Please check your connection and try again."
        );
      }
    };

    capture();

  }, [searchParams]);

  return (
    <div
      style={{
        display:
          "flex",

        flexDirection:
          "column",

        justifyContent:
          "center",

        alignItems:
          "center",

        minHeight:
          "100vh",

        padding:
          "24px",

        textAlign:
          "center",

        fontFamily:
          "Arial, sans-serif",
      }}
    >

      {status ===
        "loading" && (

        <>
          <div
            style={{
              fontSize:
                "42px",

              marginBottom:
                "20px",
            }}
          >
            ⏳
          </div>

          <h2>
            Processing PayPal payment
          </h2>

          <p>
            Please wait while we confirm your payment.
          </p>
        </>
      )}

      {status ===
        "success" && (

        <>
          <div
            style={{
              fontSize:
                "56px",

              marginBottom:
                "20px",
            }}
          >
            ✅
          </div>

          <h2>
            Payment completed
          </h2>

          <p>
            {message}
          </p>

          <button
            onClick={() => {
              window.location.href =
                "/dashboard";
            }}
            style={{
              marginTop:
                "20px",

              padding:
                "12px 24px",

              border:
                "none",

              borderRadius:
                "8px",

              cursor:
                "pointer",

              fontSize:
                "16px",
            }}
          >
            Go to Dashboard
          </button>
        </>
      )}

      {status ===
        "error" && (

        <>
          <div
            style={{
              fontSize:
                "56px",

              marginBottom:
                "20px",
            }}
          >
            ❌
          </div>

          <h2>
            Payment failed
          </h2>

          <p>
            {message}
          </p>

          <button
            onClick={() => {
              window.location.href =
                "/deposit";
            }}
            style={{
              marginTop:
                "20px",

              padding:
                "12px 24px",

              border:
                "none",

              borderRadius:
                "8px",

              cursor:
                "pointer",

              fontSize:
                "16px",
            }}
          >
            Back to Deposit
          </button>
        </>
      )}

    </div>
  );
}

export default function PayPalSuccessPage() {

  return (
    <Suspense
      fallback={
        <div
          style={{
            display:
              "flex",

            justifyContent:
              "center",

            alignItems:
              "center",

            minHeight:
              "100vh",
          }}
        >
          Loading...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}