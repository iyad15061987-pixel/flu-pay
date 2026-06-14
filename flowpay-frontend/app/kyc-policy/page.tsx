export default function KYCPolicyPage() {
  return (
    <div
      style={{
        maxWidth: 1000,
        margin: "auto",
        padding: 40,
      }}
    >
      <h1>KYC Policy</h1>

      <br />

      <p>
        Users may be required to complete
        identity verification before accessing
        certain platform features.
      </p>

      <br />

      <ul>
        <li>Government ID</li>
        <li>Passport</li>
        <li>Proof of Address</li>
      </ul>
    </div>
  );
}