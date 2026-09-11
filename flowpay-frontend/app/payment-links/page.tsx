"use client";

import { useEffect, useMemo, useState } from "react";
import API_URL from "@/lib/api";
import Sidebar from "../components/Sidebar";

type PaymentLink = {
  _id: string;
  title: string;
  amount: number;
  description?: string;
  invoiceNumber?: string;
  customerName?: string;
  customerEmail?: string;
  dueDate?: string;
  status?: string;
  active?: boolean;
  code: string;
};

type Stats = {
  totalLinks: number;
  paidLinks: number;
  pendingLinks: number;
  revenue: number;
};

export default function PaymentLinksPage() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalLinks: 0,
    paidLinks: 0,
    pendingLinks: 0,
    revenue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [copied, setCopied] = useState<string | null>(null);

  const getToken = () => localStorage.getItem("token") || "";

  const getPublicBaseUrl = () => {
    if (typeof window === "undefined") {
      return "https://flowpay.g-m-foundation.com";
    }

    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      return window.location.origin;
    }

    return "https://flowpay.g-m-foundation.com";
  };

  const getPaymentUrl = (code: string) =>
    `${getPublicBaseUrl()}/pay/${code}`;

  const loadLinks = async () => {
    try {
      const res = await fetch(`${API_URL}/payment-links`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to load payment links");
      }

      const data = await res.json();
      setLinks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Payment links load error:", err);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch(`${API_URL}/payment-links/stats`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to load payment link stats");
      }

      const data = await res.json();

      setStats({
        totalLinks: Number(data.totalLinks || 0),
        paidLinks: Number(data.paidLinks || 0),
        pendingLinks: Number(data.pendingLinks || 0),
        revenue: Number(data.revenue || 0),
      });
    } catch (err) {
      console.error("Payment link stats error:", err);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([loadLinks(), loadStats()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const createLink = async () => {
    const numericAmount = Number(amount);

    if (!title.trim()) {
      alert("Please enter a payment link title.");
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    setCreating(true);

    try {
      const res = await fetch(`${API_URL}/payment-links`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          amount: numericAmount,
          description: description.trim(),
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          dueDate,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Unable to create payment link");
      }

      alert("Payment Link Created Successfully");

      setTitle("");
      setAmount("");
      setDescription("");
      setCustomerName("");
      setCustomerEmail("");
      setDueDate("");

      await refreshAll();
    } catch (err: any) {
      console.error("Create payment link error:", err);
      alert(err?.message || "Unable to create payment link.");
    } finally {
      setCreating(false);
    }
  };

  const copyLink = async (code: string) => {
    const url = getPaymentUrl(code);

    try {
      await navigator.clipboard.writeText(url);
      setCopied(code);

      setTimeout(() => {
        setCopied(null);
      }, 1800);
    } catch (err) {
      console.error("Copy error:", err);
      alert(url);
    }
  };

  const toggleLink = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/payment-links/${id}/toggle`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Unable to update payment link");
      }

      await refreshAll();
    } catch (err: any) {
      console.error("Toggle payment link error:", err);
      alert(err?.message || "Unable to update payment link.");
    }
  };

  const refundLink = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to refund this payment?"
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`${API_URL}/payment-links/${id}/refund`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Unable to refund payment");
      }

      alert(data.message || "Payment refunded successfully.");

      await refreshAll();
    } catch (err: any) {
      console.error("Refund payment link error:", err);
      alert(err?.message || "Unable to refund payment.");
    }
  };

  const downloadPdf = (id: string) => {
    const token = getToken();

    window.open(
      `${API_URL}/payment-links/${id}/pdf?token=${encodeURIComponent(token)}`,
      "_blank"
    );
  };

  const filteredLinks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return links.filter((link) => {
      const matchesSearch =
        !query ||
        String(link.title || "").toLowerCase().includes(query) ||
        String(link.invoiceNumber || "").toLowerCase().includes(query) ||
        String(link.customerName || "").toLowerCase().includes(query) ||
        String(link.customerEmail || "").toLowerCase().includes(query) ||
        String(link.code || "").toLowerCase().includes(query);

      const normalizedStatus =
        link.status === "paid"
          ? "paid"
          : link.status === "refunded"
          ? "refunded"
          : "pending";

      const matchesStatus =
        statusFilter === "all" || normalizedStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [links, search, statusFilter]);

  const formatMoney = (value: number) =>
    `$${Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1px solid #263247",
    background: "#0b1220",
    color: "#f8fafc",
    borderRadius: 12,
    padding: "13px 14px",
    outline: "none",
    fontSize: 14,
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 7,
  };

  const cardStyle: React.CSSProperties = {
    background: "linear-gradient(145deg, #111827, #0f172a)",
    border: "1px solid #1e293b",
    borderRadius: 18,
    boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top right, #172554 0%, #0b1120 35%, #070b14 100%)",
        color: "#f8fafc",
      }}
    >
      <Sidebar />

      <main
        style={{
          marginLeft: "var(--content-left)",
          padding: "34px 38px 60px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 20,
            marginBottom: 30,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                color: "#60a5fa",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              FlowPay Fintech Platform
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 32,
                fontWeight: 800,
                letterSpacing: -0.8,
              }}
            >
              Payment Links
            </h1>

            <p
              style={{
                margin: "8px 0 0",
                color: "#94a3b8",
                fontSize: 14,
              }}
            >
              Create, manage and track secure payment links.
            </p>
          </div>

          <button
            onClick={() => {
              document
                .getElementById("create-payment-link")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            style={{
              border: 0,
              borderRadius: 12,
              padding: "13px 20px",
              background: "linear-gradient(135deg, #2563eb, #4f46e5)",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 8px 22px rgba(37,99,235,0.25)",
            }}
          >
            + Create Payment Link
          </button>
        </div>

        {/* Statistics */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 16,
            marginBottom: 28,
          }}
        >
          {[
            {
              label: "Total Links",
              value: stats.totalLinks,
              icon: "🔗",
            },
            {
              label: "Paid Links",
              value: stats.paidLinks,
              icon: "✓",
            },
            {
              label: "Pending",
              value: stats.pendingLinks,
              icon: "◷",
            },
            {
              label: "Revenue",
              value: formatMoney(stats.revenue),
              icon: "$",
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                ...cardStyle,
                padding: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <span
                  style={{
                    color: "#94a3b8",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {item.label}
                </span>

                <span
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#172554",
                    color: "#60a5fa",
                    fontWeight: 800,
                  }}
                >
                  {item.icon}
                </span>
              </div>

              <div
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* Create */}
        <section
          id="create-payment-link"
          style={{
            ...cardStyle,
            padding: 26,
            marginBottom: 30,
          }}
        >
          <div style={{ marginBottom: 22 }}>
            <h2
              style={{
                margin: 0,
                fontSize: 20,
              }}
            >
              Create Payment Link
            </h2>

            <p
              style={{
                margin: "7px 0 0",
                color: "#64748b",
                fontSize: 13,
              }}
            >
              Generate a FlowPay link that you can share with your customer.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 18,
            }}
          >
            <div>
              <label style={labelStyle}>Payment Title *</label>
              <input
                style={inputStyle}
                placeholder="e.g. Emergency Relief Fund"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Amount (USD) *</label>
              <input
                style={inputStyle}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Customer Name</label>
              <input
                style={inputStyle}
                placeholder="Customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Customer Email</label>
              <input
                style={inputStyle}
                type="email"
                placeholder="customer@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Due Date</label>
              <input
                style={inputStyle}
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div
              style={{
                gridColumn: "1 / -1",
              }}
            >
              <label style={labelStyle}>Description</label>
              <textarea
                style={{
                  ...inputStyle,
                  minHeight: 90,
                  resize: "vertical",
                }}
                placeholder="Add a short description for this payment..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: 22,
              paddingTop: 20,
              borderTop: "1px solid #1e293b",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                color: "#64748b",
                fontSize: 12,
              }}
            >
              Customer will receive a secure FlowPay payment page.
            </div>

            <button
              onClick={createLink}
              disabled={creating}
              style={{
                border: 0,
                borderRadius: 12,
                padding: "13px 24px",
                background: creating
                  ? "#334155"
                  : "linear-gradient(135deg, #2563eb, #4f46e5)",
                color: "white",
                fontWeight: 700,
                cursor: creating ? "not-allowed" : "pointer",
                minWidth: 170,
              }}
            >
              {creating ? "Creating..." : "Create Link"}
            </button>
          </div>
        </section>

        {/* Links Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 20,
              }}
            >
              Your Payment Links
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: "#64748b",
                fontSize: 13,
              }}
            >
              Manage and share your payment links.
            </p>
          </div>

          <button
            onClick={refreshAll}
            style={{
              border: "1px solid #263247",
              borderRadius: 10,
              padding: "9px 14px",
              background: "#111827",
              color: "#cbd5e1",
              cursor: "pointer",
            }}
          >
            ↻ Refresh
          </button>
        </div>

        {/* Search / Filter */}
        <div
          style={{
            ...cardStyle,
            padding: 14,
            marginBottom: 18,
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <input
            style={{
              ...inputStyle,
              flex: "1 1 280px",
            }}
            placeholder="Search title, invoice, customer or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            style={{
              ...inputStyle,
              width: 150,
            }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {/* Links */}
        {loading ? (
          <div
            style={{
              ...cardStyle,
              padding: 50,
              textAlign: "center",
              color: "#94a3b8",
            }}
          >
            Loading payment links...
          </div>
        ) : filteredLinks.length === 0 ? (
          <div
            style={{
              ...cardStyle,
              padding: "65px 30px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 42,
                marginBottom: 14,
              }}
            >
              🔗
            </div>

            <h3
              style={{
                margin: 0,
                fontSize: 20,
              }}
            >
              No Payment Links Yet
            </h3>

            <p
              style={{
                color: "#64748b",
                maxWidth: 430,
                margin: "9px auto 20px",
                lineHeight: 1.6,
                fontSize: 13,
              }}
            >
              Create your first FlowPay payment link and share it with your
              customers.
            </p>

            <button
              onClick={() =>
                document
                  .getElementById("create-payment-link")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              style={{
                border: 0,
                borderRadius: 11,
                padding: "11px 20px",
                background: "#2563eb",
                color: "white",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              + Create Your First Link
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: 16,
            }}
          >
            {filteredLinks.map((link) => {
              const paymentUrl = getPaymentUrl(link.code);

              const status =
                link.status === "paid"
                  ? {
                      label: "Paid",
                      background: "#052e1a",
                      color: "#4ade80",
                    }
                  : link.status === "refunded"
                  ? {
                      label: "Refunded",
                      background: "#3f1d0b",
                      color: "#fb923c",
                    }
                  : {
                      label: "Pending",
                      background: "#172554",
                      color: "#60a5fa",
                    };

              return (
                <div
                  key={link._id}
                  style={{
                    ...cardStyle,
                    padding: 22,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 18,
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 240 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          marginBottom: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                            fontSize: 18,
                          }}
                        >
                          {link.title}
                        </h3>

                        <span
                          style={{
                            padding: "5px 9px",
                            borderRadius: 999,
                            background: status.background,
                            color: status.color,
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {status.label}
                        </span>

                        <span
                          style={{
                            padding: "5px 9px",
                            borderRadius: 999,
                            background: link.active
                              ? "#052e1a"
                              : "#3f1722",
                            color: link.active
                              ? "#4ade80"
                              : "#fb7185",
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {link.active ? "Active" : "Disabled"}
                        </span>
                      </div>

                      {link.description && (
                        <p
                          style={{
                            margin: "0 0 14px",
                            color: "#94a3b8",
                            fontSize: 13,
                          }}
                        >
                          {link.description}
                        </p>
                      )}

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(150px, 1fr))",
                          gap: 12,
                          marginBottom: 16,
                        }}
                      >
                        <div>
                          <div
                            style={{
                              color: "#64748b",
                              fontSize: 11,
                              marginBottom: 4,
                            }}
                          >
                            Amount
                          </div>
                          <strong style={{ fontSize: 20 }}>
                            {formatMoney(Number(link.amount))}
                          </strong>
                        </div>

                        <div>
                          <div
                            style={{
                              color: "#64748b",
                              fontSize: 11,
                              marginBottom: 4,
                            }}
                          >
                            Invoice
                          </div>
                          <span style={{ color: "#cbd5e1", fontSize: 13 }}>
                            {link.invoiceNumber || "-"}
                          </span>
                        </div>

                        <div>
                          <div
                            style={{
                              color: "#64748b",
                              fontSize: 11,
                              marginBottom: 4,
                            }}
                          >
                            Customer
                          </div>
                          <span style={{ color: "#cbd5e1", fontSize: 13 }}>
                            {link.customerName || "—"}
                          </span>
                        </div>

                        <div>
                          <div
                            style={{
                              color: "#64748b",
                              fontSize: 11,
                              marginBottom: 4,
                            }}
                          >
                            Due Date
                          </div>
                          <span style={{ color: "#cbd5e1", fontSize: 13 }}>
                            {link.dueDate
                              ? new Date(link.dueDate).toLocaleDateString()
                              : "No due date"}
                          </span>
                        </div>
                      </div>

                      <div
                        style={{
                          background: "#080d18",
                          border: "1px solid #1e293b",
                          borderRadius: 10,
                          padding: "10px 12px",
                          color: "#60a5fa",
                          fontSize: 12,
                          wordBreak: "break-all",
                        }}
                      >
                        {paymentUrl}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        justifyContent: "flex-end",
                        maxWidth: 340,
                      }}
                    >
                      <button
                        onClick={() => copyLink(link.code)}
                        style={{
                          border: 0,
                          borderRadius: 9,
                          padding: "9px 13px",
                          background: "#2563eb",
                          color: "white",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {copied === link.code ? "✓ Copied" : "Copy Link"}
                      </button>

                      <button
                        onClick={() => window.open(paymentUrl, "_blank")}
                        style={{
                          border: "1px solid #334155",
                          borderRadius: 9,
                          padding: "9px 13px",
                          background: "#111827",
                          color: "#cbd5e1",
                          cursor: "pointer",
                        }}
                      >
                        Open
                      </button>

                      <button
                        onClick={() => downloadPdf(link._id)}
                        style={{
                          border: "1px solid #334155",
                          borderRadius: 9,
                          padding: "9px 13px",
                          background: "#111827",
                          color: "#cbd5e1",
                          cursor: "pointer",
                        }}
                      >
                        PDF
                      </button>

                      <button
                        onClick={() => toggleLink(link._id)}
                        style={{
                          border: "1px solid #334155",
                          borderRadius: 9,
                          padding: "9px 13px",
                          background: "#111827",
                          color: link.active ? "#fb7185" : "#4ade80",
                          cursor: "pointer",
                        }}
                      >
                        {link.active ? "Disable" : "Enable"}
                      </button>

                      {link.status === "paid" && (
                        <button
                          onClick={() => refundLink(link._id)}
                          style={{
                            border: "1px solid #7c2d12",
                            borderRadius: 9,
                            padding: "9px 13px",
                            background: "#2a1309",
                            color: "#fb923c",
                            cursor: "pointer",
                          }}
                        >
                          Refund
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}