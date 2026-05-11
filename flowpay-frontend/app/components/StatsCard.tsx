type Props = {
  title: string;
  value: string;
};

export default function StatsCard({
  title,
  value,
}: Props) {
  return (
    <div
      style={{
        background: "#111827",
        padding: 25,
        borderRadius: 20,
        color: "white",
        minWidth: 220,
        boxShadow: "0 0 20px rgba(0,0,0,0.3)",
      }}
    >
      <p
        style={{
          color: "#9ca3af",
          marginBottom: 10,
        }}
      >
        {title}
      </p>

      <h1>{value}</h1>
    </div>
  );
}