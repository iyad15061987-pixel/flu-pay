const notificationQueue =
  require(
    "../queues/notificationQueue"
  );

module.exports =
  async ({
    email,
    title,
    message,
  }) => {
    try {
      await notificationQueue.add({
        email,

        title,

        message,
      });

    } catch (err) {
      console.log(err);
    }
  };