const express =
  require("express");

const streamifier =
  require(
    "streamifier"
  );

const router =
  express.Router();

const {
  auth,
} = require(
  "../middleware/auth"
);

const upload =
  require(
    "../middleware/upload"
  );

const cloudinary =
  require(
    "../config/cloudinary"
  );

const Kyc =
  require(
    "../models/Kyc"
  );

// =========================
// MY KYC STATUS
// =========================

router.get(
  "/my-kyc-status",

  auth,

  async (req, res) => {
    console.log("=== MY KYC STATUS ROUTE ENTERED ===");
    console.log("AUTH USER:", req.user);

    try {
      console.log("KYC STATUS USER ID:", req.user.id);

      const kyc = await Kyc.findOne(
        { userId: req.user.id },
        null,
        { sort: { createdAt: -1 } }
      );

      console.log("KYC STATUS RECORD:", kyc ? { id: kyc._id, userId: kyc.userId, status: kyc.status } : null);

      if (!kyc) {
        return res.json({
          hasKyc: false,
          status: "required",
        });
      }

      return res.json({
        hasKyc: true,
        status: kyc.status || "pending",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// =========================
// UPLOAD KYC
// =========================

router.post(
  "/upload-kyc",

  auth,

  upload.fields([
    {
      name:
        "passport",
    },

    {
      name:
        "selfie",
    },
  ]),

  async (req, res) => {
    try {

      // =========================
            // =========================
      // PREVENT DUPLICATE KYC
      // =========================

      const existingKyc =
        await Kyc.findOne(
          { userId: req.user.id },
          null,
          { sort: { createdAt: -1 } }
        );

      if (
        existingKyc &&
        existingKyc.status === "pending"
      ) {
        return res.status(409).json({
          message:
            "Your KYC verification is already pending. Please wait for the review result.",
          status: "pending",
        });
      }

      if (
        existingKyc &&
        existingKyc.status === "approved"
      ) {
        return res.status(409).json({
          message:
            "Your account is already verified. A new KYC submission is not required.",
          status: "approved",
        });
      }
// VALIDATION
      // =========================

      if (
        !req.files ||
        !req.files[
          "passport"
        ] ||
        !req.files[
          "selfie"
        ]
      ) {
        return res.status(400).json({
          message:
            "Passport and selfie are required",
        });
      }

      const passport =
        req.files[
          "passport"
        ][0];

      const selfie =
        req.files[
          "selfie"
        ][0];

      // =========================
      // CLOUDINARY UPLOAD
      // =========================

      const uploadFile =
        (file) => {
          return new Promise(
            (
              resolve,
              reject
            ) => {

              const stream =
                cloudinary.uploader.upload_stream(
                  {
                    folder:
                      "flowpay_kyc",
                  },

                  (
                    err,
                    result
                  ) => {

                    if (
                      err
                    ) {
                      reject(
                        err
                      );

                    } else {
                      resolve(
                        result
                      );
                    }
                  }
                );

              streamifier
                .createReadStream(
                  file.buffer
                )
                .pipe(
                  stream
                );
            }
          );
        };

      // =========================
      // UPLOAD FILES
      // =========================

      const passportUpload =
        await uploadFile(
          passport
        );

      const selfieUpload =
        await uploadFile(
          selfie
        );

      // =========================
      // SAVE KYC
      // =========================

      const {
  fullName,
  country,
  documentType,
} = req.body;

     await Kyc.create({
  userId:
    req.user.id,

  email:
    req.user.email,

  fullName,

  country,

  documentType,

  passportUrl:
    passportUpload.secure_url,

  selfieUrl:
    selfieUpload.secure_url,

  status:
    "pending",
});

      // =========================
      // RESPONSE
      // =========================

      return res.json({
        message:
          "KYC uploaded successfully",
      });

    } catch (err) {
      console.log(err);

      return res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);

module.exports =
  router;