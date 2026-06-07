"use client";

import {
  useEffect,
  useState,
} from "react";

import Sidebar from "../components/Sidebar";

import API_URL from "@/lib/api";

interface Member {
  email: string;

  role: string;
}

interface CorporateData {
  _id: string;

  companyName: string;

  members: Member[];
}

export default function CorporatePage() {
  const [mounted, setMounted] =
    useState(false);

  const [theme, setTheme] =
    useState("dark");

  const [corporate, setCorporate] =
    useState<CorporateData | null>(
      null
    );

  const [companyName, setCompanyName] =
    useState("");

  const [member, setMember] =
    useState({
      email: "",

      role:
        "Viewer",
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

    loadCorporate();
  }, []);

  if (!mounted) {
    return null;
  }

  const loadCorporate =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/corporate`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        setCorporate(data);

      } catch (err) {
        console.log(err);
      }
    };

  const createCorporate =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        await fetch(
          `${API_URL}/create-corporate`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              companyName,
            }),
          }
        );

        loadCorporate();

      } catch (err) {
        console.log(err);
      }
    };

  const addMember =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        if (!corporate) {
          return;
        }

        await fetch(
          `${API_URL}/add-corporate-member`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              companyId:
                corporate._id,

              email:
                member.email,

              role:
                member.role,
            }),
          }
        );

        setMember({
          email: "",

          role:
            "Viewer",
        });

        loadCorporate();

      } catch (err) {
        console.log(err);
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
          🏢 Corporate
          Accounts
        </h1>

        <br />

        {!corporate ? (
          <div
            style={{
              background:
                theme === "light"
                  ? "white"
                  : "#111827",

              padding: 25,

              borderRadius: 20,

              maxWidth: 500,
            }}
          >
            <input
              placeholder="Company Name"
              value={
                companyName
              }
              onChange={(e) =>
                setCompanyName(
                  e.target.value
                )
              }
              style={{
                width: "100%",

                padding: 15,

                borderRadius: 10,

                marginBottom: 15,

                border: "none",
              }}
            />

            <button
              onClick={
                createCorporate
              }
              style={{
                width: "100%",

                padding: 15,

                border: "none",

                borderRadius: 10,

                background:
                  "#2563eb",

                color: "white",

                cursor: "pointer",
              }}
            >
              Create
              Corporate
              Account
            </button>
          </div>
        ) : (
          <>
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
              <h2>
                {
                  corporate.companyName
                }
              </h2>

              <br />

              <h3>
                Team Members
              </h3>

              <br />

              {corporate.members.map(
                (
                  m: Member,
                  index: number
                ) => (
                  <div
                    key={index}
                    style={{
                      padding: 10,

                      borderBottom:
                        "1px solid #374151",
                    }}
                  >
                    <p>
                      {m.email}
                    </p>

                    <p>
                      {m.role}
                    </p>
                  </div>
                )
              )}
            </div>

            <br />

            <div
              style={{
                background:
                  theme === "light"
                    ? "white"
                    : "#111827",

                padding: 25,

                borderRadius: 20,

                maxWidth: 500,
              }}
            >
              <input
                placeholder="Member Email"
                value={
                  member.email
                }
                onChange={(e) =>
                  setMember({
                    ...member,

                    email:
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

              <select
                value={
                  member.role
                }
                onChange={(e) =>
                  setMember({
                    ...member,

                    role:
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
              >
                <option>
                  Admin
                </option>

                <option>
                  Accountant
                </option>

                <option>
                  Viewer
                </option>
              </select>

              <button
                onClick={
                  addMember
                }
                style={{
                  width: "100%",

                  padding: 15,

                  border: "none",

                  borderRadius: 10,

                  background:
                    "#16a34a",

                  color: "white",

                  cursor: "pointer",
                }}
              >
                Add Member
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}