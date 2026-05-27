const mongoose =
  require("mongoose");

const activityLogSchema =
  new mongoose.Schema(
    {
      email: String,

      action:
        String,

      role:
        String,

      ip: String,

      metadata:
        Object,
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "ActivityLog",
    activityLogSchema
  );