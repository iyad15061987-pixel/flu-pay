const express =
  require("express");

const crypto =
  require("crypto");

const router =
  express.Router();

const WebhookLog =
  require(
    "../models/WebhookLog"
  );

// =========================
// VERIFY SIGNATURE
// =========================

const verifySignature =
  (
    payload,
    signature
  ) => {
    const secret =
      process.env
        .WEBHOOK_SECRET ||
      "flowpay_secret";

    const hash =
      crypto
        .createHmac(
          "sha256",
          secret
        )
        .update(
          JSON.stringify(
            payload
          )
        )
        .digest("hex");

    return (
      hash ===
      signature
    );
  };

// =========================
// WEBHOOK ENDPOINT
// =========================

router.post(
  "/webhooks/:source",

  async (req, res) => {
    try {
      const {
        source,
      } = req.params;

      const signature =
        req.headers[
          "x-signature"
        ];

      const valid =
        verifySignature(
          req.body,
          signature
        );

      if (!valid) {
        return res.status(401).json({
          message:
            "Invalid signature",
        });
      }

      const webhook =
        await WebhookLog.create(
          {
            source,

            event:
              req.body
                .event,

            payload:
              req.body,

            signature,

            status:
              "processed",
          }
        );

      // REALTIME ADMIN EVENT

      if (global.io) {
        global.io.emit(
          "webhook_event",

          webhook
        );
      }

      console.log(
        `🌐 Webhook received from ${source}`
      );

      res.json({
        message:
          "Webhook processed",
      });

    } catch (err) {
      console.log(err);

      res.status(500).json({
        message:
          "Webhook error",
      });
    }
  }
);

module.exports =
  router;