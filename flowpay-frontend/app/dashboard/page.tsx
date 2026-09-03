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

import { QRCodeCanvas } from "qrcode.react";

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
        cryptoCurrency,
        setCryptoCurrency,
      ] = useState("usdttrc20");

  const [
    deposits,
    setDeposits,
  ] = useState<any[]>([]);

  const [
    cryptoPayment,
    setCryptoPayment,
  ] = useState<{
    address: string;
    amount: number;
    currency: string;
        paymentId: string;
      } | null>(null);

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
        bankName,
        setBankName,
      ] = useState("");

      const [
        accountHolder,
        setAccountHolder,
      ] = useState("");

      const [
        iban,
        setIban,
      ] = useState("");

      const [
        swiftCode,
        setSwiftCode,
      ] = useState("");

          const [
            bankCountry,
            setBankCountry,
          ] = useState("");

          const [
            bankTransferType,
            setBankTransferType,
          ] = useState("");

          const [
            accountNumber,
            setAccountNumber,
          ] = useState("");

          const [
            routingNumber,
            setRoutingNumber,
          ] = useState("");

          const [
            sortCode,
            setSortCode,
          ] = useState("");

      const [
        withdrawalCryptoCurrency,
        setWithdrawalCryptoCurrency,
      ] = useState("usdttrc20");

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

setTransactions(
  Array.isArray(data)
    ? data
    : []
);

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
    `${API_URL}/analytics`,
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

if (res.status === 401) {

  localStorage.clear();

  window.location.href =
    "/login";

  return;

}

setDeposits(
  Array.isArray(data)
    ? data
    : []
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

if (res.status === 401) {

  localStorage.clear();

  window.location.href =
    "/login";

  return;

}

setWithdrawals(
  Array.isArray(data)
    ? data
    : []
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

if (res.status === 401) {

  localStorage.clear();

  window.location.href =
    "/login";

  return;

}

setInvoices(
  Array.isArray(data)
    ? data
    : []
);

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

        if (!token) {

          alert(
            "Please login again."
          );

          window.location.href =
            "/login";

          return;
        }

        const numericAmount =
          Number(
            depositAmount
          );

        if (
          !Number.isFinite(
            numericAmount
          ) ||
          numericAmount <= 0
        ) {

          alert(
            "Please enter a valid deposit amount."
          );

          return;
        }

        // =========================
        // PAYPAL
        // =========================

        if (
          depositMethod
            .toLowerCase() ===
          "paypal"
        ) {

          const res =
            await fetch(
              `${API_URL}/paypal/create-order`,
              {
                method:
                  "POST",

                headers: {
                  "Content-Type":
                    "application/json",

                  Authorization:
                    `Bearer ${token}`,
                },

                body:
                  JSON.stringify({
                    amount:
                      numericAmount,
                  }),
              }
            );

          const data =
            await res.json();

          if (!res.ok) {

            alert(
              data.message ||
              "PayPal error"
            );

            return;
          }

          if (
            data.approveUrl
          ) {

            window.location.href =
              data.approveUrl;

            return;
          }

          alert(
            "PayPal approval URL was not returned."
          );

          return;
        }
// =========================
// BANK / CARD - STRIPE
// =========================

if (depositMethod.toLowerCase() === "bank") {
  const stripeRes =
    await fetch(
      `${API_URL}/stripe/create-checkout`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body:
          JSON.stringify({
            amount:
              numericAmount,
          }),
      }
    );

  const stripeData =
    await stripeRes.json();

  if (!stripeRes.ok) {
    alert(
      stripeData.message ||
      "Stripe checkout failed"
    );

    return;
  }

  if (stripeData.url) {
    window.location.href =
      stripeData.url;

    return;
  }

  alert(
    "Stripe checkout URL not found"
  );

  return;
}

// =========================
 // =========================
// CRYPTO - NOWPAYMENTS
// =========================

const cryptoRes =
  await fetch(
    `${API_URL}/crypto/create-payment`,
    {
      method:
        "POST",

      headers: {
        "Content-Type":
          "application/json",

        Authorization:
          `Bearer ${token}`,
      },

      body:
        JSON.stringify({
          amount:
            numericAmount,

          payCurrency: cryptoCurrency,
        }),
    }
  );

const cryptoData =
  await cryptoRes.json();

if (!cryptoRes.ok) {

  alert(
    cryptoData.message ||
    "Crypto payment failed"
  );

  return;
}

setCryptoPayment({

  address:
    cryptoData.payment.pay_address,

  amount:
    cryptoData.payment.pay_amount,

  currency:
    cryptoData.payment.pay_currency,

  paymentId:
    cryptoData.payment.payment_id,

});

setDepositAmount("");
      } catch (err) {

        console.error(
          "Deposit error:",
          err
        );

        alert(
          "Connection error"
        );

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

                    payoutCurrency:
                      withdrawalCryptoCurrency,

                    bankCountry:
                      bankCountry,

                    bankTransferType:
                      bankTransferType,

                    bankName:
                      bankName,

                    accountHolder:
                      accountHolder,

                    iban:
                      iban,

                    swiftCode:
                      swiftCode,

                    accountNumber:
                      accountNumber,

                    routingNumber:
                      routingNumber,

                    sortCode:
                      sortCode,
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

  const createTransfer =
  async () => {

    try {

      const token =
        localStorage.getItem(
          "token"
        );

      const res =
        await fetch(
          `${API_URL}/transfer`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              toEmail:
                receiverEmail,

              amount,
            }),
          }
        );

      const data =
        await res.json();

      alert(
        data.message
      );

      if (
        data.success
      ) {

        setReceiverEmail("");

        setAmount("");

        loadUser();

        loadTransactions();

      }

    } catch (err) {

      console.log(err);

      alert(
        "Transfer failed"
      );

    }

  };
  
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

  
  const copyCryptoAddress = async () => {

    if (!cryptoPayment?.address)
      return;

    await navigator.clipboard.writeText(
      cryptoPayment.address
    );

    alert("Wallet address copied");
  };
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


  const copyCryptoAddress = async () => {

    if (!cryptoPayment?.address)
      return;

    await navigator.clipboard.writeText(
      cryptoPayment.address
    );

    alert("Wallet address copied");
  };
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
<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 30,
    flexWrap: "wrap",
  }}
>
  <div>

    <h1>
      ًMerchant Dashboard
    </h1>

    <br />

    <p>
      Logged in as:{" "}
      <strong>
        {email}
      </strong>
    </p>
  </div>

  <div
    style={{
      background:
        "rgba(16,185,129,0.12)",
      border:
        "1px solid #10b981",
      borderRadius: 20,
      padding: "18px 28px",
      minWidth: 260,
      boxShadow:
        "0 0 20px rgba(16,185,129,0.25)",
    }}
  >
    <div
      style={{
        color: "#9ca3af",
        fontSize: 14,
        marginBottom: 8,
      }}
    >
Available Balance
    </div>

    <div
      style={{
        color: "#10b981",
        fontSize: 32,
        fontWeight: "bold",
      }}
    >
      $
      {Number(
  balance || 0
).toLocaleString(
  undefined,
  {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }
)}
    </div>
  </div>
</div>

<button
  onClick={() => {
    localStorage.clear();
    window.location.href =
      "/login";
  }}
  style={{
    padding: "10px 20px",
    background: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: "bold",
  }}
>
  Logout
</button>

        </div>

        {cryptoPayment && (

          <div
            style={{
              background:
                "linear-gradient(135deg,#111827,#1f2937)",
              padding: 30,
              borderRadius: 24,
              marginBottom: 30,
              boxShadow:
                "0 10px 30px rgba(0,0,0,0.25)",
            }}
          >

            <h2
              style={{
                marginBottom: 20,
                fontSize: 26,
              }}
            >
              Crypto Payment
            </h2>


            <div
              style={{
                textAlign: "center",
                marginBottom: 20,
              }}
            >

              <QRCodeCanvas
                value={cryptoPayment.address}
                size={200}
              />

            </div>


            <div
              style={{
                background: "#0f172a",
                padding: 15,
                borderRadius: 12,
                marginBottom: 15,
              }}
            >

              <p>
                Currency:
                {" "}
                <strong>
                  {cryptoPayment.currency}
                </strong>
              </p>

              <p>
                Amount:
                {" "}
                <strong>
                  {cryptoPayment.amount}
                </strong>
              </p>

              <p>
                Payment ID:
                {" "}
                <strong>
                  {cryptoPayment.paymentId}
                </strong>
              </p>

            </div>


            <p>
              Wallet Address:
            </p>


            <textarea
              readOnly
              value={cryptoPayment.address}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 12,
                height: 100,
                background: "#020617",
                color: "white",
                border: "1px solid #374151",
              }}
            />


            <button
              onClick={copyCryptoAddress}
              style={{
                marginTop: 15,
                width: "100%",
                padding: 14,
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: 12,
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Copy Wallet Address
            </button>


          </div>

        )}        {/* 2FA */}

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
            Security
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
            Add Funds
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
              Bank / Card
            </option>

            <option value="crypto">
              Crypto
            </option>

          </select>


          {depositMethod === "crypto" && (

            <select
              value={cryptoCurrency}
              onChange={(e) =>
                setCryptoCurrency(e.target.value)
              }
              style={{
                width: "100%",
                padding: 15,
                borderRadius: 12,
                border: "none",
                marginBottom: 15,
              }}
            >

              <option value="usdttrc20">
                USDT TRC20
              </option>

              <option value="USDT ERC20">
                USDT ERC20
              </option>

              <option value="btc">
                Bitcoin
              </option>

              <option value="eth">
                Ethereum
              </option>

              <option value="usdc">
                USDC
              </option>

            </select>

          )}

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
            Withdraw Funds
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

              {withdrawalMethod === "crypto" && (

                <select
                  value={withdrawalCryptoCurrency}
                  onChange={(e) =>
                    setWithdrawalCryptoCurrency(e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: 15,
                    borderRadius: 12,
                    border: "none",
                    marginBottom: 15,
                  }}
                >

                  <option value="USDT TRC20">
                    USDT TRC20
                  </option>

                  <option value="USDT ERC20">
                    USDT ERC20
                  </option>

                  <option value="BTC">
                    Bitcoin
                  </option>

                  <option value="ETH">
                    Ethereum
                  </option>

                  <option value="USDC">
                    USDC
                  </option>

                </select>

              )}

              {withdrawalMethod === "bank" ? (

                <>

                  <select
                    value={bankCountry}
                    onChange={(e) => setBankCountry(e.target.value)}
                    style={{
                      width: "100%",
                      padding: 15,
                      borderRadius: 12,
                      border: "none",
                      marginBottom: 15,
                    }}
                  >
                        <option value="">Select Bank Country</option>

                        <option value="EU">European Union</option>
                        <option value="USA">United States</option>
                        <option value="UK">United Kingdom</option>
                        <option value="SA">Saudi Arabia</option>
                        <option value="AE">United Arab Emirates</option>
                        <option value="PS">Palestine</option>
                        <option value="EG">Egypt</option>
                        <option value="JO">Jordan</option>
                        <option value="MA">Morocco</option>
                        <option value="TN">Tunisia</option>
                        <option value="DZ">Algeria</option>
                        <option value="LB">Lebanon</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Account Holder Name"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    style={{
                      width: "100%",
                      padding: 15,
                      borderRadius: 12,
                      border: "none",
                      marginBottom: 15,
                    }}
                  />

                  {[
  "USA",
  "UK",
  "PS",
  "EG",
  "LB",
  "MA",
  "TN",
  "DZ"
].includes(bankCountry) && (
                    <input
                      type="text"
                      placeholder="Bank Name"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      style={{
                        width: "100%",
                        padding: 15,
                        borderRadius: 12,
                        border: "none",
                        marginBottom: 15,
                      }}
                    />
                  )}

                  {[
  "EU",
  "SA",
  "AE",
  "PS",
  "EG",
  "JO",
  "MA",
  "TN",
  "DZ",
  "LB"
].includes(bankCountry) && (
                    <>
                      <input
                        type="text"
                        placeholder="IBAN"
                        value={iban}
                        onChange={(e) => setIban(e.target.value)}
                        style={{
                          width: "100%",
                          padding: 15,
                          borderRadius: 12,
                          border: "none",
                          marginBottom: 15,
                        }}
                      />

                      <input
                        type="text"
                        placeholder="SWIFT / BIC Code"
                        value={swiftCode}
                        onChange={(e) => setSwiftCode(e.target.value)}
                        style={{
                          width: "100%",
                          padding: 15,
                          borderRadius: 12,
                          border: "none",
                          marginBottom: 15,
                        }}
                      />
                    </>
                  )}

                  {bankCountry === "USA" && (
                    <>
                      <input
                        type="text"
                        placeholder="Account Number"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        style={{
                          width: "100%",
                          padding: 15,
                          borderRadius: 12,
                          border: "none",
                          marginBottom: 15,
                        }}
                      />

                      <input
                        type="text"
                        placeholder="Routing Number"
                        value={routingNumber}
                        onChange={(e) => setRoutingNumber(e.target.value)}
                        style={{
                          width: "100%",
                          padding: 15,
                          borderRadius: 12,
                          border: "none",
                          marginBottom: 15,
                        }}
                      />
                    </>
                  )}

                  {bankCountry === "UK" && (
                    <>
                      <input
                        type="text"
                        placeholder="Account Number"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        style={{
                          width: "100%",
                          padding: 15,
                          borderRadius: 12,
                          border: "none",
                          marginBottom: 15,
                        }}
                      />

                      <input
                        type="text"
                        placeholder="Sort Code"
                        value={sortCode}
                        onChange={(e) => setSortCode(e.target.value)}
                        style={{
                          width: "100%",
                          padding: 15,
                          borderRadius: 12,
                          border: "none",
                          marginBottom: 15,
                        }}
                      />
                    </>
                  )}

                </>

              ) : (


                <input
                  type="text"
                  placeholder={
                    withdrawalMethod === "paypal"
                      ? "PayPal Email"
                      : "Crypto Wallet Address"
                  }
                  value={withdrawalDestination}
                  onChange={(e) => setWithdrawalDestination(e.target.value)}
                  style={{
                    width: "100%",
                    padding: 15,
                    borderRadius: 12,
                    border: "none",
                    marginBottom: 15,
                  }}
                />

              )}

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

{/* TRANSFER FUNDS */}

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
    Send Money
  </h2>

  <br />

  <input
    type="email"
    placeholder="Receiver Email"
    value={receiverEmail}
    onChange={(e) =>
      setReceiverEmail(
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

  <input
    type="number"
    placeholder="Amount"
    value={amount}
    onChange={(e) =>
      setAmount(
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
      createTransfer
    }
    style={{
      width: "100%",
      padding: 15,
      background:
        "#7c3aed",
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
    Send Money
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
      $
      {Number(
        balance
      ).toFixed(2)}
    </h1>
  </div>

  <div
    style={{
      background:
        "#111827",
      padding: 25,
      borderRadius: 20,
    }}
  >
    <h2>
      Payment Links
    </h2>

    <br />

    <h1>
      {
        analytics?.totalPaymentLinks || 0
      }
    </h1>
  </div>

  <div
    style={{
      background:
        "#111827",
      padding: 25,
      borderRadius: 20,
    }}
  >
    <h2>
      Payment Revenue
    </h2>

    <br />

    <h1>
      $
      {Number(
        analytics?.paymentRevenue || 0
      ).toFixed(2)}
    </h1>
  </div>

  <div
    style={{
      background:
        "#111827",
      padding: 25,
      borderRadius: 20,
    }}
  >
    <h2>
      Transactions
    </h2>

    <br />

    <h1>
      {(analytics?.sentCount || 0) +
        (analytics?.receivedCount || 0)}
    </h1>
  </div>

  <div
    style={{
      background:
        "#111827",
      padding: 25,
      borderRadius: 20,
    }}
  >
    <h2>
      Revenue
    </h2>

    <br />

    <h1>
      $
      {Number(
        analytics?.totalReceived || 0
      ).toFixed(2)}
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
            Deposit History
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

{/* TRANSACTION HISTORY */}

<div
  style={{
    background: "#111827",
    padding: 25,
    borderRadius: 20,
    marginBottom: 30,
  }}
>
  <h2>
    Transaction History
  </h2>

  <br />

  {transactions.map(
    (
      tx: any,
      index: number
    ) => (

      <div
        key={index}
        style={{
          background: "#1f2937",
          padding: 20,
          borderRadius: 15,
          marginBottom: 15,
        }}
      >

        <p>
          <strong>
            Type:
          </strong>{" "}
          {tx.type}
        </p>

        <br />

    <p>
  <strong>
    Amount:
  </strong>{" "}
  $
  {Number(
    tx.amount || 0
  ).toFixed(2)}
</p>

<br />

<p>
  <strong>
    Fee:
  </strong>{" "}
  $
  {Number(
    tx.fee || 0
  ).toFixed(2)}
</p>

        <br />

        <p>
          <strong>
            From:
          </strong>{" "}
          {tx.fromEmail}
        </p>

        <br />

        <p>
          <strong>
            To:
          </strong>{" "}
          {tx.toEmail}
        </p>

        <br />

        <p>
          <strong>
            Date:
          </strong>{" "}
          {new Date(
            tx.createdAt
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
            Withdrawal History
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









































