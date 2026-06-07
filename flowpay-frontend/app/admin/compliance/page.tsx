"use client";

import {
  useEffect,
  useState,
} from "react";

import API_URL from "@/lib/api";

interface FraudItem {
  email: string;

  reason: string;

  riskScore: number;
}

interface ComplianceData {
  totalUsers: number;

  frozenUsers: number;

  unverifiedUsers: number;

  totalBalance: number;

  totalFraudLogs: number;

  highRiskLogs: number;

  recentFraud: FraudItem[];
}

export default function CompliancePage() {
  const [data, setData] =
    useState<ComplianceData | null>(
      null
    );

  const loadData =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/admin/compliance`,
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
          color: "white",

          padding: 40,

          background:
            "#0f172a",

          minHeight:
            "100vh",
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

        minHeight:
          "100vh",

        color: "white",

        padding: 40,
      }}
    >
      <h1>
        🛡️ Compliance
        Dashboard
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
        {[
          [
            "Total Users",
            data.totalUsers,
          ],

          [
            "Frozen Users",
            data.frozenUsers,
          ],

          [
            "Unverified Users",
            data.unverifiedUsers,
          ],

          [
            "Total Balance",
            `$${data.totalBalance.toFixed(
              2
            )}`,
          ],

          [
            "Fraud Logs",
            data.totalFraudLogs,
          ],

          [
            "High Risk",
            data.highRiskLogs,
          ],
        ].map(
          (
            item: (string | number)[],
            index: number
          ) => (
            <div
              key={index}
              style={{
                background:
                  "#111827",

                padding: 25,

                borderRadius: 20,
              }}
            >
              <h2>
                {item[0]}
              </h2>

              <br />

              <h1>
                {item[1]}
              </h1>
            </div>
          )
        )}
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
          Recent Fraud
          Alerts
        </h2>

        <br />

        {data.recentFraud?.length ===
        0 ? (
          <p>
            No fraud alerts
            found.
          </p>
        ) : (
          data.recentFraud.map(
            (
              fraud: FraudItem,
              index: number
            ) => (
              <div
                key={index}
                style={{
                  padding: 15,

                  borderBottom:
                    "1px solid #374151",
                }}
              >
                <p>
                  <strong>
                    {
                      fraud.email
                    }
                  </strong>
                </p>

                <p>
                  {
                    fraud.reason
                  }
                </p>

                <p>
                  Risk:
                  {
                    fraud.riskScore
                  }
                </p>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}