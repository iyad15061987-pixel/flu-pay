"use client";

import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";

import API_URL from "@/lib/api";

interface Notification {
  _id: string;
  message: string;
  createdAt: string;
}

export default function NotificationsPage() {
  const [
    notifications,
    setNotifications,
  ] = useState<
    Notification[]
  >([]);

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
        background: "#0f172a",
        minHeight: "100vh",
      }}
    >
      <Sidebar />

      <div
        style={{
          marginLeft: 250,
          padding: 40,
          width: "100%",
          color: "white",
        }}
      >
        <h1>
          🔔 Notifications
        </h1>

        <br />

        {notifications.length ===
        0 ? (
          <p>
            No notifications
          </p>
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
                    "#111827",
                  padding: 20,
                  borderRadius: 15,
                  marginBottom: 15,
                }}
              >
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