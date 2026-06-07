"use client";

interface Props {
  analytics: any;
}

export default function MerchantAnalytics({
  analytics,
}: Props) {
  if (!analytics) {
    return null;
  }

  return (
    <div
      style={{
        display: "grid",

        gridTemplateColumns:
          "repeat(auto-fit,minmax(220px,1fr))",

        gap: 20,

        marginBottom: 30,
      }}
    >
      <div
        style={{
          background:
            "#111827",

          padding: 25,

          borderRadius: 20,

          color: "white",
        }}
      >
        <h3>
          💰 Total Revenue
        </h3>

        <br />

        <h1>
          $
          {analytics.totalRevenue?.toFixed(
            2
          )}
        </h1>
      </div>

      <div
        style={{
          background:
            "#111827",

          padding: 25,

          borderRadius: 20,

          color: "white",
        }}
      >
        <h3>
          ✅ Paid Revenue
        </h3>

        <br />

        <h1>
          $
          {analytics.paidRevenue?.toFixed(
            2
          )}
        </h1>
      </div>

      <div
        style={{
          background:
            "#111827",

          padding: 25,

          borderRadius: 20,

          color: "white",
        }}
      >
        <h3>
          ⏳ Pending Revenue
        </h3>

        <br />

        <h1>
          $
          {analytics.pendingRevenue?.toFixed(
            2
          )}
        </h1>
      </div>

      <div
        style={{
          background:
            "#111827",

          padding: 25,

          borderRadius: 20,

          color: "white",
        }}
      >
        <h3>
          📊 Success Rate
        </h3>

        <br />

        <h1>
          {
            analytics.successRate
          }
          %
        </h1>
      </div>
    </div>
  );
}