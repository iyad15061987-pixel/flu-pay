"use client";

import {
  useEffect,
  useState,
} from "react";

import io from "socket.io-client";

import API_URL from "@/lib/api";

const socket =
  io();

export default function LiveAdminPage() {
  const [logs, setLogs] =
    useState<any[]>([]);

  const loadLogs =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/admin/live-activity`,
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

      } catch (err) {
        console.log(err);
      }
    };

  useEffect(() => {
    loadLogs();

    socket.on(
      "admin_activity",

      (activity) => {
        setLogs(
          (prev) => [
            activity,
            ...prev,
          ]
        );
      }
    );

    return () => {
      socket.off(
        "admin_activity"
      );
    };
  }, []);

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
        📡 Live Platform
        Activity
      </h1>

      <br />

      {logs.map(
        (log) => (
          <div
            key={log._id}
            style={{
              background:
                "#111827",

              padding: 20,

              borderRadius: 16,

              marginBottom: 15,
            }}
          >
            <p>
              <strong>
                {log.email}
              </strong>
            </p>

            <p>
              Action:
              {
                log.action
              }
            </p>

            <p>
              Role:
              {log.role}
            </p>

            <small>
              {new Date(
                log.createdAt
              ).toLocaleString()}
            </small>
          </div>
        )
      )}
    </div>
  );
}