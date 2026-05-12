"use client";

import { useState } from "react";

type Props = {
  onSelect: (email: string) => void;
};

export default function SearchUsers({
  onSelect,
}: Props) {
  const [query, setQuery] =
    useState("");

  const [users, setUsers] =
    useState<any[]>([]);

  const searchUsers = async (
    value: string
  ) => {
    setQuery(value);

    const token =
      localStorage.getItem("token");

    if (!value) {
      setUsers([]);
      return;
    }

    const res = await fetch(
      `import API_URL_URL_URL_URL from "@/lib/API_URL_URL_URL";/search-users?query=${value}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    setUsers(data || []);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search users..."
        value={query}
        onChange={(e) =>
          searchUsers(e.target.value)
        }
        style={{
          width: "100%",
          padding: 15,
          borderRadius: 10,
          border: "none",
          marginBottom: 10,
        }}
      />

      {users.map((user, index) => (
        <div
          key={index}
          onClick={() => {
            onSelect(user.email);

            setQuery(user.email);

            setUsers([]);
          }}
          style={{
            background: "#1f2937",
            padding: 15,
            borderRadius: 10,
            marginBottom: 10,
            cursor: "pointer",
            color: "white",
          }}
        >
          {user.email}
        </div>
      ))}
    </div>
  );
}