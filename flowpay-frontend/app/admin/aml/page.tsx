"use client";

import {
  useEffect,
  useState,
} from "react";

import API_URL from "@/lib/api";

export default function AmlPage() {
  const [data, setData] =
    useState<any>(null);

  const loadData =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/admin/aml-alerts`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const json =
          await res.json();

        setData(json);

      } catch (err) {
        console.log(err);
      }
    };

  useEffect(() => {
    loadData();
  }, []);

  if (!data) {
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
        Loading...
      </div>
    );
  }

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
        🛡 AML &
        Compliance
      </h1>

      <br />

      <div
        style={{
          display: "grid",

          gridTemplateColumns:
            "repeat(auto-fit,minmax(250px,1fr))",

          gap: 20,
        }}
      >
        <div
          style={{
            background:
              "#111827",

            padding: 25,

            borderRadius: 20,
          }}
        >
          <h2>
            AML Alerts
          </h2>

          <br />

          <h1>
            {
              data.alerts
                .length
            }
          </h1>
        </div>

        <div
          style={{
            background:
              "#111827",

            padding: 25,

            borderRadius: 20,
          }}
        >
          <h2>
            High Risk
            Users
          </h2>

          <br />

          <h1>
            {
              data
                .highRiskUsers
                .length
            }
          </h1>
        </div>

        <div
          style={{
            background:
              "#111827",

            padding: 25,

            borderRadius: 20,
          }}
        >
          <h2>
            Frozen
            Accounts
          </h2>

          <br />

          <h1>
            {
              data
                .frozenUsers
                .length
            }
          </h1>
        </div>
      </div>

      <br />

      <div
        style={{
          background:
            "#111827",

          padding: 25,

          borderRadius: 20,
        }}
      >
        <h2>
          AML Alerts
        </h2>

        <br />

        {data.alerts.map(
          (
            alert: any
          ) => (
            <div
              key={
                alert._id
              }
              style={{
                borderBottom:
                  "1px solid #374151",

                padding:
                  "15px 0",
              }}
            >
              <p>
                <strong>
                  {
                    alert.email
                  }
                </strong>
              </p>

              <p>
                {
                  alert.reason
                }
              </p>

              <p>
                Risk:
                {
                  alert.riskLevel
                }
              </p>

              <p>
                Amount: $
                {
                  alert.amount
                }
              </p>

              <small>
                {new Date(
                  alert.createdAt
                ).toLocaleString()}
              </small>
            </div>
          )
        )}
      </div>
    </div>
  );
}