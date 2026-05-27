const express =
  require("express");

const router =
  express.Router();

const {
  auth,
} = require(
  "../middleware/auth"
);

const {
  transfer,
} = require(
  "../controllers/transferController"
);

// =========================
// TRANSFER
// =========================

router.post(
  "/transfer",

  auth,

  transfer
);

module.exports =
  router;