"use client";

import {
  useEffect,
  useState,
} from "react";

import API_URL from "@/lib/api";

export default function RiskPage() {
  const [data, setData] =
    useState<any>(null);

  const loadRisk =
    async () => {
      const token =
        localStorage.getItem(
          "token"
        );

      const res =
        await fetch(
          `${API_URL}/admin/risk-dashboard`,
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
    };

  useEffect(() => {
    loadRisk();
  }, []);

  if (!data)
    return (
      <div
        style={{
          color: "white",

          padding: 40,
        }}
      >
        Loading...
      </div>
    );

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
        📈 Risk
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
            "Profiles",
            data.totalProfiles,
          ],

          [
            "High Risk",
            data.highRisk,
          ],

          [
            "Medium Risk",
            data.mediumRisk,
          ],
        ].map(
          (
            item,
            index
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

     {data.profiles.map(
  (
    profile: any,
    index: number
  ) => (
    
          <div
            key={index}
            style={{
              background:
                "#111827",

              padding: 20,

              borderRadius: 20,

              marginBottom: 20,
            }}
          >
            <h3>
              {
                profile.email
              }
            </h3>

            <br />

            <p>
              Risk Level:
              {
                profile.riskLevel
              }
            </p>

            <p>
              Risk Score:
              {
                profile.riskScore
              }
            </p>

            <p>
              Transfers:
              {
                profile.totalTransfers
              }
            </p>

            <p>
              Volume:
              $
              {
                profile.totalVolume
              }
            </p>
          </div>
        )
      )}
    </div>
  );
}