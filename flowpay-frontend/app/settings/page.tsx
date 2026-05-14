"use client";

export default function SettingsPage() {
  const logout = () => {
    localStorage.clear();

    window.location.href =
      "/login";
  };

  return (
    <div
      style={{
        padding: 40,
        background: "#0f172a",
        minHeight: "100vh",
        color: "white",
      }}
    >
      <h1>
        ⚙ Settings
      </h1>

      <br />

      <div
        style={{
          background:
            "#111827",
          padding: 30,
          borderRadius: 20,
        }}
      >
        <button
          onClick={logout}
          style={{
            width: "100%",
            padding: 15,
            border: "none",
            borderRadius: 10,
            background:
              "#dc2626",
            color: "white",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}