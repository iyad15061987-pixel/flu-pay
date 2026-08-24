const LedgerEntry =
  require("../models/LedgerEntry");

// =========================
// CREATE LEDGER ENTRY
// =========================

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
    session,
  }) => {

    const entries =
      await LedgerEntry.create(
        [
          {
            userId,
            email,
            type,
            amount,
            balanceBefore,
            balanceAfter,
            reference,
            description,
          },
        ],
        {
          session,
        }
      );

    return entries[0];
  };

module.exports =
  createLedgerEntry;