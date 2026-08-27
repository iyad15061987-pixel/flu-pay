const AuditLog =
  require("../models/AuditLog");


async function createAuditLog({
  userId,
  email,
  action,
  description,
  ip,
  status,
  metadata,
}) {

  try {

    await AuditLog.create({

      userId,
      email,
      action,
      description,
      ip,
      status:
        status || "success",

      metadata:
        metadata || {},

    });

  } catch(error){

    console.log(
      "Audit Error:",
      error.message
    );

  }

}


module.exports =
  createAuditLog;