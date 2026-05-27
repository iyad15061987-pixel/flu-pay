const cron =
  require("node-cron");

const User =
  require(
    "../models/User"
  );

// =========================
// DAILY RESET
// =========================

cron.schedule(
  "0 0 * * *",

  async () => {
    try {
      console.log(
        "🔄 Resetting daily limits..."
      );

      await User.updateMany(
        {},

        {
          dailyUsed: 0,
        }
      );

      console.log(
        "✅ Daily limits reset"
      );

    } catch (err) {
      console.log(err);
    }
  }
);

// =========================
// MONTHLY RESET
// =========================

cron.schedule(
  "0 0 1 * *",

  async () => {
    try {
      console.log(
        "🔄 Resetting monthly limits..."
      );

      await User.updateMany(
        {},

        {
          monthlyUsed: 0,
        }
      );

      console.log(
        "✅ Monthly limits reset"
      );

    } catch (err) {
      console.log(err);
    }
  }
);