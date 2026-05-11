type Props = {
  balance: number;
};

export default function WalletCard({
  balance,
}: Props) {
  return (
    <div
      style={{
        background:
          "linear-gradient(135deg,#2563eb,#1e40af)",
        borderRadius: 20,
        padding: 30,
        color: "white",
        maxWidth: 450,
        boxShadow: "0 0 30px rgba(37,99,235,0.4)",
      }}
    >
      <p
        style={{
          opacity: 0.8,
        }}
      >
        Current Balance
      </p>

      <h1
        style={{
          fontSize: 45,
          marginTop: 10,
        }}
      >
        ${balance}
      </h1>

      <br />

      <p>FlowPay Digital Wallet</p>
    </div>
  );
}