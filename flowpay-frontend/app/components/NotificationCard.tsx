export default function NotificationCard() {
  return (
    <div
      style={{
        background: "#111827",
        padding: 25,
        borderRadius: 20,
        color: "white",
      }}
    >
      <h2>🔔 Notifications</h2>

      <br />

      <div
        style={{
          background: "#1f2937",
          padding: 15,
          borderRadius: 15,
          marginBottom: 10,
        }}
      >
        Wallet security updated successfully.
      </div>

      <div
        style={{
          background: "#1f2937",
          padding: 15,
          borderRadius: 15,
          marginBottom: 10,
        }}
      >
        Your account is fully verified.
      </div>

      <div
        style={{
          background: "#1f2937",
          padding: 15,
          borderRadius: 15,
        }}
      >
        FlowPay system running normally.
      </div>
    </div>
  );
}