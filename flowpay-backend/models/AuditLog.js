const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: null,
    },

    email: {
      type: String,
      default: null,
    },

    action: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    ip: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      default: "success",
    },

    metadata: {
      type: Object,
      default: {},
    },
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