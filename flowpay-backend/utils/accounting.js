const AccountingEntry =
  require("../models/AccountingEntry");

// =========================
// CREATE ACCOUNTING ENTRIES
// =========================

const createAccountingEntries =
  async ({
    transactionId,
    sender,
    receiver,
    amount,
    fee,
    netAmount,
    session,
  }) => {

    // =========================
    // SENDER DEBIT
    // =========================

    await AccountingEntry.create(
      [
        {
          transactionId,

          account:
            `${sender.email}_wallet`,

          type:
            "debit",

          amount,

          currency:
            "USD",

          description:
            "Transfer sent",
        },
      ],
      {
        session,
      }
    );

    // =========================
    // RECEIVER CREDIT
    // =========================

    await AccountingEntry.create(
      [
        {
          transactionId,

          account:
            `${receiver.email}_wallet`,

          type:
            "credit",

          amount:
            netAmount,

          currency:
            "USD",

          description:
            "Transfer received",
        },
      ],
      {
        session,
      }
    );

    // =========================
    // PLATFORM REVENUE
    // =========================

    await createPlatformRevenueEntry({
      transactionId,
      fee,
      description:
        "Transfer fee revenue",
      session,
    });

    return true;
  };


// =========================
// PLATFORM REVENUE ENTRY
// =========================

const createPlatformRevenueEntry =
  async ({
    transactionId,
    fee,
    description =
      "Platform fee revenue",
    session,
  }) => {

    const numericFee =
      Number(fee) || 0;

    if (numericFee <= 0) {
      return null;
    }

    const entries =
      await AccountingEntry.create(
        [
          {
            transactionId,

            account:
              "platform_revenue",

            type:
              "credit",

            amount:
              numericFee,

            currency:
              "USD",

            description,
          },
        ],
        {
          session,
        }
      );

    return entries[0];
  };


// =========================
// EXPORTS
// =========================

module.exports = {
  createAccountingEntries,
  createPlatformRevenueEntry,
};
