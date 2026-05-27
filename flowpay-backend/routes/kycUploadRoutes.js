const express =
  require("express");

const router =
  express.Router();

const multer =
  require("multer");

const path =
  require("path");

const {
  auth,
} = require(
  "../middleware/auth"
);

const Kyc =
  require(
    "../models/Kyc"
  );

// =========================
// STORAGE
// =========================

const storage =
  multer.diskStorage({
    destination:
      (
        req,
        file,
        cb
      ) => {
        cb(
          null,
          "uploads/"
        );
      },

    filename:
      (
        req,
        file,
        cb
      ) => {
        cb(
          null,
          Date.now() +
            path.extname(
              file.originalname
            )
        );
      },
  });

const upload =
  multer({
    storage,
  });

// =========================
// SUBMIT KYC
// =========================

router.post(
  "/submit-kyc",

  auth,

  upload.fields([
    {
      name:
        "documentFront",
      maxCount: 1,
    },

    {
      name:
        "selfie",
      maxCount: 1,
    },
  ]),

  async (req, res) => {
    try {
      const {
        fullName,
        country,
        documentType,
      } = req.body;

      const kyc =
        await Kyc.create({
          userId:
            req.user.id,

          email:
            req.user.email,

          fullName,

          country,

          documentType,

          documentFront:
            req.files[
              "documentFront"
            ][0].path,

          selfie:
            req.files[
              "selfie"
            ][0].path,
        });

      res.json({
        message:
          "KYC submitted successfully",

        kyc,
      });

    } catch (err) {
      console.log(err);

      res.status(500).json({
        message:
          "Server error",
      });
    }
  }
);

module.exports =
  router;