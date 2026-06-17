"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import API_URL from "@/lib/api";

function SuccessContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const capture = async () => {
      const token =
        localStorage.getItem("token");

      const orderId =
        searchParams.get("token");

      if (!orderId) return;

      try {
        await fetch(
          `${API_URL}/paypal/capture-order`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Authorization:
                `Bearer ${token}`,
            },
            body: JSON.stringify({
              orderId,
            }),
          }
        );
      } catch (err) {
        console.log(err);
      }
    };

    capture();
  }, [searchParams]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        fontSize: 24,
      }}
    >
      Payment completed successfully...
    </div>
  );
}

export default function PayPalSuccessPage() {
  return (
    <Suspense
      fallback={
        <div>
          Loading...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}