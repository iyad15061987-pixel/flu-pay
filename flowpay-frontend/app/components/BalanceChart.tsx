"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", balance: 200 },
  { month: "Feb", balance: 500 },
  { month: "Mar", balance: 800 },
  { month: "Apr", balance: 650 },
  { month: "May", balance: 1200 },
  { month: "Jun", balance: 1600 },
];

export default function BalanceChart() {
  return (
    <div
      style={{
        background: "#111827",
        padding: 25,
        borderRadius: 20,
        color: "white",
      }}
    >
      <h2
        style={{
          marginBottom: 20,
        }}
      >
        📈 Wallet Analytics
      </h2>

      <div
        style={{
          width: "100%",
          height: 300,
        }}
      >
        <ResponsiveContainer>
          <LineChart data={data}>
            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="balance"
              stroke="#2563eb"
              strokeWidth={4}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}