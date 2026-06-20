"use client";

import {
  useEffect,
  useState,
} from "react";

import Sidebar from "../components/Sidebar";

import API_URL from "@/lib/api";

import { QRCodeCanvas } from "qrcode.react";

export default function DepositPage() {

  const [mounted, setMounted] =
    useState(false);

  const [theme, setTheme] =
    useState("dark");

  const [amount, setAmount] =
    useState("");

  const [method, setMethod] =
    useState("PayPal");

    const [cryptoPayment, setCryptoPayment] =
  useState<{
    address: string;
    amount: number;
    currency: string;
    paymentId: string;
  } | null>(null);

  useEffect(() => {

    setMounted(true);

    const savedTheme =
      localStorage.getItem(
        "theme"
      );

    if (savedTheme) {
      setTheme(savedTheme);
    }

  }, []);

  if (!mounted) {
    return null;
  }

  const fee =
    Number(amount || 0) *
    0.035;

  const netAmount =
    Number(amount || 0) -
    fee;
const createRequest =
  async () => {

    try {

      const token =
        localStorage.getItem(
          "token"
        );

        // =========================
// MINIMUM CRYPTO AMOUNT
// =========================

        if (
  method === "Crypto" &&
  Number(amount) < 50
) {

  alert(
    "Minimum crypto deposit is $50"
  );

  return;
}

// =========================
// CRYPTO PAYMENT
// =========================

if (
  method === "Crypto"
) {

  const res =
    await fetch(
      `${API_URL}/crypto/create-payment`,
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
            Number(amount),

          payCurrency:
            "usdttrc20",
        }),
      }
    );

  const data =
    await res.json();

    console.log(
  "STATUS:",
  res.status
);

console.log(
  "RESPONSE:",
  data
);

console.log(
  "STATUS:",
  res.status
);

console.log(
  "RESPONSE:",
  data
);

  console.log(data);

if (!res.ok) {

  alert(
    data.message
  );

    return;
  }

 if (
  data.payment?.pay_address
) {

  setCryptoPayment({
    address:
      data.payment.pay_address,

    amount:
      data.payment.pay_amount,

    currency:
      data.payment.pay_currency,

    paymentId:
      data.payment.payment_id,
  });

  return;
}

alert(
  "Payment address not found"
);

  return;
}

      // =========================
      // PAYPAL
      // =========================

      const res =
        await fetch(
          `${API_URL}/paypal/create-order`,
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
                Number(amount),
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
        "Approve URL not found"
      );

    } catch (err) {

      console.log(err);

      alert(
        "Connection error"
      );

    }

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
        }}
      >

  {
  cryptoPayment && (

    <div
      style={{
        marginTop: 20,
        padding: 20,
        borderRadius: 12,
        background: "#111827",
        color: "white",
      }}
    >

      <h3>
  Crypto Payment
</h3>

<p>
  Amount:
  {" "}
  {cryptoPayment.amount}
  {" "}
  {cryptoPayment.currency}
</p>

<div
  style={{
    background: "white",
    padding: 15,
    display: "inline-block",
    borderRadius: 10,
    marginBottom: 20,
  }}
>
  <QRCodeCanvas
    value={cryptoPayment.address}
    size={220}
  />
</div>

<p>
  Address:
</p>

<textarea
  readOnly
  value={cryptoPayment.address}
  style={{
    width: "100%",
    minHeight: 80,
  }}
/>

<br />
<br />

<button
  onClick={() => {

    navigator.clipboard.writeText(
      cryptoPayment.address
    );

    alert(
      "Address copied"
    );

  }}
>
  Copy Address
</button>

</div>

)
}

<h1>
  🏦 Deposit Request
</h1>
        <br />

        <div
          style={{
            background:
              theme === "light"
                ? "white"
                : "#111827",

            padding: 30,

            borderRadius: 20,

            maxWidth: 900,

            boxShadow:
              "0 0 10px rgba(0,0,0,0.1)",
          }}
        >
<select
  value={method}
  onChange={(e) =>
    setMethod(
      e.target.value
    )
  }
  style={{
    width: "100%",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  }}
>

  <option>
    PayPal
  </option>

  <option>
    Crypto
  </option>

</select>

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
    borderRadius: 10,
    border: "none",
    marginBottom: 15,
  }}
/>

<div
  style={{
    background:
      theme === "light"
        ? "#e5e7eb"
        : "#1f2937",

    padding: 20,

    borderRadius: 15,

    marginBottom: 20,
  }}
>

  <p>
    💵 Deposit:
    <strong>
      {" "}
      $
      {Number(
        amount || 0
      ).toFixed(2)}
    </strong>
  </p>

  <br />

  <p>
    🧾 Fee 3.5%:
    <strong>
      {" "}
      $
      {fee.toFixed(2)}
    </strong>
  </p>

  <br />

  <p>
    ✅ Balance Added:
    <strong>
      {" "}
      $
      {netAmount.toFixed(
        2
      )}
    </strong>
  </p>

</div>

<button
  onClick={
    createRequest
  }
  style={{
    width: "100%",
    padding: 15,
    background:
      "#16a34a",
    color: "white",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
  }}
>
  Create Deposit Request
</button>

<br />
<br />

<div
  style={{
    background:
      theme === "light"
        ? "#e5e7eb"
        : "#1f2937",

    padding: 20,

    borderRadius: 15,
  }}
>

  <h3>
    📌 Important
  </h3>

  <br />

  <p>
    Select PayPal or Crypto,
    enter the amount,
    then click Create Deposit Request.
  </p>

  <br />

  <p>
    External deposits fee:
    <strong>
      {" "}
      3.5%
    </strong>
  </p>

</div>

</div>

</div>

</div>

);

}