const AccountingEntry =
  require(
    "../models/AccountingEntry"
  );

module.exports =
  async ({
    transactionId,
    sender,
    receiver,
    amount,
    fee,
    netAmount,
  }) => {
    try {
      // Sender Debit

      await AccountingEntry.create({
        transactionId,

        account:
          `${sender.email}_wallet`,

        type:
          "debit",

        amount,

        description:
          "Transfer sent",
      });

      // Receiver Credit

      await AccountingEntry.create({
        transactionId,

        account:
          `${receiver.email}_wallet`,

        type:
          "credit",

        amount:
          netAmount,

        description:
          "Transfer received",
      });

      // Platform Revenue

      await AccountingEntry.create({
        transactionId,

        account:
          "platform_revenue",

        type:
          "credit",

        amount:
          fee,

        description:
          "Transfer fee revenue",
      });

    } catch (err) {
      console.log(err);
    }
  };