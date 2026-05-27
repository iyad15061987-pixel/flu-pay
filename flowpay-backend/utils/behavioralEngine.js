const RiskProfile =
  require(
    "../models/RiskProfile"
  );

const analyzeBehavior =
  async ({
    user,

    amount,

    ip,
  }) => {
    let profile =
      await RiskProfile.findOne(
        {
          email:
            user.email,
        }
      );

    if (!profile) {
      profile =
        await RiskProfile.create(
          {
            email:
              user.email,
          }
        );
    }

    // =========================
    // UPDATE STATS
    // =========================

    profile.totalTransfers +=
      1;

    profile.totalVolume +=
      amount;

    profile.lastIp =
      ip;

    // =========================
    // RISK ENGINE
    // =========================

    let risk = 0;

    if (
      profile.totalVolume >=
      10000
    ) {
      risk += 25;
    }

    if (
      profile.totalTransfers >=
      50
    ) {
      risk += 25;
    }

    if (
      amount >= 5000
    ) {
      risk += 30;
    }

    profile.riskScore =
      risk;

    if (
      risk >= 70
    ) {
      profile.riskLevel =
        "High";

    } else if (
      risk >= 40
    ) {
      profile.riskLevel =
        "Medium";

    } else {
      profile.riskLevel =
        "Low";
    }

    await profile.save();

    return profile;
  };

module.exports =
  analyzeBehavior;