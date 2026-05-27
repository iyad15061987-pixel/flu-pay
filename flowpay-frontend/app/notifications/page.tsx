"use client";

import {
  useEffect,
  useState,
} from "react";

import Sidebar from "../components/Sidebar";

import API_URL from "@/lib/api";

export default function NotificationsPage() {
  const [
    notifications,
    setNotifications,
  ] = useState<any[]>(
    []
  );

  const loadNotifications =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/notifications`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        setNotifications(
          data
        );

      } catch (err) {
        console.log(err);
      }
    };

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <div
      style={{
        display: "flex",

        background:
          "#0f172a",

        minHeight:
          "100vh",

        color:
          "white",
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
          🔔 Notifications
        </h1>

        <br />

        {notifications.map(
          (n) => (
            <div
              key={n._id}
              style={{
                background:
                  "#111827",

                padding: 20,

                borderRadius: 14,

                marginBottom: 15,
              }}
            >
              <h3>
                {n.title}
              </h3>

              <p>
                {n.message}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}