const Queue =
  require("bull");

const Notification =
  require(
    "../models/Notification"
  );

const notificationQueue =
  new Queue(
    "notificationQueue",

    {
      redis: {
        host:
          "redis",

        port: 6379,
      },
    }
  );

// =========================
// PROCESS NOTIFICATIONS
// =========================

notificationQueue.process(
  async (job) => {
    const {
      email,
      title,
      message,
    } = job.data;

    const notification =
      await Notification.create(
        {
          email,

          title,

          message,
        }
      );

    // REALTIME EVENT

    if (global.io) {
      global.io.emit(
        "notification",

        notification
      );
    }

    console.log(
      `🔔 Notification sent to ${email}`
    );
  }
);

module.exports =
  notificationQueue;