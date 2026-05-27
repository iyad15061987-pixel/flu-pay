const mongoose =
  require("mongoose");

const auditLogSchema =
  new mongoose.Schema(
    {
      email: String,

      action: String,

      ip: String,

      userAgent: String,

      details: Object,
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "AuditLog",
    auditLogSchema
  );