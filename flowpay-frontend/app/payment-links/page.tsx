"use client";

import {
  useEffect,
  useState,
} from "react";

import API_URL from "@/lib/api";

import Sidebar from "../components/Sidebar";

export default function PaymentLinksPage() {
  const [title, setTitle] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
  customerName,
  setCustomerName,
] = useState("");

const [
  customerEmail,
  setCustomerEmail,
] = useState("");

const [
  dueDate,
  setDueDate,
] = useState("");

  const [links, setLinks] =
    useState<any[]>([]);

  const [stats, setStats] =
    useState({
      totalLinks: 0,
      paidLinks: 0,
      pendingLinks: 0,
      revenue: 0,
    });

  const loadLinks =
    async () => {
      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/payment-links`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        setLinks(data);

      } catch (err) {
        console.log(err);
      }
    };

  const loadStats =
    async () => {
      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/payment-links/stats`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        setStats(data);

      } catch (err) {
        console.log(err);
      }
    };

  useEffect(() => {
    loadLinks();
    loadStats();
  }, []);

  const createLink =
    async () => {
      try {

        const token =
          localStorage.getItem(
            "token"
          );

        await fetch(
          `${API_URL}/payment-links`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

           body: JSON.stringify({
  title,
  amount:
    Number(amount),
  description,

  customerName,

  customerEmail,

  dueDate,
}),

          }
        );

        alert(
          "Payment Link Created"
        );

        setTitle("");
        setAmount("");
        setDescription("");

setCustomerName("");
setCustomerEmail("");
setDueDate("");

        loadLinks();
        loadStats();

      } catch (err) {
        console.log(err);
      }
    };

  return (
    <div
      style={{
        display: "flex",
        background:
          "#0f172a",
        minHeight:
          "100vh",
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
          🔗 Payment Links
        </h1>

        <br />

        {/* Analytics */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(4,1fr)",
            gap: 20,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              background:
                "#111827",
              padding: 20,
              borderRadius: 16,
            }}
          >
            <h3>
              Total Links
            </h3>

            <h1>
              {
                stats.totalLinks
              }
            </h1>
          </div>

          <div
            style={{
              background:
                "#111827",
              padding: 20,
              borderRadius: 16,
            }}
          >
            <h3>
              Paid Links
            </h3>

            <h1>
              {
                stats.paidLinks
              }
            </h1>
          </div>

          <div
            style={{
              background:
                "#111827",
              padding: 20,
              borderRadius: 16,
            }}
          >
            <h3>
              Pending
            </h3>

            <h1>
              {
                stats.pendingLinks
              }
            </h1>
          </div>

          <div
            style={{
              background:
                "#111827",
              padding: 20,
              borderRadius: 16,
            }}
          >
            <h3>
              Revenue
            </h3>

            <h1>
              $
              {
                stats.revenue
              }
            </h1>
          </div>
        </div>

        <input
          placeholder="Title"
          value={title}
          onChange={(e) =>
            setTitle(
              e.target.value
            )
          }
        />

        <br />
        <br />

        <input
          placeholder="Amount"
          value={amount}
          onChange={(e) =>
            setAmount(
              e.target.value
            )
          }
        />

        <br />
        <br />

<br />
<br />

<input
  placeholder="Customer Name"
  value={customerName}
  onChange={(e) =>
    setCustomerName(
      e.target.value
    )
  }
/>

<br />
<br />

<input
  placeholder="Customer Email"
  value={customerEmail}
  onChange={(e) =>
    setCustomerEmail(
      e.target.value
    )
  }
/>

<br />
<br />

<input
  type="date"
  value={dueDate}
  onChange={(e) =>
    setDueDate(
      e.target.value
    )
  }
/>

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }
        />

        <br />
        <br />

        <button
          onClick={
            createLink
          }
        >
          Create Link
        </button>

        <br />
        <br />
        <br />
{links.map(
  (link) => (
    <div
      key={link._id}
      style={{
        background:
          "#111827",
        padding: 20,
        borderRadius: 15,
        marginBottom: 15,
      }}
    >
      <h3>
        {link.title}
      </h3>

      <p>
        $
        {link.amount}
      </p>

      <p>
        {link.description}
      </p>

      <p>
        Invoice:
        {" "}
        {link.invoiceNumber}
      </p>

      <p>
        Customer:
        {" "}
        {link.customerName}
      </p>

      <p>
        Email:
        {" "}
        {link.customerEmail}
      </p>

      <p>
        Due:
        {" "}
        {link.dueDate
          ? new Date(
              link.dueDate
            ).toLocaleDateString()
          : "-"}
      </p>

      <p>
        Status:
        {" "}
        {link.status ===
        "paid"
          ? "✅ Paid"
          : link.status ===
            "refunded"
          ? "↩️ Refunded"
          : "⏳ Pending"}
      </p>

      <p>
        Active:
        {" "}
        {link.active
          ? "🟢 Active"
          : "🔴 Disabled"}
      </p>

      <p>
        http://localhost:3000/pay/
        {link.code}
      </p>

      <br />

      <button
        onClick={() => {
          navigator.clipboard.writeText(
            `http://localhost:3000/pay/${link.code}`
          );

          alert(
            "Link copied"
          );
        }}
     >
  📋 Copy Link
</button>

{" "}

<button
  onClick={() => {

    const token =
      localStorage.getItem(
        "token"
      );

    window.open(
      `${API_URL}/payment-links/${link._id}/pdf?token=${token}`,
      "_blank"
    );
  }}
>
  📄 Download PDF
</button>

{" "}

<button
  onClick={async () => {
    try {

      const token =
        localStorage.getItem(
          "token"
        );

      await fetch(
        `${API_URL}/payment-links/${link._id}/toggle`,
        {
          method:
            "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      loadLinks();

    } catch (err) {

      console.log(
        err
      );
    }
  }}
>
  {link.active
    ? "❌ Disable"
    : "🟢 Enable"}
</button>

{" "}

{link.status ===
  "paid" && (
  <button
    onClick={async () => {
      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/payment-links/${link._id}/refund`,
            {
              method:
                "POST",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        alert(
          data.message
        );

        loadLinks();
        loadStats();

      } catch (err) {

        console.log(
          err
        );
      }
    }}
  >
    ↩️ Refund
  </button>
)}

    </div>
  )
)}
      </div>
    </div>
  );
}