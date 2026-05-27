const User =
  require(
    "../models/User"
  );

module.exports =
  async ({
    user,
    amount,
  }) => {
    try {
      let score = 0;

      // Large transfer

      if (amount > 5000) {
        score += 40;
      }

      // Medium transfer

      if (amount > 1000) {
        score += 20;
      }

      // Unverified user

      if (
        !user.verified
      ) {
        score += 25;
      }

      // Frozen behavior

      if (
        user.frozen
      ) {
        score += 100;
      }

      // Existing score

      score +=
        user.riskScore || 0;

      // Risk level

      let level =
        "low";

      if (score >= 40) {
        level =
          "medium";
      }

      if (score >= 70) {
        level =
          "high";
      }

      // Auto freeze

      if (score >= 100) {
        user.frozen =
          true;
      }

      user.riskScore =
        score;

      user.riskLevel =
        level;

      await user.save();

      return {
        score,
        level,
      };

    } catch (err) {
      console.log(err);

      return {
        score: 0,
        level: "low",
      };
    }
  };