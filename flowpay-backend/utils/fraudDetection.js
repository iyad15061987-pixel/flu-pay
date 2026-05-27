const Transaction =
  require(
    "../models/Transaction"
  );

const FraudLog =
  require(
    "../models/FraudLog"
  );

const User =
  require(
    "../models/User"
  );

const detectFraud =
  async ({
    user,

    amount,

    target,
  }) => {
    let riskScore = 0;

    let reasons = [];

    // =========================
    // LARGE TRANSFER
    // =========================

    if (amount >= 5000) {
      riskScore += 40;

      reasons.push(
        "Large transfer"
      );
    }

    // =========================
    // MANY TRANSFERS
    // =========================

    const recentTransfers =
      await Transaction.countDocuments(
        {
          fromEmail:
            user.email,

          createdAt: {
            $gte:
              new Date(
                Date.now() -
                  10 *
                    60 *
                    1000
              ),
          },
        }
      );

    if (
      recentTransfers >= 5
    ) {
      riskScore += 35;

      reasons.push(
        "Too many transfers"
      );
    }

    // =========================
    // SAME TARGET SPAM
    // =========================

    const repeatedTarget =
      await Transaction.countDocuments(
        {
          fromEmail:
            user.email,

          toEmail:
            target,
        }
      );

    if (
      repeatedTarget >= 10
    ) {
      riskScore += 25;

      reasons.push(
        "Repeated target"
      );
    }

    // =========================
    // AUTO FREEZE
    // =========================

    let action =
      "Allowed";

    if (
      riskScore >= 70
    ) {
      user.frozen =
        true;

      await user.save();

      action =
        "Frozen";
    }

    // =========================
    // SAVE LOG
    // =========================

    if (
      riskScore > 0
    ) {
      await FraudLog.create({
        email:
          user.email,

        reason:
          reasons.join(
            ", "
          ),

        riskScore,

        action,

        metadata: {
          amount,

          target,
        },
      });
    }

    return {
      riskScore,

      action,

      reasons,
    };
  };

module.exports =
  detectFraud;