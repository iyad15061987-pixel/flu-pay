"use client";

import {
  useEffect,
  useState,
} from "react";

import API_URL from "@/lib/api";

interface Entry {
  _id: string;

  account: string;

  type: string;

  amount: number;

  description: string;

  createdAt: string;
}

export default function AccountingPage() {
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
            `${API_URL}/admin/accounting`,
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
        💰 Accounting
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
            Transactions
          </h2>

          <br />

          <h1>
            {
              data.totalTransactions
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
            Total Volume
          </h2>

          <br />

          <h1>
            $
            {data.totalVolume.toFixed(
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
            Platform Fees
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
          background:
            "#111827",

          padding: 25,

          borderRadius: 20,
        }}
      >
        <h2>
          Accounting
          Entries
        </h2>

        <br />

        {data.entries.map(
          (
            entry: Entry
          ) => (
            <div
              key={
                entry._id
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
                    entry.account
                  }
                </strong>
              </p>

              <p>
                {
                  entry.type
                }{" "}
                - $
                {
                  entry.amount
                }
              </p>

              <p>
                {
                  entry.description
                }
              </p>

              <small>
                {new Date(
                  entry.createdAt
                ).toLocaleString()}
              </small>
            </div>
          )
        )}
      </div>
    </div>
  );
}