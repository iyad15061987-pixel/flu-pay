"use client";

import {
  useEffect,
  useState,
} from "react";

import API_URL from "@/lib/api";

export default function AdminKycPage() {
  const [requests, setRequests] =
    useState<any[]>([]);

  const loadRequests =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/admin/kyc-requests`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        setRequests(data);

      } catch (err) {
        console.log(err);
      }
    };

  useEffect(() => {
    loadRequests();
  }, []);

  const approveKyc =
    async (
      id: string
    ) => {
      const token =
        localStorage.getItem(
          "token"
        );

      await fetch(
        `${API_URL}/admin/approve-kyc/${id}`,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      loadRequests();
    };

  const rejectKyc =
    async (
      id: string
    ) => {
      const reason =
        prompt(
          "Rejection reason"
        );

      if (!reason) return;

      const token =
        localStorage.getItem(
          "token"
        );

      await fetch(
        `${API_URL}/admin/reject-kyc/${id}`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            reason,
          }),
        }
      );

      loadRequests();
    };

  return (
    <div
      style={{
        background:
          "#0f172a",

        color: "white",

        minHeight:
          "100vh",

        padding: 40,
      }}
    >
      <h1>
        🪪 KYC Review
      </h1>

      <br />

      {requests.map(
        (kyc) => (
          <div
            key={kyc._id}
            style={{
              background:
                "#111827",

              padding: 25,

              borderRadius: 20,

              marginBottom: 25,
            }}
          >
            <h2>
              {kyc.fullName}
            </h2>

            <br />

            <p>
              Email:{" "}
              {kyc.email}
            </p>

            <p>
              Country:{" "}
              {kyc.country}
            </p>

            <p>
              Document:{" "}
              {
                kyc.documentType
              }
            </p>

            <p>
              Status:{" "}
              {kyc.status}
            </p>

            <br />

            <div
              style={{
                display: "flex",

                gap: 20,
              }}
            >
              <div>
                <p>
                  Document
                </p>

                <img
                  src={`/api/${kyc.documentFront}`}
                  width="250"
                  alt=""
                />
              </div>

              <div>
                <p>
                  Selfie
                </p>

                <img
                  src={`/api/${kyc.selfie}`}
                  width="250"
                  alt=""
                />
              </div>
            </div>

            <br />

            <button
              onClick={() =>
                approveKyc(
                  kyc._id
                )
              }
              style={{
                padding:
                  "12px 25px",

                marginRight: 15,

                border: "none",

                borderRadius: 10,

                background:
                  "#16a34a",

                color: "white",

                cursor:
                  "pointer",
              }}
            >
              Approve
            </button>

            <button
              onClick={() =>
                rejectKyc(
                  kyc._id
                )
              }
              style={{
                padding:
                  "12px 25px",

                border: "none",

                borderRadius: 10,

                background:
                  "#dc2626",

                color: "white",

                cursor:
                  "pointer",
              }}
            >
              Reject
            </button>
          </div>
        )
      )}
    </div>
  );
}