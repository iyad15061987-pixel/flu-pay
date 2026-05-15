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
  ] = useState<any[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const email =
          localStorage.getItem(
            "email"
          );

        const res =
          await fetch(
            `${API_URL}/notifications/${email}`,
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

  return (
    <div
      style={{
        display: "flex",

        background:
          localStorage.getItem(
            "theme"
          ) === "light"
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
            localStorage.getItem(
              "theme"
            ) === "light"
              ? "#111827"
              : "white",
        }}
      >
        <h1>
          🔔 Notifications
        </h1>

        <br />

        {notifications.length ===
        0 ? (
          <div
            style={{
              background:
                "#111827",

              padding: 30,

              borderRadius: 20,

              textAlign:
                "center",
            }}
          >
            <h2>
              📭 Empty
            </h2>

            <br />

            <p>
              No notifications
            </p>
          </div>
        ) : (
          notifications.map(
            (
              notification
            ) => (
              <div
                key={
                  notification._id
                }
                style={{
                  background:
                    localStorage.getItem(
                      "theme"
                    ) ===
                    "light"
                      ? "white"
                      : "#111827",

                  padding: 25,

                  borderRadius: 20,

                  marginBottom: 20,

                  boxShadow:
                    "0 0 10px rgba(0,0,0,0.1)",
                }}
              >
                <h3>
                  {
                    notification.title
                  }
                </h3>

                <br />

                <p>
                  {
                    notification.message
                  }
                </p>

                <br />

                <small>
                  {new Date(
                    notification.createdAt
                  ).toLocaleString()}
                </small>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}