const mongoose =
  require("mongoose");


const ledgerEntrySchema =
  new mongoose.Schema(
    {

      userId: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref:
          "User",

        required:
          true,

      },


      email: {

        type:
          String,

        required:
          true,

      },


      transactionId: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref:
          "Transaction",

        default:
          null,

      },


      type: {

        type:
          String,

        required:
          true,

      },


      amount: {

        type:
          Number,

        required:
          true,

      },


      balanceBefore: {

        type:
          Number,

        required:
          true,

      },


      balanceAfter: {

        type:
          Number,

        required:
          true,

      },


      reference: {

        type:
          String,

        index:
          true,

      },


      description: {

        type:
          String,

        default:
          null,

      },


    },

    {
      timestamps:
        true,
    }

  );


// Prevent duplicate financial records

ledgerEntrySchema.index(
  {
    reference: 1,
    type: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);


module.exports =
  mongoose.model(
    "LedgerEntry",
    ledgerEntrySchema
  );