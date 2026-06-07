"use client";

import {
  useEffect,
  useState,
} from "react";

import API_URL from "@/lib/api";

export default function TreasuryPage() {
  const [data, setData] =
    useState<any>(null);

  const [form, setForm] =
    useState({
      currency:
        "USD",

      hotWallet:
        "",

      coldWallet:
        "",

      reserveWallet:
        "",
    });

  const loadTreasury =
    async () => {
      const token =
        localStorage.getItem(
          "token"
        );

      const res =
        await fetch(
          `${API_URL}/admin/treasury`,
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
    loadTreasury();
  }, []);

  const updateTreasury =
    async () => {
      const token =
        localStorage.getItem(
          "token"
        );

      await fetch(
        `${API_URL}/admin/update-treasury`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            ...form,

            hotWallet:
              Number(
                form.hotWallet
              ),

            coldWallet:
              Number(
                form.coldWallet
              ),

            reserveWallet:
              Number(
                form.reserveWallet
              ),
          }),
        }
      );

      loadTreasury();

      alert(
        "Treasury updated"
      );
    };

  return (
    <div
      style={{
        padding: 40,

        background:
          "#0f172a",

        minHeight:
          "100vh",

        color: "white",
      }}
    >
      <h1>
        🏦 Treasury
        Management
      </h1>

      <br />

      <div
        style={{
          background:
            "#111827",

          padding: 25,

          borderRadius: 20,

          maxWidth: 500,
        }}
      >
        {[
          "hotWallet",

          "coldWallet",

          "reserveWallet",
        ].map((field) => (
          <input
            key={field}
            placeholder={field}
            value={
              form[
                field as keyof typeof form
              ]
            }
            onChange={(e) =>
              setForm({
                ...form,

                [field]:
                  e.target
                    .value,
              })
            }
            style={{
              width: "100%",

              padding: 15,

              borderRadius: 10,

              marginBottom: 15,
            }}
          />
        ))}

        <button
          onClick={
            updateTreasury
          }
          style={{
            width: "100%",

            padding: 15,

            border: "none",

            borderRadius: 10,

            background:
              "#16a34a",

            color: "white",
          }}
        >
          Update Treasury
        </button>
      </div>

      <br />

      {data && (
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
            Liabilities:
            $
            {
              data.liabilities?.toFixed(
                2
              )
            }
          </h2>

          <br />

          <h2>
            Total
            Reserves:
            $
            {
              data.reserves?.toFixed(
                2
              )
            }
          </h2>

          <br />

          <h2>
            Coverage
            Ratio:
            {
              data.coverageRatio?.toFixed(
                2
              )
            }
          </h2>
        </div>
      )}
    </div>
  );
}