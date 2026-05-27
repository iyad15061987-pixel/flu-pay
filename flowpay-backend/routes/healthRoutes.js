const express =
  require("express");

const router =
  express.Router();

const mongoose =
  require("mongoose");

router.get(
  "/health",

  async (req, res) => {
    try {
      const dbState =
        mongoose.connection
          .readyState;

      res.json({
        status:
          "OK",

        uptime:
          process.uptime(),

        database:
          dbState === 1
            ? "Connected"
            : "Disconnected",

        memory:
          process.memoryUsage(),

        timestamp:
          new Date(),
      });

    } catch (err) {
      console.log(err);

      res.status(500).json({
        status:
          "ERROR",
      });
    }
  }
);

module.exports =
  router;