require("dotenv").config();

const mongoose = require("mongoose");
const Accounting = require("./models/AccountingEntry");

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {

    const x =
      await Accounting.aggregate([
        {
          $match: {
            account: "platform_revenue",
            type: "credit",
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$amount",
            },
            count: {
              $sum: 1,
            },
          },
        },
      ]);

    console.log(
      JSON.stringify(x, null, 2)
    );

    await mongoose.disconnect();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
