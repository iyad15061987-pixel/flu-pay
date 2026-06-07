const auditQueue =
  require(
    "../queues/auditQueue"
  );

module.exports =
  async ({
    email,
    action,
    role,
    ip,
    metadata,
  }) => {
    try {
      await auditQueue.add({
        email,

        action,

        role,

        ip,

        metadata,
      });

    } catch (err) {
      console.log(err);
    }
  };