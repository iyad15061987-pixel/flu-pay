"use client";

import socket from "@/lib/socket";

import {
  useEffect,
  useState,
} from "react";

import Sidebar from "../components/Sidebar";

import BalanceChart from "../components/BalanceChart";

import MerchantAnalytics
  from "../components/MerchantAnalytics";

import API_URL from "@/lib/api";

interface Transaction {
  _id: string;

  fromEmail: string;

  toEmail: string;

  amount: number;

  fee: number;

  netAmount: number;

  type: string;

  createdAt: string;
}

interface Invoice {
  _id: string;

  customerEmail: string;

  amount: number;

  currency: string;

  description: string;

  paymentLink: string;

  status: string;

  createdAt: string;
}

interface Withdrawal {
  _id: string;

  amount: number;

  fee: number;

  netAmount: number;

  method: string;

  destination: string;

  status: string;

  riskLevel: string;

  createdAt: string;
}

export default function DashboardPage() {

  const [mounted, setMounted] =
    useState(false);

  const [theme, setTheme] =
    useState("dark");

  const [email, setEmail] =
    useState("");
const [balance, setBalance] =
  useState(0);

  // =========================
  // TRANSFER
  // =========================

  const [
    receiverEmail,
    setReceiverEmail,
  ] = useState("");

  const [amount, setAmount] =
    useState("");

  // =========================
  // DEPOSIT
  // =========================

  const [
    depositAmount,
    setDepositAmount,
  ] = useState("");

  const [
    depositMethod,
    setDepositMethod,
  ] = useState("paypal");

  const [
    deposits,
    setDeposits,
  ] = useState<any[]>([]);

  // =========================
  // WITHDRAWAL
  // =========================

  const [
    withdrawalAmount,
    setWithdrawalAmount,
  ] = useState("");

  const [
    withdrawalMethod,
    setWithdrawalMethod,
  ] = useState("paypal");

  const [
    withdrawalDestination,
    setWithdrawalDestination,
  ] = useState("");

  const [
    withdrawals,
    setWithdrawals,
  ] = useState<
    Withdrawal[]
  >([]);

  // =========================
  // INVOICES
  // =========================

  const [
    invoiceAmount,
    setInvoiceAmount,
  ] = useState("");

  const [
    customerEmail,
    setCustomerEmail,
  ] = useState("");

  const [
    invoiceDescription,
    setInvoiceDescription,
  ] = useState("");

  // =========================
  // DATA
  // =========================

  const [
    transactions,
    setTransactions,
  ] = useState<Transaction[]>(
    []
  );

  const [analytics, setAnalytics] =
    useState<any>(null);

  const [
    merchantAnalytics,
    setMerchantAnalytics,
  ] = useState<any>(
    null
  );

  const [invoices, setInvoices] =
    useState<Invoice[]>([]);

  // =========================
  // 2FA
  // =========================

  const [
    twoFactorEnabled,
    setTwoFactorEnabled,
  ] = useState(false);
// =========================
// LOAD USER
// =========================

const loadUser =
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

      if (
        !token ||
        !email
      ) {

        window.location.href =
          "/login";

        return;

      }

      const res =
        await fetch(
          `${API_URL}/profile`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await res.json();

      setBalance(
        Number(
          data.balance || 0
        )
      );

      setTwoFactorEnabled(
        data.twoFactorEnabled ||
        false
      );

    } catch (err) {

      console.log(err);

    }

  };

  // =========================
  // LOAD TRANSACTIONS
  // =========================

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

        setTransactions(data);

      } catch (err) {

        console.log(err);

      }

    };

  // =========================
  // LOAD ANALYTICS
  // =========================

  const loadAnalytics =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );
const res =
  await fetch(
    `${API_URL}/profile`,
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );

        const data =
          await res.json();

        setAnalytics(data);

      } catch (err) {

        console.log(err);

      }

    };

  // =========================
  // LOAD MERCHANT ANALYTICS
  // =========================

  const loadMerchantAnalytics =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const res =
  await fetch(
    `${API_URL}/profile`,
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );

        const data =
          await res.json();

        setMerchantAnalytics(
          data
        );

      } catch (err) {

        console.log(err);

      }

    };

  // =========================
  // LOAD DEPOSITS
  // =========================

  const loadDeposits =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/deposits`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        setDeposits(
          data
        );

      } catch (err) {

        console.log(err);

      }

    };

  // =========================
  // LOAD WITHDRAWALS
  // =========================

  const loadWithdrawals =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/withdrawals`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        setWithdrawals(
          data
        );

      } catch (err) {

        console.log(err);

      }

    };

  // =========================
  // LOAD INVOICES
  // =========================

  const loadInvoices =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/merchant/invoices`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        setInvoices(data);

      } catch (err) {

        console.log(err);

      }

    };

  // =========================
  // CREATE DEPOSIT
  // =========================

  const createDeposit =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/deposits`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                amount:
                  depositAmount,

                method:
                  depositMethod,

                reference:
                  "Wallet Funding",
              }),
            }
          );

        const data =
          await res.json();

        alert(
          data.message
        );

        setDepositAmount("");

        loadUser();

        loadDeposits();

        loadAnalytics();

      } catch (err) {

        console.log(err);

      }

    };

  // =========================
  // CREATE WITHDRAWAL
  // =========================

  const createWithdrawal =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/withdrawals`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                amount:
                  withdrawalAmount,

                method:
                  withdrawalMethod,

                destination:
                  withdrawalDestination,
              }),
            }
          );

        const data =
          await res.json();

        alert(
          data.message
        );

        setWithdrawalAmount("");

        setWithdrawalDestination(
          ""
        );

        loadUser();

        loadWithdrawals();

      } catch (err) {

        console.log(err);

        alert(
          "Withdrawal failed"
        );

      }

    };

  // =========================
  // EFFECT
  // =========================

  useEffect(() => {

    setMounted(true);

    const savedTheme =
      localStorage.getItem(
        "theme"
      );

    if (savedTheme) {
      setTheme(savedTheme);
    }

    socket.on(
      "wallet_update",
      () => {

        loadUser();

        loadTransactions();

        loadAnalytics();

      }
    );

    socket.on(
      "deposit_created",
      () => {

        loadDeposits();

        loadUser();

      }
    );

    socket.on(
      "withdrawal_created",
      () => {

        loadWithdrawals();

        loadUser();

      }
    );

    const savedEmail =
      localStorage.getItem(
        "email"
      );

    const savedToken =
      localStorage.getItem(
        "token"
      );

    if (
      !savedEmail ||
      !savedToken
    ) {

      window.location.href =
        "/login";

      return;

    }

    setEmail(savedEmail);

    loadUser();

    loadTransactions();

    loadAnalytics();

    loadDeposits();

    loadWithdrawals();

    loadInvoices();

    loadMerchantAnalytics();

    return () => {

      socket.off(
        "wallet_update"
      );

      socket.off(
        "deposit_created"
      );

      socket.off(
        "withdrawal_created"
      );

    };

  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        background:
          theme === "light"
            ? "#f3f4f6"
            : "#0f172a",
        minHeight: "100vh",
      }}
    >

      <Sidebar />

      <div
        style={{
          marginLeft: 250,
          padding: 40,
          width: "100%",
          color:
            theme === "light"
              ? "#111827"
              : "white",
          marginTop: 70,
        }}
      >

        {/* HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            marginBottom: 20,
          }}
        >

          <div>

            <h1>
              🚀 Merchant Dashboard
            </h1>

            <br />

            <p>
              Logged in as:
              {" "}
              <strong>
                {email}
              </strong>
            </p>

          </div>

          <button
            onClick={() => {

              localStorage.clear();

              window.location.href =
                "/login";

            }}

            style={{
              padding:
                "10px 20px",
              background:
                "#dc2626",
              color:
                "white",
              border:
                "none",
              borderRadius:
                10,
              cursor:
                "pointer",
              fontWeight:
                "bold",
            }}
          >
            Logout
          </button>

        </div>

        {/* 2FA */}

        <div
          style={{
            background:
              "#111827",
            padding: 25,
            borderRadius: 20,
            marginBottom: 30,
          }}
        >

          <h2>
            🔐 Security
          </h2>

          <br />

          <p>
            Two-Factor Authentication:
            {" "}

            <strong
              style={{
                color:
                  twoFactorEnabled
                    ? "#16a34a"
                    : "#dc2626",
              }}
            >

              {twoFactorEnabled
                ? "Enabled"
                : "Disabled"}

            </strong>
          </p>

        </div>

        {/* ADD FUNDS */}

        <div
          style={{
            background:
              "#111827",
            padding: 25,
            borderRadius: 20,
            marginBottom: 30,
          }}
        >

          <h2>
            💳 Add Funds
          </h2>

          <br />

          <input
            type="number"
            placeholder="Deposit Amount"
            value={
              depositAmount
            }
            onChange={(e) =>
              setDepositAmount(
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: 15,
              borderRadius: 12,
              border: "none",
              marginBottom: 15,
            }}
          />

          <select
            value={
              depositMethod
            }
            onChange={(e) =>
              setDepositMethod(
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: 15,
              borderRadius: 12,
              border: "none",
              marginBottom: 15,
            }}
          >

            <option value="paypal">
              PayPal
            </option>

            <option value="bank">
              Bank Transfer
            </option>

            <option value="crypto">
              Crypto
            </option>

          </select>

          <button
            onClick={
              createDeposit
            }
            style={{
              width: "100%",
              padding: 15,
              background:
                "#16a34a",
              color:
                "white",
              border:
                "none",
              borderRadius:
                12,
              cursor:
                "pointer",
              fontWeight:
                "bold",
            }}
          >
            Add Funds
          </button>

        </div>

        {/* WITHDRAW FUNDS */}

        <div
          style={{
            background:
              "#111827",
            padding: 25,
            borderRadius: 20,
            marginBottom: 30,
          }}
        >

          <h2>
            💸 Withdraw Funds
          </h2>

          <br />

          <input
            type="number"
            placeholder="Withdrawal Amount"
            value={
              withdrawalAmount
            }
            onChange={(e) =>
              setWithdrawalAmount(
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: 15,
              borderRadius: 12,
              border: "none",
              marginBottom: 15,
            }}
          />

          <select
            value={
              withdrawalMethod
            }
            onChange={(e) =>
              setWithdrawalMethod(
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: 15,
              borderRadius: 12,
              border: "none",
              marginBottom: 15,
            }}
          >

            <option value="paypal">
              PayPal
            </option>

            <option value="bank">
              Bank Transfer
            </option>

            <option value="crypto">
              Crypto
            </option>

          </select>

          <input
            type="text"
            placeholder="Destination Address / Email"
            value={
              withdrawalDestination
            }
            onChange={(e) =>
              setWithdrawalDestination(
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: 15,
              borderRadius: 12,
              border: "none",
              marginBottom: 15,
            }}
          />

          <button
            onClick={
              createWithdrawal
            }
            style={{
              width: "100%",
              padding: 15,
              background:
                "#2563eb",
              color:
                "white",
              border:
                "none",
              borderRadius:
                12,
              cursor:
                "pointer",
              fontWeight:
                "bold",
            }}
          >
            Withdraw Funds
          </button>

        </div>

        {/* WALLET */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(250px,1fr))",
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
            }}
          >

            <h2>
              Wallet Balance
            </h2>

            <br />
<h1>
  ${Number(balance).toFixed(2)}
</h1>

          </div>

        </div>

        {/* DEPOSIT HISTORY */}

        <div
          style={{
            background:
              "#111827",
            padding: 25,
            borderRadius: 20,
            marginBottom: 30,
          }}
        >

          <h2>
            💰 Deposit History
          </h2>

          <br />

          {deposits.map(
            (
              deposit: any,
              index: number
            ) => (

              <div
                key={index}
                style={{
                  background:
                    "#1f2937",
                  padding: 20,
                  borderRadius: 15,
                  marginBottom: 15,
                }}
              >

                <p>
                  <strong>
                    Amount:
                  </strong>{" "}
                  ${deposit.amount}
                </p>

                <br />

                <p>
                  <strong>
                    Method:
                  </strong>{" "}
                  {deposit.method}
                </p>

                <br />

                <p>
                  <strong>
                    Date:
                  </strong>{" "}
                  {new Date(
                    deposit.createdAt
                  ).toLocaleString()}
                </p>

              </div>

            )
          )}

        </div>

        {/* WITHDRAWAL HISTORY */}

        <div
          style={{
            background:
              "#111827",
            padding: 25,
            borderRadius: 20,
            marginBottom: 30,
          }}
        >

          <h2>
            🏦 Withdrawal History
          </h2>

          <br />

          {withdrawals.map(
            (
              withdrawal,
              index
            ) => (

              <div
                key={index}
                style={{
                  background:
                    "#1f2937",
                  padding: 20,
                  borderRadius: 15,
                  marginBottom: 15,
                }}
              >

                <p>
                  <strong>
                    Amount:
                  </strong>{" "}
                  ${withdrawal.amount}
                </p>

                <br />

                <p>
                  <strong>
                    Method:
                  </strong>{" "}
                  {withdrawal.method}
                </p>

                <br />

                <p>
                  <strong>
                    Destination:
                  </strong>{" "}
                  {withdrawal.destination}
                </p>

                <br />

                <p>
                  <strong>
                    Status:
                  </strong>{" "}

                  <span
                    style={{
                      color:
                        withdrawal.status ===
                        "approved"
                          ? "#16a34a"
                          : withdrawal.status ===
                            "rejected"
                          ? "#dc2626"
                          : "#facc15",

                      fontWeight:
                        "bold",
                    }}
                  >
                    {withdrawal.status}
                  </span>

                </p>

                <br />

                <p>
                  <strong>
                    Risk:
                  </strong>{" "}

                  <span
                    style={{
                      color:
                        withdrawal.riskLevel ===
                        "high"
                          ? "#dc2626"
                          : "#16a34a",

                      fontWeight:
                        "bold",
                    }}
                  >
                    {withdrawal.riskLevel}
                  </span>

                </p>

                <br />

                <p>
                  <strong>
                    Date:
                  </strong>{" "}
                  {new Date(
                    withdrawal.createdAt
                  ).toLocaleString()}
                </p>

              </div>

            )
          )}

        </div>

        <MerchantAnalytics
          analytics={
            merchantAnalytics
          }
        />

        <BalanceChart
          balance={balance}
        />

      </div>

    </div>
  );
}