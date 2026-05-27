module.exports =
  async ({
    user,
    amount,
  }) => {
    try {
      // Daily limit

      if (
        user.dailyUsed +
          amount >
        user.dailyLimit
      ) {
        return {
          allowed:
            false,

          message:
            "Daily limit exceeded",
        };
      }

      // Monthly limit

      if (
        user.monthlyUsed +
          amount >
        user.monthlyLimit
      ) {
        return {
          allowed:
            false,

          message:
            "Monthly limit exceeded",
        };
      }

      return {
        allowed: true,
      };

    } catch (err) {
      console.log(err);

      return {
        allowed:
          false,

        message:
          "Limit engine error",
      };
    }
  };