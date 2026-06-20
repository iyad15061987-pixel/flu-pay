"use client";

import {
  useEffect,
  useState,
} from "react";

import Sidebar from "../components/Sidebar";

import API_URL from "@/lib/api";

interface Card {
  _id: string;

  cardHolder: string;

  cardNumber: string;

  cvv: string;

  expiry: string;

  status: string;
}

interface CardTransaction {
  _id: string;

  merchant: string;

  amount: number;

  createdAt: string;
}

export default function CardsPage() {
  const [theme, setTheme] =
    useState("dark");

  const [cards, setCards] =
    useState<Card[]>([]);

  const [
    selectedCard,
    setSelectedCard,
  ] = useState("");

  const [
    transactions,
    setTransactions,
  ] = useState<
    CardTransaction[]
  >([]);

  const [loading, setLoading] =
    useState(false);

    const [
  showCardNumber,
  setShowCardNumber
] = useState(false);

const [
  showCVV,
  setShowCVV,
] = useState(false);

  useEffect(() => {
    const savedTheme =
      localStorage.getItem(
        "theme"
      );

    if (savedTheme) {
      setTheme(savedTheme);
    }

    loadCards();
  }, []);

  const loadCards =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/my-cards`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );
const data =
  await res.json();

console.log(
  "CARDS API:",
  data
);

setCards(data);
      } catch (err) {
        console.log(err);
      }
    };

  const loadTransactions =
    async (
      cardId: string
    ) => {
      try {
        setSelectedCard(
          cardId
        );

        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/card-transactions/${cardId}`,
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
          data
        );

      } catch (err) {
        console.log(err);
      }
    };

  const requestCard =
    async () => {
      try {
        setLoading(true);

        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_URL}/request-card`,
            {
              method: "POST",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        alert(data.message);

        loadCards();

      } catch (err) {
        console.log(err);

      } finally {
        setLoading(false);
      }
    };

  const freezeCard =
    async (
      id: string
    ) => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        await fetch(
          `${API_URL}/freeze-card/${id}`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        loadCards();

      } catch (err) {
        console.log(err);
      }
    };

    const formatCardNumber =
  (number: string) => {

    return number.replace(
      /(\d{4})(?=\d)/g,
      "$1 "
    );

  };

  const maskCardNumber =
  (number: string) => {

    return (
      "**** **** **** " +
      number.slice(-4)
    );

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
        <h1>
          💳 Cards
        </h1>

        <br />

        <button
          onClick={
            requestCard
          }
          disabled={loading}
          style={{
            padding:
              "15px 25px",

            border: "none",

            borderRadius: 12,

            background:
              "#2563eb",

            color: "white",

            cursor: "pointer",

            marginBottom: 30,
          }}
        >
          {loading
            ? "Creating..."
            : "Request Virtual Card ($10)"}
        </button>

        {cards.map(
          (card) => (
           <div
  key={card._id}
  style={{
    background:
      "linear-gradient(135deg,#021024,#052659,#0b666a,#1cb698)",

    padding: 25,

    borderRadius: 28,

    marginBottom: 30,

    maxWidth: 500,
width: "100%",

    color: "white",

    boxShadow:
      "0 20px 40px rgba(0,0,0,.45)",

    position: "relative",

    overflow: "hidden",
  }}
>

  <div
    style={{
      position: "absolute",
      right: -50,
      top: 20,
      fontSize: 220,
      opacity: 0.05,
      fontWeight: "bold",
    }}
  >
    F
  </div>

  <div
    style={{
      display: "flex",
      justifyContent:
        "space-between",
      alignItems:
        "center",
    }}
  >

    <h2
      style={{
        color: "#22c55e",
        fontSize: 36,
        margin: 0,
      }}
    >
      FlowPay
    </h2>

    <div
      style={{
        fontSize: 40,
      }}
    >
      ))) 
    </div>

  </div>

  <br />

  <div
    style={{
      width: 55,
      height: 40,

      borderRadius: 10,

      background:
        "linear-gradient(135deg,#d1d5db,#f9fafb)",
    }}
  />

  <br />
  <br />

  <div
  style={{
    fontSize: 28,

    letterSpacing: 5,

    fontWeight: "bold",
  }}
>
{
  showCardNumber
    ? formatCardNumber(
        card.cardNumber
      )
    : maskCardNumber(
        card.cardNumber
      )
}
</div>

<div
  style={{
    marginTop: 12,
  }}
>

  <button
    onClick={() =>
      setShowCardNumber(
        !showCardNumber
      )
    }
    style={{
      padding:
        "8px 16px",

      border: "none",

      borderRadius: 10,

      background:
        "#ffffff20",

      color: "white",

      cursor: "pointer",
    }}
  >
    {
      showCardNumber
        ? "Hide Number"
        : "Show Number"
    }
  </button>

</div>

<br />

  <div
    style={{
      display: "flex",
      justifyContent:
        "space-between",
      alignItems:
        "flex-end",
    }}
  >

    <div>

      <div
        style={{
          fontSize: 12,
          opacity: 0.7,
        }}
      >
        CARD HOLDER
      </div>

      <div
        style={{
          fontSize: 20,
          letterSpacing: 2,
          fontWeight: "bold",
        }}
      >
        {
          card.cardHolder
        }
      </div>

    </div>

    <div>

  <div
    style={{
      fontSize: 12,
      opacity: 0.7,
    }}
  >
    VALID THRU
  </div>

  <div
    style={{
      fontSize: 24,
      fontWeight: "bold",
    }}
  >
    {card.expiry}
  </div>

</div>

<div>

  <div
    style={{
      fontSize: 12,
      opacity: 0.7,
      marginBottom: 5,
    }}
  >
    CVV
  </div>

  <div
    style={{
      fontSize: 24,
      fontWeight: "bold",
      textAlign: "center",
    }}
  >
    {
      showCVV
        ? card.cvv
        : "***"
    }
  </div>

  <button
    onClick={() =>
      setShowCVV(
        !showCVV
      )
    }
    style={{
      marginTop: 8,
      padding:
        "5px 10px",
      border: "none",
      borderRadius: 8,
      cursor: "pointer",
      fontSize: 12,
    }}
  >
    {
      showCVV
        ? "Hide"
        : "Show"
    }
  </button>

</div>

<div
  style={{
    fontSize: 38,
    fontWeight: "bold",
  }}
>
  VISA
</div>

  </div>

  <br />

  <div
    style={{
      display: "flex",
      gap: 15,
    }}
  >

    <button
      onClick={() =>
        freezeCard(
          card._id
        )
      }
      style={{
        padding:
          "12px 20px",

        border: "none",

        borderRadius: 12,

        cursor: "pointer",
      }}
    >
      Freeze
    </button>

    <button
      onClick={() =>
        loadTransactions(
          card._id
        )
      }
      style={{
        padding:
          "12px 20px",

        border: "none",

        borderRadius: 12,

        cursor: "pointer",
      }}
    >
      Transactions
    </button>

  </div>

</div>

          )
        )}

        {selectedCard && (
          <div
            style={{
              background:
                theme === "light"
                  ? "white"
                  : "#111827",

              padding: 25,

              borderRadius: 20,

              marginTop: 40,
            }}
          >
            <h2>
              💰 Card
              Transactions
            </h2>

            <br />

            {transactions.length ===
            0 ? (
              <p>
                No transactions
              </p>
            ) : (
              transactions.map(
                (tx) => (
                  <div
                    key={tx._id}
                    style={{
                      borderBottom:
                        "1px solid #374151",

                      padding:
                        "15px 0",
                    }}
                  >
                    <p>
                      <strong>
                        {
                          tx.merchant
                        }
                      </strong>
                    </p>

                    <p>
                      $
                      {
                        tx.amount
                      }
                    </p>

                    <small>
                      {new Date(
                        tx.createdAt
                      ).toLocaleString()}
                    </small>
                  </div>
                )
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}