const Queue =
  require("bull");

const AuditLog =
  require(
    "../models/AuditLog"
  );

const auditQueue =
  new Queue(
    "auditQueue",

    {
      redis: {
        host:
          "redis",

        port: 6379,
      },
    }
  );

// =========================
// PROCESS AUDIT LOGS
// =========================

auditQueue.process(
  async (job) => {
    const {
      email,
      action,
      ip,
      metadata,
      role,
    } = job.data;

    const log =
      await AuditLog.create(
        {
          email,

          action,

          ip,

          metadata,

          role,
        }
      );

    // REALTIME ADMIN EVENT

    if (global.io) {
      global.io.emit(
        "admin_activity",

        log
      );
    }

    console.log(
      `📋 Audit log created for ${email}`
    );
  }
);

module.exports =
  auditQueue;