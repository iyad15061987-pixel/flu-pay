"use client";

import { useState } from "react";

import API_URL from "@/lib/api";

export default function AccountDeletionPage() {

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const requestDeletion =
    async () => {

      setError("");

      if (!email.trim()) {
        setError(
          "Please enter the email address associated with your FlowPay account."
        );
        return;
      }

      setLoading(true);

      try {

        // This public page provides the required
        // external account-deletion request path.
        // Authentication is intentionally not required here.

        const response =
          await fetch(
            `${API_URL}/account-deletion-request`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                email:
                  email.trim(),
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          setError(
            data.message ||
            "Unable to submit the deletion request."
          );
          return;
        }

        setSubmitted(true);

      } catch (err) {

        console.error(err);

        setError(
          "Unable to connect to FlowPay. Please try again later."
        );

      } finally {

        setLoading(false);

      }

    };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "40px 20px",
        color: "#111827",
      }}
    >

      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "50px",
          background: "#ffffff",
          borderRadius: "16px",
          lineHeight: "1.8",
          boxShadow:
            "0 2px 12px rgba(0,0,0,0.08)",
        }}
      >

        <h1>
          Account Deletion
        </h1>

        <p
          style={{
            color: "#6b7280",
            marginBottom: "30px",
          }}
        >
          FlowPay Account Deletion Request
        </p>

        <h2>
          Request Account Deletion
        </h2>

        <p>
          You can request closure and deletion of your
          FlowPay account using this page. Please enter
          the email address associated with your account.
        </p>

        <p>
          Before an account can be closed, any available
          or reserved balance and pending financial
          operations must be resolved.
        </p>

        <p>
          Certain financial, KYC, AML, security, fraud
          prevention, and audit records may be retained
          where required by law or legitimate compliance
          obligations.
        </p>

        {!submitted && (

          <div
            style={{
              marginTop: 30,
            }}
          >

            <label
              style={{
                display: "block",
                fontWeight: "bold",
                marginBottom: 8,
              }}
            >
              Account Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              placeholder="you@example.com"
              style={{
                width: "100%",
                padding: 14,
                borderRadius: 10,
                border:
                  "1px solid #d1d5db",
                marginBottom: 15,
                fontSize: 16,
              }}
            />

            {error && (

              <p
                style={{
                  color: "#dc2626",
                  marginBottom: 15,
                }}
              >
                {error}
              </p>

            )}

            <button
              onClick={
                requestDeletion
              }
              disabled={loading}
              style={{
                width: "100%",
                padding: 15,
                background:
                  loading
                    ? "#9ca3af"
                    : "#dc2626",
                color: "white",
                border: "none",
                borderRadius: 10,
                cursor:
                  loading
                    ? "not-allowed"
                    : "pointer",
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              {loading
                ? "Submitting..."
                : "Request Account Deletion"}
            </button>

          </div>

        )}

        {submitted && (

          <div
            style={{
              marginTop: 30,
              padding: 20,
              background: "#ecfdf5",
              border:
                "1px solid #10b981",
              borderRadius: 12,
              color: "#065f46",
            }}
          >
            <strong>
              Your account deletion request has been submitted.
            </strong>

            <p>
              FlowPay will review the request and any
              applicable financial or compliance requirements
              before processing account closure.
            </p>
          </div>

        )}

        <hr
          style={{
            margin: "40px 0",
            border: 0,
            borderTop:
              "1px solid #e5e7eb",
          }}
        />

        <h2>
          Important Information
        </h2>

        <p>
          Account deletion does not remove information
          that FlowPay is legally required to retain.
          Retained records may include transaction,
          KYC, AML, security, fraud prevention, and audit
          information.
        </p>

        <p>
          If you cannot access your account or have a
          question about your deletion request, contact
          FlowPay through the official support channels.
        </p>

      </div>

    </div>
  );
}