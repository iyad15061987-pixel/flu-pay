"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function BalanceChart({
  balance,
}: any) {
  const data = [
    {
      name: "Start",
      balance:
        balance * 0.2,
    },

    {
      name: "Week 1",
      balance:
        balance * 0.4,
    },

    {
      name: "Week 2",
      balance:
        balance * 0.6,
    },

    {
      name: "Week 3",
      balance:
        balance * 0.8,
    },

    {
      name: "Now",
      balance,
    },
  ];

  return (
    <div
      style={{
        background:
          localStorage.getItem(
            "theme"
          ) === "light"
            ? "white"
            : "#111827",

        padding: 25,

        borderRadius: 20,

        marginBottom: 40,

        boxShadow:
          "0 0 10px rgba(0,0,0,0.1)",
      }}
    >
      <h2
        style={{
          marginBottom: 20,

          color:
            localStorage.getItem(
              "theme"
            ) ===
            "light"
              ? "#111827"
              : "white",
        }}
      >
        📈 Balance Growth
      </h2>

      <ResponsiveContainer
        width="100%"
        height={300}
      >
        <LineChart
          data={data}
        >
          <XAxis
            dataKey="name"
          />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="balance"
            stroke="#22c55e"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}