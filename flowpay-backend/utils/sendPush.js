const admin =
  require(
    "../config/firebase"
  );

const sendPush =
  async (
    token,
    title,
    body
  ) => {
    try {
      await admin
        .messaging()
        .send({
          token,

          notification: {
            title,

            body,
          },
        });

    } catch (err) {
      console.log(err);
    }
  };

module.exports =
  sendPush;