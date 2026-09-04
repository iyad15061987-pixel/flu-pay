"use client";

import {
  useEffect,
  useState,
} from "react";

import Sidebar from "../components/Sidebar";

import API_URL from "@/lib/api";

export default function WithdrawPage() {
  const [mounted, setMounted] =
    useState(false);

  const [theme, setTheme] =
    useState("dark");

  const [amount, setAmount] =
    useState("");

  const [method, setMethod] =
  useState("paypal");

  const [wallet, setWallet] =
    useState("");
  const [cryptoCurrency, setCryptoCurrency] =
    useState("USDT TRC20");

        const [bankCountry, setBankCountry] =
          useState("");

        const [bankName, setBankName] =
          useState("");

        const [accountHolder, setAccountHolder] =
          useState("");

        const [iban, setIban] =
          useState("");

        const [swiftCode, setSwiftCode] =
          useState("");

        const [accountNumber, setAccountNumber] =
          useState("");

        const [routingNumber, setRoutingNumber] =
          useState("");

        const [sortCode, setSortCode] =
          useState("");

        const [bankTransferType, setBankTransferType] =
          useState("");


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

  const numericAmount =
    Number(amount || 0);

  const fee =
    method === "crypto"
      ? Math.max(1.00, numericAmount * 0.01)
      : numericAmount * 0.035;

  const netAmount =
    numericAmount -
    fee;

  const createWithdraw =
    async () => {
      try {

        if (
          !Number.isFinite(numericAmount) ||
          numericAmount < 1
        ) {
          alert("Minimum withdrawal amount is $1");
          return;
        }

        const token =
          localStorage.getItem(
            "token"
          );

        const userId =
          localStorage.getItem(
            "userId"
          );

        const email =
          localStorage.getItem(
            "email"
          );

          if (method === "crypto") {
  const cryptoRes = await fetch(
    `${API_URL}/crypto-withdraw`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        amount,
        walletAddress: wallet,
        coin: cryptoCurrency,
      }),
    }
  );

  const cryptoData =
    await cryptoRes.json();

  alert(
    cryptoData.message ||
    "Crypto withdrawal request failed"
  );

  if (cryptoRes.ok) {
    setAmount("");
    setWallet("");
  }

  return;
}

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
                  amount,

                  method,

                  destination: wallet,

                  payoutCurrency:
                    method === "crypto"
                      ? cryptoCurrency
                      : null,

                  bankCountry:
                    method === "bank"
                      ? bankCountry
                      : null,

                  bankTransferType:
                    method === "bank"
                      ? bankTransferType
                      : null,

                  bankName:
                    method === "bank"
                      ? bankName
                      : null,

                  accountHolder:
                    method === "bank"
                      ? accountHolder
                      : null,

                  iban:
                    method === "bank"
                      ? iban
                      : null,

                  swiftCode:
                    method === "bank"
                      ? swiftCode
                      : null,

                  accountNumber:
                    method === "bank"
                      ? accountNumber
                      : null,

                  routingNumber:
                    method === "bank"
                      ? routingNumber
                      : null,

                  sortCode:
                    method === "bank"
                      ? sortCode
                      : null,

                }),
            }
          );

        const data =
          await res.json();

        alert(data.message);

        setAmount("");

        setWallet("");

setBankCountry("");
setBankName("");
setAccountHolder("");
setIban("");
setSwiftCode("");
setAccountNumber("");
setRoutingNumber("");
setSortCode("");
setBankTransferType("");

      } catch (err) {
        alert("Server error");
      }
    };

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
        }}
      >
        <h1 style={{
          marginBottom: 10,
          fontSize: 30,
          fontWeight: "700",
        }}>
          💸 Withdraw Request
        </h1>

        <p style={{
          marginBottom: 25,
          opacity: 0.7,
        }}>
          Choose your withdrawal method and enter the required details.
        </p>

        <div
          style={{
            background:
              theme === "light"
                ? "white"
                : "#111827",

            padding: 30,
            borderRadius: 20,
            maxWidth: 700,

            boxShadow:
              "0 0 10px rgba(0,0,0,0.1)",
          }}
        >

          <h2 style={{
            marginBottom: 15,
          }}>
            💳 Withdraw Method
          </h2>

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
              fontSize: 16,
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

          {method === "crypto" && (
            <>
              <label style={{
                display: "block",
                marginBottom: 8,
                fontWeight: "600",
              }}>
                Cryptocurrency
              </label>

              <select
                value={cryptoCurrency}
                onChange={(e) =>
                  setCryptoCurrency(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  padding: 15,
                  borderRadius: 10,
                  marginBottom: 15,
                  fontSize: 16,
                }}
              >
             <option value="usdttrc20">
  USDT TRC20
</option>

<option value="usdterc20">
  USDT ERC20
</option>

<option value="btc">
  Bitcoin (BTC)
</option>

<option value="eth">
  Ethereum (ETH)
</option>

<option value="usdc">
  USDC
</option>

<option value="trx">
  TRON (TRX)
</option>

<option value="ltc">
  Litecoin (LTC)
</option>

<option value="doge">
  Dogecoin (DOGE)
</option>

<option value="xrp">
  XRP
</option>

<option value="sol">
  Solana (SOL)
</option>

<option value="ada">
  Cardano (ADA)
</option>

<option value="usdtbsc">
  USDT BSC
</option>

<option value="usdtsol">
  USDT Solana
</option>
              </select>
            </>
          )}

              {method === "bank" ? (
                <>
                  <label style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: "600",
                  }}>
                    Bank Country
                  </label>

                  <select
                    value={bankCountry}
                    onChange={(e)=>setBankCountry(e.target.value)}
                    style={{
                      width:"100%",
                      padding:15,
                      borderRadius:10,
                      marginBottom:15
                    }}
                  >
                    <option value="">Select Country</option>
                    <option value="PS">Palestine</option>
                    <option value="SA">Saudi Arabia</option>
                    <option value="AE">UAE</option>
                    <option value="EG">Egypt</option>
                    <option value="JO">Jordan</option>
                    <option value="EU">European Union</option>
                    <option value="USA">United States</option>
                    <option value="UK">United Kingdom</option>
                  </select>

                  <input
                    placeholder="Account Holder Name"
                    value={accountHolder}
                    onChange={(e)=>setAccountHolder(e.target.value)}
                    style={{width:"100%",padding:15,borderRadius:10,marginBottom:15}}
                  />

                  {bankCountry !== "USA" && bankCountry !== "UK" && (
                    <input
                      placeholder="IBAN"
                      value={iban}
                      onChange={(e)=>setIban(e.target.value)}
                      style={{width:"100%",padding:15,borderRadius:10,marginBottom:15}}
                    />
                  )}

                  {(bankCountry === "USA" || bankCountry === "UK") && (
                    <input
                      placeholder="Bank Name"
                      value={bankName}
                      onChange={(e)=>setBankName(e.target.value)}
                      style={{width:"100%",padding:15,borderRadius:10,marginBottom:15}}
                    />
                  )}

                  {bankCountry === "USA" && (
                    <>
                      <input
                        placeholder="Account Number"
                        value={accountNumber}
                        onChange={(e)=>setAccountNumber(e.target.value)}
                        style={{width:"100%",padding:15,borderRadius:10,marginBottom:15}}
                      />
                      <input
                        placeholder="Routing Number"
                        value={routingNumber}
                        onChange={(e)=>setRoutingNumber(e.target.value)}
                        style={{width:"100%",padding:15,borderRadius:10,marginBottom:15}}
                      />
                    </>
                  )}

                  {bankCountry === "UK" && (
                    <>
                      <input
                        placeholder="Account Number"
                        value={accountNumber}
                        onChange={(e)=>setAccountNumber(e.target.value)}
                        style={{width:"100%",padding:15,borderRadius:10,marginBottom:15}}
                      />
                      <input
                        placeholder="Sort Code"
                        value={sortCode}
                        onChange={(e)=>setSortCode(e.target.value)}
                        style={{width:"100%",padding:15,borderRadius:10,marginBottom:15}}
                      />
                    </>
                  )}

                  <input
                    placeholder="SWIFT / BIC (Optional)"
                    value={swiftCode}
                    onChange={(e)=>setSwiftCode(e.target.value)}
                    style={{width:"100%",padding:15,borderRadius:10,marginBottom:15}}
                  />
                </>
              ) : (
                <input
                  type="text"
                  placeholder={
                    method === "paypal"
                      ? "Enter PayPal email"
                      : `Enter ${cryptoCurrency} wallet address`
                  }
                  value={wallet}
                  onChange={(e)=>setWallet(e.target.value)}
                  style={{width:"100%",padding:15,borderRadius:10,marginBottom:15}}
                />
              )}

          <label style={{
            display: "block",
            marginBottom: 8,
            fontWeight: "600",
          }}>
            Amount
          </label>

          <input
            type="number"
            min="1"
            step="0.01"
            placeholder="Minimum $1"
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
              marginBottom: 20,

              background:
                theme === "light"
                  ? "#f9fafb"
                  : "#1f2937",

              color:
                theme === "light"
                  ? "#111827"
                  : "white",

              fontSize: 16,
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
              💵 Withdraw:
              <strong>
                {" "}
                ${Number(
                  amount || 0
                ).toFixed(2)}
              </strong>
            </p>

            <br />

            <p>
              🧾 Fee:
              <strong>
                {" "}
                {method === "crypto"
                  ? "1% (minimum $1)"
                  : "3.5%"}
              </strong>
              {" — "}
              <strong>
                ${fee.toFixed(2)}
              </strong>
            </p>

            <br />

            <p>
              ✅ You Will Receive:
              <strong>
                {" "}
                ${netAmount.toFixed(2)}
              </strong>
            </p>
          </div>

          <button
            onClick={
              createWithdraw
            }
            style={{
              width: "100%",
              padding: 15,
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: 16,
            }}
          >
            Create Withdraw Request
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
              Withdraw requests require
              admin approval before
              processing.
            </p>

            <br />

            <p>
              <strong>
                Withdrawal Fees
              </strong>
            </p>

            <p>
              • PayPal: 3.5%
            </p>

            <p>
              • Bank Transfer: 3.5%
            </p>

            <p>
              • Crypto: 1% (minimum fee $1)
            </p>

            <p>
              • Minimum withdrawal: $1
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}



