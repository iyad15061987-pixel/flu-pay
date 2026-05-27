"use client";

import {
  useEffect,
  useState,
} from "react";

import Sidebar from "../components/Sidebar";

import API_URL from "@/lib/api";

interface BankAccount {
  bankName: string;

  iban: string;

  swift: string;

  currency: string;
}

export default function BankPage() {
  const [mounted, setMounted] =
    useState(false);

  const [theme, setTheme] =
    useState("dark");

  const [accounts, setAccounts] =
    useState<BankAccount[]>(
      []
    );

  const [form, setForm] =
    useState({
      bankName: "",

      accountHolder:
        "",

      iban: "",

      swift: "",

      country: "",

      currency:
        "USD",
    });

  useEffect(() => {
    setMounted(true);

    const savedTheme =
      localStorage.getItem(
        "theme"
      );

    if (savedTheme) {
      setTheme(savedTheme);
    }

    loadAccounts();
  }, []);

  if (!mounted) {
    return null;
  }

  const loadAccounts =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/bank-accounts`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        setAccounts(data);

      } catch (err) {
        console.log(err);
      }
    };

  const addAccount =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        await fetch(
          `${API_URL}/add-bank-account`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify(
              form
            ),
          }
        );

        loadAccounts();

        alert(
          "Bank account added"
        );

      } catch (err) {
        console.log(err);

        alert(
          "Server error"
        );
      }
    };

  return (
    <div
      style={{
        display: "flex",

        minHeight:
          "100vh",

        background:
          theme === "light"
            ? "#f3f4f6"
            : "#0f172a",

        color:
          theme === "light"
            ? "#111827"
            : "white",
      }}
    >
      <Sidebar />

      <div
        style={{
          marginLeft: 250,

          padding: 40,

          width: "100%",
        }}
      >
        <h1>
          🏦 Bank Accounts
        </h1>

        <br />

        <div
          style={{
            background:
              theme === "light"
                ? "white"
                : "#111827",

            padding: 25,

            borderRadius: 20,

            maxWidth: 700,
          }}
        >
          {[
            "bankName",

            "accountHolder",

            "iban",

            "swift",

            "country",
          ].map(
            (
              field: string,
              index: number
            ) => (
              <input
                key={index}
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

                  border: "none",
                }}
              />
            )
          )}

          <select
            value={
              form.currency
            }
            onChange={(e) =>
              setForm({
                ...form,

                currency:
                  e.target
                    .value,
              })
            }
            style={{
              width: "100%",

              padding: 15,

              borderRadius: 10,

              marginBottom: 20,
            }}
          >
            <option>
              USD
            </option>

            <option>
              EUR
            </option>

            <option>
              GBP
            </option>
          </select>

          <button
            onClick={
              addAccount
            }
            style={{
              width: "100%",

              padding: 15,

              borderRadius: 10,

              border: "none",

              background:
                "#2563eb",

              color: "white",

              cursor: "pointer",
            }}
          >
            Add Bank
            Account
          </button>
        </div>

        <br />

        {accounts.length ===
        0 ? (
          <div
            style={{
              background:
                theme === "light"
                  ? "white"
                  : "#111827",

              padding: 25,

              borderRadius: 20,
            }}
          >
            No bank accounts
            found.
          </div>
        ) : (
          accounts.map(
            (
              acc: BankAccount,
              index: number
            ) => (
              <div
                key={index}
                style={{
                  background:
                    theme === "light"
                      ? "white"
                      : "#111827",

                  padding: 20,

                  borderRadius: 20,

                  marginBottom: 20,
                }}
              >
                <h3>
                  {
                    acc.bankName
                  }
                </h3>

                <br />

                <p>
                  IBAN:{" "}
                  {
                    acc.iban
                  }
                </p>

                <br />

                <p>
                  SWIFT:{" "}
                  {
                    acc.swift
                  }
                </p>

                <br />

                <p>
                  Currency:{" "}
                  {
                    acc.currency
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