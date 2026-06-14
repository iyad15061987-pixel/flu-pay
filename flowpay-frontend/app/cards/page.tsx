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
                  "linear-gradient(135deg,#2563eb,#1e3a8a)",

                padding: 30,

                borderRadius: 20,

                marginBottom: 25,

                maxWidth: 550,

                color: "white",
              }}
            >
              <h2>
                FlowPay
                Virtual Card
              </h2>

              <br />

              <h1
                style={{
                  letterSpacing: 3,
                }}
              >
                {
                  card.cardNumber
                }
              </h1>

<br />

<p
  style={{
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 2,
  }}
>
  {card.cardHolder}
</p>

              <br />

              <div
                style={{
                  display: "flex",

                  justifyContent:
                    "space-between",
                }}
              >
                <div>
                  <small>
                    Expiry
                  </small>

                  <br />

                  {
                    card.expiry
                  }
                </div>

                <div>
                  <small>
                    CVV
                  </small>

                  <br />

                  {
                    card.cvv
                  }
                </div>

                <div>
                  <small>
                    Status
                  </small>

                  <br />

                  {
                    card.status
                  }
                </div>
              </div>

              <br />

              <button
                onClick={() =>
                  freezeCard(
                    card._id
                  )
                }
                style={{
                  padding:
                    "10px 20px",

                  border: "none",

                  borderRadius: 10,

                  marginRight: 10,

                  cursor:
                    "pointer",
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
                    "10px 20px",

                  border: "none",

                  borderRadius: 10,

                  cursor:
                    "pointer",
                }}
              >
                Transactions
              </button>
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