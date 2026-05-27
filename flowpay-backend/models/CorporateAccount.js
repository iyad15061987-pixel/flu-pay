const mongoose =
  require("mongoose");

const corporateAccountSchema =
  new mongoose.Schema(
    {
      companyName:
        String,

      ownerEmail:
        String,

      members: [
        {
          email:
            String,

          role:
            String,
        },
      ],
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "CorporateAccount",
    corporateAccountSchema
  );