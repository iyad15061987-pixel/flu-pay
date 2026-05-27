"use client";

import {
  useEffect,
  useState,
} from "react";

import API_URL from "@/lib/api";

export default function ActivityPage() {
  const [logs, setLogs] =
    useState<any[]>([]);

  const loadLogs =
    async () => {
      const token =
        localStorage.getItem(
          "token"
        );

      const res =
        await fetch(
          `${API_URL}/admin/activity-logs`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await res.json();

      setLogs(data);
    };

  useEffect(() => {
    loadLogs();
  }, []);

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
        📋 Activity
        Logs
      </h1>

      <br />

      {logs.map(
        (
          log,
          index
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
                log.action
              }
            </h3>

            <br />

            <p>
              User:
              {
                log.email
              }
            </p>

            <p>
              Role:
              {
                log.role
              }
            </p>

            <p>
              IP:
              {
                log.ip
              }
            </p>

            <br />

            <pre>
              {JSON.stringify(
                log.metadata,

                null,

                2
              )}
            </pre>
          </div>
        )
      )}
    </div>
  );
}