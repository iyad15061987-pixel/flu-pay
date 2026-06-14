"use client";

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import {
  usePathname,
} from "next/navigation";

import API_URL from "@/lib/api";

export default function Sidebar() {
  const pathname =
    usePathname();

  const [theme, setTheme] =
    useState("dark");

  const [role, setRole] =
    useState("");

  const [
    notifications,
    setNotifications,
  ] = useState<any[]>([]);

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [isMobile, setIsMobile] =
    useState(false);

  // =========================
  // RESPONSIVE DETECTION
  // =========================

  useEffect(() => {
    const checkMobile =
      () => {
        setIsMobile(
          window.innerWidth <
            768
        );
      };

    checkMobile();

    window.addEventListener(
      "resize",
      checkMobile
    );

    return () =>
      window.removeEventListener(
        "resize",
        checkMobile
      );
  }, []);

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    const savedTheme =
      localStorage.getItem(
        "theme"
      );

    const savedRole =
      localStorage.getItem(
        "role"
      );

    if (savedTheme) {
      setTheme(savedTheme);
    }

    if (savedRole) {
      setRole(savedRole);
    }

    loadNotifications();
  }, []);

  // =========================
  // LOAD NOTIFICATIONS
  // =========================

  const loadNotifications =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          return;
        }

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
          data || []
        );

      } catch (err) {
        console.log(err);
      }
    };

  // =========================
  // MENU ITEMS
  // =========================

  const menuItems = [
    {
      name:
        "Dashboard",

      path:
        "/dashboard",

      icon:
        "🏠",
    },

    {
      name:
        "Deposit",

      path:
        "/deposit",

      icon:
        "🏦",
    },

    {
      name:
        "Withdraw",

      path:
        "/withdraw",

      icon:
        "💸",
    },

    {
      name:
        "Cards",

      path:
        "/cards",

      icon:
        "💳",
    },

   {
  name:
    "Payment Links",

  path:
    "/payment-links",

  icon:
    "🔗",
},

{
  name:
    "Transactions",

  path:
    "/transactions",

  icon:
    "📜",
},

    {
      name:
        "KYC",

      path:
        "/kyc",

      icon:
        "🪪",
    },

    {
      name:
        "Analytics",

      path:
        "/analytics",

      icon:
        "📊",
    },

    {
      name:
        "Requests",

      path:
        "/requests",

      icon:
        "📋",
    },

    {
      name:
        "Notifications",

      path:
        "/notifications",

      icon:
        "🔔",

      count:
        notifications.length,
    },

    {
      name:
        "Support",

      path:
        "/support",

      icon:
        "🆘",
    },

    {
      name:
        "Profile",

      path:
        "/profile",

      icon:
        "👤",
    },

    {
      name:
        "Settings",

      path:
        "/settings",

      icon:
        "⚙️",
    },
  ];

  // =========================
  // LOGOUT
  // =========================

  const logout =
    () => {
      localStorage.clear();

      window.location.href =
        "/login";
    };

  return (
    <>
      {/* MOBILE TOP BAR */}

      {isMobile && (
        <div
          style={{
            display: "flex",

            justifyContent:
              "space-between",

            alignItems:
              "center",

            padding:
              "15px 20px",

            background:
              theme === "light"
                ? "white"
                : "#111827",

            color:
              theme === "light"
                ? "#111827"
                : "white",

            position:
              "fixed",

            top: 0,

            left: 0,

            right: 0,

            zIndex: 4000,

            boxShadow:
              "0 0 10px rgba(0,0,0,0.15)",

            height: 70,
          }}
        >
          <h2>
            🚀 FlowPay
          </h2>

          <button
            onClick={() =>
              setMobileOpen(
                !mobileOpen
              )
            }
            style={{
              border: "none",

              background:
                "transparent",

              color:
                "inherit",

              fontSize: 30,

              cursor:
                "pointer",
            }}
          >
            ☰
          </button>
        </div>
      )}

      {/* SIDEBAR */}

      <div
        style={{
          width: 250,

          height: "100vh",

          background:
            theme === "light"
              ? "white"
              : "#111827",

          color:
            theme === "light"
              ? "#111827"
              : "white",

          padding: 25,

          position:
            "fixed",

          left:
            isMobile
              ? mobileOpen
                ? 0
                : -270
              : 0,

          top: 0,

          overflowY:
            "auto",

          boxShadow:
            "0 0 10px rgba(0,0,0,0.1)",

          display: "flex",

          flexDirection:
            "column",

          justifyContent:
            "space-between",

          zIndex: 5000,

          transition:
            "0.3s ease",
        }}
      >
        <div>
          {/* HEADER */}

          <div
            style={{
              display: "flex",

              justifyContent:
                "space-between",

              alignItems:
                "center",

              marginBottom: 40,
            }}
          >
            <h1>
              🚀 FlowPay
            </h1>

            {isMobile && (
              <button
                onClick={() =>
                  setMobileOpen(
                    false
                  )
                }
                style={{
                  background:
                    "transparent",

                  border: "none",

                  color:
                    "inherit",

                  fontSize: 24,

                  cursor:
                    "pointer",
                }}
              >
                ✖
              </button>
            )}
          </div>

          {/* NAVIGATION */}

          <nav
            style={{
              display: "flex",

              flexDirection:
                "column",

              gap: 10,
            }}
          >
            {menuItems.map(
              (item) => (
                <Link
                  key={
                    item.path
                  }
                  href={
                    item.path
                  }
                  onClick={() =>
                    setMobileOpen(
                      false
                    )
                  }
                  style={{
                    background:
                      pathname ===
                      item.path
                        ? "#2563eb"
                        : "transparent",

                    color:
                      theme ===
                        "light" &&
                      pathname !==
                        item.path
                        ? "#111827"
                        : "white",

                    textDecoration:
                      "none",

                    padding:
                      "12px 15px",

                    borderRadius: 12,

                    transition:
                      "0.2s",

                    fontWeight:
                      pathname ===
                      item.path
                        ? "bold"
                        : "normal",

                    display:
                      "flex",

                    justifyContent:
                      "space-between",

                    alignItems:
                      "center",
                  }}
                >
                  <span>
                    {
                      item.icon
                    }{" "}
                    {
                      item.name
                    }
                  </span>

                  {item.count !==
                    undefined &&
                    item.count >
                      0 && (
                      <span
                        style={{
                          background:
                            "#dc2626",

                          borderRadius:
                            999,

                          padding:
                            "2px 8px",

                          fontSize: 12,
                        }}
                      >
                        {
                          item.count
                        }
                      </span>
                    )}
                </Link>
              )
            )}

            {/* ADMIN */}

            {role ===
              "admin" && (
              <>
                <div
                  style={{
                    marginTop: 25,

                    marginBottom: 10,

                    opacity: 0.7,

                    fontSize: 13,

                    fontWeight:
                      "bold",
                  }}
                >
                  ADMIN
                </div>

                <Link
                  href="/admin"
                  style={{
                    background:
                      pathname ===
                      "/admin"
                        ? "#16a34a"
                        : "transparent",

                    color:
                      "#22c55e",

                    textDecoration:
                      "none",

                    padding:
                      "12px 15px",

                    borderRadius: 12,

                    fontWeight:
                      "bold",
                  }}
                >
                  🛡 Admin Panel
                </Link>

                <Link
                  href="/admin/withdrawals"
                  style={{
                    color:
                      "#f97316",

                    textDecoration:
                      "none",

                    padding:
                      "12px 15px",

                    borderRadius: 12,
                  }}
                >
                  🏦 Withdrawals
                </Link>

                <Link
                  href="/admin/aml"
                  style={{
                    color:
                      "#f59e0b",

                    textDecoration:
                      "none",

                    padding:
                      "12px 15px",

                    borderRadius: 12,
                  }}
                >
                  🛡 AML
                </Link>

                <Link
                  href="/admin/kyc"
                  style={{
                    color:
                      "#38bdf8",

                    textDecoration:
                      "none",

                    padding:
                      "12px 15px",

                    borderRadius: 12,
                  }}
                >
                  🪪 KYC Review
                </Link>

                <Link
                  href="/admin/live"
                  style={{
                    color:
                      "#a855f7",

                    textDecoration:
                      "none",

                    padding:
                      "12px 15px",

                    borderRadius: 12,
                  }}
                >
                  📡 Live Feed
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* FOOTER */}

        <div>
          <div
            style={{
              background:
                "#1f2937",

              padding: 15,

              borderRadius: 14,

              marginBottom: 15,

              fontSize: 13,

              opacity: 0.85,
            }}
          >
            💳 FlowPay
            Fintech Platform
          </div>

          <button
            onClick={logout}
            style={{
              width: "100%",

              padding: 15,

              border: "none",

              borderRadius: 12,

              background:
                "#dc2626",

              color: "white",

              cursor:
                "pointer",

              fontWeight:
                "bold",
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* OVERLAY */}

      {mobileOpen &&
        isMobile && (
          <div
            onClick={() =>
              setMobileOpen(
                false
              )
            }
            style={{
              position:
                "fixed",

              inset: 0,

              background:
                "rgba(0,0,0,0.5)",

              zIndex: 4500,
            }}
          />
        )}
    </>
  );
}