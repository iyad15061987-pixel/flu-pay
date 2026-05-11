export default function CurrencyCard() {
  return (
    <div
      style={{
        background: "#111827",
        padding: 25,
        borderRadius: 20,
        color: "white",
      }}
    >
      <h2>💱 Currency</h2>

      <br />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 15,
        }}
      >
        <div
          style={{
            background: "#1f2937",
            padding: 15,
            borderRadius: 15,
          }}
        >
          USD — United States Dollar
        </div>

        <div
          style={{
            background: "#1f2937",
            padding: 15,
            borderRadius: 15,
          }}
        >
          EUR — Euro
        </div>

        <div
          style={{
            background: "#1f2937",
            padding: 15,
            borderRadius: 15,
          }}
        >
          GBP — British Pound
        </div>
      </div>
    </div>
  );
}