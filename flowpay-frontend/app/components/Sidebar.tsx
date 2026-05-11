"use client";

export default function Sidebar() {
  const logout = () => {
    localStorage.clear();

    window.location.href = "/login";
  };

  return (
    <div
      style={{
        width: 250,
        background: "#111827",
        color: "white",
        height: "100vh",
        padding: 20,
        position: "fixed",
        left: 0,
        top: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <h1
          style={{
            marginBottom: 40,
          }}
        >
          🚀 FlowPay
        </h1>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <a
            href="/dashboard"
            style={{
              color: "white",
              textDecoration: "none",
            }}
          >
            Dashboard
          </a>

          <a
            href="/profile"
            style={{
              color: "white",
              textDecoration: "none",
            }}
          >
            Profile
          </a>

          <a
            href="/settings"
            style={{
              color: "white",
              textDecoration: "none",
            }}
          >
            Settings
          </a>

          <a
            href="/admin"
            style={{
              color: "white",
              textDecoration: "none",
            }}
          >
            Admin
          </a>
        </div>
      </div>

      <button
        onClick={logout}
        style={{
          padding: 15,
          background: "#dc2626",
          color: "white",
          border: "none",
          borderRadius: 10,
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}