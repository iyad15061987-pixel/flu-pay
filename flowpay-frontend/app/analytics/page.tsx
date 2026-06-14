"use client";

import {
  useEffect,
  useState,
} from "react";

import Sidebar from "../components/Sidebar";

import API_URL from "@/lib/api";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

export default function AnalyticsPage() {
  const [data, setData] =
    useState<any>(null);

  const loadAnalytics =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/analytics`,
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
    loadAnalytics();
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

  const pieData = [
    {
      name:
        "Sent",

      value:
        data.totalSent,
    },

    {
      name:
        "Received",

      value:
        data.totalReceived,
    },
  ];

  const barData = [
    {
      name:
        "Transactions",

      Sent:
        data.sentCount,

      Received:
        data.receivedCount,
    },
  ];

  return (
    <div
      style={{
        display: "flex",

        background:
          "#0f172a",

        minHeight:
          "100vh",
      }}
    >
      <Sidebar />

      <div
        style={{
          marginLeft: 250,

          padding: 40,

          width: "100%",

          color: "white",

          marginTop: 70,
        }}
      >
        <h1>
          📊 Financial
          Analytics
        </h1>

        <br />

        {/* SUMMARY */}

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
              Total Sent
            </h2>

            <br />

            <h1>
              $
              {data.totalSent.toFixed(
                2
              )}
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
              Total
              Received
            </h2>

            <br />

            <h1>
              $
              {data.totalReceived.toFixed(
                2
              )}
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
              Fees Paid
            </h2>

            <br />

            <h1>
              $
              {data.totalFees.toFixed(
                2
              )}
            </h1>
          </div>
        </div>

        <br />

<div
  style={{
    background: "#111827",
    padding: 25,
    borderRadius: 20,
  }}
>
  <h2>
    💰 Payment Revenue
  </h2>

  <br />

  <h1>
    $
    {Number(
      data.paymentRevenue || 0
    ).toFixed(2)}
  </h1>
</div>

<div
  style={{
    background: "#111827",
    padding: 25,
    borderRadius: 20,
  }}
>
  <h2>
    🔗 Payment Links
  </h2>

  <br />

  <h1>
    {data.totalPaymentLinks || 0}
  </h1>
</div>

<div
  style={{
    background: "#111827",
    padding: 25,
    borderRadius: 20,
  }}
>
  <h2>
    ✅ Paid Links
  </h2>

  <br />

  <h1>
    {data.paidLinks || 0}
  </h1>
</div>

<div
  style={{
    background: "#111827",
    padding: 25,
    borderRadius: 20,
  }}
>
  <h2>
    🕒 Pending Links
  </h2>

  <br />

  <h1>
    {data.pendingLinks || 0}
  </h1>
</div>

        {/* CHARTS */}

        <div
          style={{
            display: "grid",

            gridTemplateColumns:
              "repeat(auto-fit,minmax(400px,1fr))",

            gap: 25,
          }}
        >
          {/* PIE */}

          <div
            style={{
              background:
                "#111827",

              padding: 25,

              borderRadius: 20,

              height: 400,
            }}
          >
            <h2>
              Money Flow
            </h2>

            <ResponsiveContainer
              width="100%"
              height="90%"
            >
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  outerRadius={120}
                  label
                >
                  <Cell />

                  <Cell />
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* BAR */}

          <div
            style={{
              background:
                "#111827",

              padding: 25,

              borderRadius: 20,

              height: 400,
            }}
          >
            <h2>
              Transaction
              Volume
            </h2>

            <ResponsiveContainer
              width="100%"
              height="90%"
            >
              <BarChart
                data={barData}
              >
                <XAxis
                  dataKey="name"
                />

                <YAxis />

                <Tooltip />

                <Bar dataKey="Sent" />

                <Bar dataKey="Received" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <br />

        {/* EXTRA STATS */}

        <div
          style={{
            background:
              "#111827",

            padding: 25,

            borderRadius: 20,
          }}
        >
          <h2>
            Transaction
            Statistics
          </h2>

          <br />

          <p>
            Sent
            Transactions:
            {
              data.sentCount
            }
          </p>

          <br />

          <p>
            Received
            Transactions:
            {
              data
                .receivedCount
            }
          </p>
        </div>
      </div>
    </div>
  );
}