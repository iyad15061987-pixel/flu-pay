const fs =
  require("fs");

const path =
  require("path");

const mongoose =
  require("mongoose");

require("dotenv").config();

const User =
  require(
    "./models/User"
  );

const Transaction =
  require(
    "./models/Transaction"
  );

const Notification =
  require(
    "./models/Notification"
  );

mongoose
  .connect(
    process.env.MONGO_URI
  )

  .then(async () => {
    console.log(
      "Backup started..."
    );

    const users =
      await User.find();

    const transactions =
      await Transaction.find();

    const notifications =
      await Notification.find();

    const backup = {
      users,

      transactions,

      notifications,

      createdAt:
        new Date(),
    };

    const filename =
      `backup-${Date.now()}.json`;

    const filepath =
      path.join(
        __dirname,

        "backups",

        filename
      );

    fs.writeFileSync(
      filepath,

      JSON.stringify(
        backup,

        null,

        2
      )
    );

    console.log(
      "Backup completed:"
    );

    console.log(
      filepath
    );

    process.exit();

  })

  .catch((err) => {
    console.log(err);
  });