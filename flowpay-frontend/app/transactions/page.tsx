"use client";

import {
  useEffect,
  useState,
} from "react";

import Sidebar from "../components/Sidebar";

import API_URL from "@/lib/api";

export default function TransactionsPage() {

  const [
    transactions,
    setTransactions,
  ] = useState<any[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
  search,
  setSearch,
] = useState("");

const [
  typeFilter,
  setTypeFilter,
] = useState("all");

  const loadTransactions =
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
            `${API_URL}/transactions/${email}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        setTransactions(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {
    loadTransactions();
  }, []);

  const filteredTransactions =
  transactions.filter(
    (tx) => {

      const matchesSearch =
        search === "" ||
  (tx.fromEmail || "")
  .toLowerCase()
  .includes(
    search.toLowerCase()
  ) ||
(tx.toEmail || "")
  .toLowerCase()
  .includes(
    search.toLowerCase()
  );

      const matchesType =
        typeFilter ===
          "all" ||
        tx.type ===
          typeFilter;

      return (
        matchesSearch &&
        matchesType
      );
    }
  );
  
  const exportCSV = () => {

  const rows = [
    [
      "Date",
      "Type",
      "Amount",
      "Fee",
      "Status",
      "From",
      "To",
    ],

    ...filteredTransactions.map(
      (tx) => [
        new Date(
          tx.createdAt
        ).toLocaleString(),
        tx.type,
        tx.amount,
        tx.fee,
        tx.status,
        tx.fromEmail,
        tx.toEmail,
      ]
    ),
  ];

  const csvContent =
    rows
      .map(
        (row) =>
          row.join(",")
      )
      .join("\n");

  const blob =
    new Blob(
      [csvContent],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );

  const url =
    URL.createObjectURL(
      blob
    );

  const link =
    document.createElement(
      "a"
    );

  link.href = url;

  link.download =
    "transactions.csv";

  link.click();

  URL.revokeObjectURL(
    url
  );
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
    📜 Transactions
  </h1>
<br />

<button
  onClick={
    exportCSV
  }
  style={{
    padding:
      "10px 15px",

    borderRadius:
      10,

    cursor:
      "pointer",
  }}
>
  📥 Export CSV
</button>

  <br />

  <input
    placeholder="Search Email"
    value={search}
    onChange={(e) =>
      setSearch(
        e.target.value
      )
    }
    style={{
      padding: 10,
      width: 300,
      marginRight: 10,
    }}
  />

  <select
    value={typeFilter}
    onChange={(e) =>
      setTypeFilter(
        e.target.value
      )
    }
    style={{
      padding: 10,
    }}
  >
    <option value="all">
      All Types
    </option>

    <option value="deposit">
      Deposit
    </option>

    <option value="withdrawal">
      Withdrawal
    </option>

    <option value="transfer">
      Transfer
    </option>

    <option value="payment_link">
      Payment Link
    </option>

    <option value="refund">
      Refund
    </option>
  </select>

  <br />
  <br />

  {loading && (
    <p>
      Loading...
    </p>
  )}

  {!loading &&
    filteredTransactions.length === 0 && (
      <p>
        No transactions found
      </p>
    )}

  {filteredTransactions.map(
    (tx) => (
      <div
        key={tx._id}
        style={{
          background:
            "#111827",
          padding: 20,
          borderRadius: 15,
          marginBottom: 15,
        }}
      >
        <h3>
          {tx.type}
        </h3>

        <br />

        <p>
          Amount:
          {" "}
          $
          {Number(
            tx.amount || 0
          ).toFixed(2)}
        </p>

        <p>
          Fee:
          {" "}
          $
          {Number(
            tx.fee || 0
          ).toFixed(2)}
        </p>

        <p>
          Status:
          {" "}
          {tx.status}
        </p>

        <p>
          From:
          {" "}
          {tx.fromEmail}
        </p>

        <p>
          To:
          {" "}
          {tx.toEmail}
        </p>

        <p>
          Date:
          {" "}
          {new Date(
            tx.createdAt
          ).toLocaleString()}
        </p>
      </div>
    )
  )}
  
      </div>
    </div>
  );
}