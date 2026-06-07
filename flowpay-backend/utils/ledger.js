const LedgerEntry =
  require(
    "../models/LedgerEntry"
  );

const createLedgerEntry =
  async ({
    userId,

    email,

    type,

    amount,

    balanceBefore,

    balanceAfter,

    reference,

    description,
  }) => {
    await LedgerEntry.create({
      userId,

      email,

      type,

      amount,

      balanceBefore,

      balanceAfter,

      reference,

      description,
    });
  };

module.exports =
  createLedgerEntry;