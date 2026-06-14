"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "next/navigation";

import API_URL from "@/lib/api";

import {
  PayPalScriptProvider,
  PayPalButtons,
} from "@paypal/react-paypal-js";

export default function CheckoutPage() {
  const params =
    useParams();

  const token =
    params?.token;

  const [
    invoice,
    setInvoice,
  ] = useState<any>(
    null
  );

  const [loading, setLoading] =
    useState(true);

  const loadInvoice =
    async () => {
      try {

        const res =
          await fetch(
            `${API_URL}/pay/${token}`
          );

        const data =
          await res.json();

        setInvoice(data);

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {
    if (token) {
      loadInvoice();
    }
  }, [token]);

  const markAsPaid =
  async () => {
    try {

      console.log(
        "START PAYMENT"
      );

      const res =
        await fetch(
          `${API_URL}/pay/${token}/complete`,
          {
            method: "POST",
          }
        );

      console.log(
        "STATUS:",
        res.status
      );

      const data =
        await res.json();

      console.log(
        "RESPONSE:",
        data
      );

      alert(
        data.message
      );

      window.location.reload();

    } catch (err) {

      console.log(
        "PAYMENT ERROR:",
        err
      );
    }
  };
if (loading) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0f172a",
        color: "white",
      }}
    >
      Loading...
    </div>
  );
}

if (
  !invoice ||
  invoice.message
) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0f172a",
        color: "white",
      }}
    >
      Payment Link Not Found
    </div>
  );
}

if (
  invoice.status ===
  "paid"
) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0f172a",
        color: "white",
      }}
    >
      <div
        style={{
          background: "white",
          color: "#111827",
          padding: 40,
          borderRadius: 24,
          textAlign: "center",
        }}
      >
        <h1>
          ✅ Payment Completed
        </h1>

        <br />

        <p>
          This payment link has already been paid.
        </p>
      </div>
    </div>
  );
}

  return (
    <PayPalScriptProvider
      options={{
        clientId:
          process.env
            .NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
          "",
      }}
    >
      <div
        style={{
          minHeight:
            "100vh",

          background:
            "#0f172a",

          display: "flex",

          justifyContent:
            "center",

          alignItems:
            "center",

          padding: 20,
        }}
      >
        <div
          style={{
            background:
              "white",

            borderRadius: 24,

            padding: 40,

            width: 450,

            maxWidth:
              "100%",
          }}
        >
          <h1
            style={{
              marginBottom: 10,
            }}
          >
            💳 Checkout
          </h1>

          <p
            style={{
              color: "#6b7280",

              marginBottom: 30,
            }}
          >
            Secure payment powered by FlowPay
          </p>

          <div
            style={{
              background:
                "#f3f4f6",

              padding: 20,

              borderRadius: 16,

              marginBottom: 25,
            }}
          >
            <p>
              <strong>
                Merchant:
              </strong>
            </p>

            <p>
              {invoice.email}
            </p>

            <br />

            <p>
              <strong>
                Title:
              </strong>
            </p>

            <p>
              {invoice.title}
            </p>

            <br />

            <p>
              <strong>
                Description:
              </strong>
            </p>

            <p>
              {invoice.description}
            </p>
          </div>

          <div
            style={{
              marginBottom: 30,
            }}
          >
            <h2>
              Amount Due
            </h2>

            <h1
              style={{
                fontSize: 42,

                marginTop: 10,
              }}
            >
              $
              {invoice.amount}
            </h1>
          </div>

          <PayPalButtons
            createOrder={(
              data,
              actions
            ) => {
              return actions.order.create(
                {
                  intent:
                    "CAPTURE",

                  purchase_units:
                    [
                      {
                        amount: {
                          currency_code:
                            "USD",

                          value:
                            invoice.amount.toString(),
                        },
                      },
                    ],
                }
              );
            }}

            onApprove={async (
              data,
              actions
            ) => {

              await actions.order?.capture();

              await markAsPaid();
            }}
          />

          <p
            style={{
              marginTop: 20,

              textAlign:
                "center",

              color: "#9ca3af",

              fontSize: 13,
            }}
          >
            🔒 Payments are encrypted and secure
          </p>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}