const Notification =
  require(
    "../models/Notification"
  );

module.exports =
  async ({
    email,
    title,
    message,
  }) => {

    try {

      const notification =
        await Notification.create({
          email,
          title,
          message,
        });

      if (
        global.io
      ) {
        global.io.emit(
          "notification",
          notification
        );
      }

      console.log(
        `🔔 Notification saved for ${email}`
      );

      return notification;

    } catch (err) {

      console.error(
        "Notification Error:",
        err
      );

      return null;

    }

  };