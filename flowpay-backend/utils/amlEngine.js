const AmlAlert =
  require(
    "../models/AmlAlert"
  );

module.exports =
  async ({
    user,
    amount,
  }) => {
    try {
      // Large transaction

      if (amount >= 10000) {
        await AmlAlert.create({
          email:
            user.email,

          riskLevel:
            "high",

          amount,

          reason:
            "Large transaction over $10,000",
        });
      }

      // Unverified high transfer

      if (
        !user.verified &&
        amount >= 3000
      ) {
        await AmlAlert.create({
          email:
            user.email,

          riskLevel:
            "medium",

          amount,

          reason:
            "Unverified user large transfer",
        });
      }

      // High risk user

      if (
        user.riskLevel ===
        "high"
      ) {
        await AmlAlert.create({
          email:
            user.email,

          riskLevel:
            "high",

          amount,

          reason:
            "High risk user activity",
        });
      }

    } catch (err) {
      console.log(err);
    }
  };