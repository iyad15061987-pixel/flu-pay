"use client";

import {
  useState,
  useEffect,
} from "react";

import Sidebar from "../components/Sidebar";

import API_URL from "@/lib/api";

export default function KycPage() {
  const [theme, setTheme] =
    useState("dark");

  const [fullName, setFullName] =
    useState("");

  const [country, setCountry] =
    useState("");

  const [
    documentType,
    setDocumentType,
  ] = useState("passport");

  const [
    documentFront,
    setDocumentFront,
  ] = useState<any>(null);

  const [selfie, setSelfie] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    const savedTheme =
      localStorage.getItem(
        "theme"
      );

    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

const submitKyc =
  async () => {
    try {

      if (
        !documentFront ||
        !selfie
      ) {
        alert(
          "Upload required files"
        );
        return;
      }

      setLoading(true);

      const token =
        localStorage.getItem(
          "token"
        );

      const formData =
        new FormData();

      formData.append(
        "fullName",
        fullName
      );

      formData.append(
        "country",
        country
      );

      formData.append(
        "documentType",
        documentType
      );

      formData.append(
        "passport",
        documentFront
      );

      formData.append(
        "selfie",
        selfie
      );

      const res =
        await fetch(
          `${API_URL}/upload-kyc`,
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
            body:
              formData,
          }
        );

      const data =
        await res.json();

      alert(
        data.message
      );

    } catch (err) {

      console.log(err);

      alert(
        "Server error"
      );

    } finally {

      setLoading(
        false
      );

    }
  };

  return (
    <div
      style={{
        display: "flex",

        background:
          theme === "light"
            ? "#f3f4f6"
            : "#0f172a",

        minHeight: "100vh",
      }}
    >
      <Sidebar />

      <div
        style={{
          marginLeft: 250,

          padding: 40,

          width: "100%",

          color:
            theme === "light"
              ? "#111827"
              : "white",
        }}
      >
        <h1>
          🪪 KYC Verification
        </h1>

        <br />

        <div
          style={{
            background:
              theme === "light"
                ? "white"
                : "#111827",

            padding: 30,

            borderRadius: 20,

            maxWidth: 700,
          }}
        >
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) =>
              setFullName(
                e.target.value
              )
            }
            style={{
              width: "100%",

              padding: 15,

              marginBottom: 20,

              borderRadius: 10,

              border: "none",
            }}
          />

          <input
            type="text"
            placeholder="Country"
            value={country}
            onChange={(e) =>
              setCountry(
                e.target.value
              )
            }
            style={{
              width: "100%",

              padding: 15,

              marginBottom: 20,

              borderRadius: 10,

              border: "none",
            }}
          />

          <select
            value={documentType}
            onChange={(e) =>
              setDocumentType(
                e.target.value
              )
            }
            style={{
              width: "100%",

              padding: 15,

              marginBottom: 20,

              borderRadius: 10,
            }}
          >
            <option value="passport">
              Passport
            </option>

            <option value="id">
              National ID
            </option>

            <option value="license">
              Driver License
            </option>
          </select>

          <label>
            Upload Document
            Front
          </label>

          <br />
          <br />

          <input
            type="file"
            onChange={(e) =>
              setDocumentFront(
                e.target.files?.[0]
              )
            }
          />

          <br />
          <br />
          <br />

          <label>
            Upload Selfie
          </label>

          <br />
          <br />

          <input
            type="file"
            onChange={(e) =>
              setSelfie(
                e.target.files?.[0]
              )
            }
          />

          <br />
          <br />
          <br />

          <button
            onClick={submitKyc}
            disabled={loading}
            style={{
              width: "100%",

              padding: 15,

              border: "none",

              borderRadius: 12,

              background:
                "#2563eb",

              color: "white",

              cursor: "pointer",

              fontWeight:
                "bold",
            }}
          >
            {loading
              ? "Submitting..."
              : "Submit KYC"}
          </button>
        </div>
      </div>
    </div>
  );
}