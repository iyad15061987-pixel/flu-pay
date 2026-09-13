const cloudinary =
  require("cloudinary").v2;

// =========================
// CLOUDINARY CONFIGURATION
// =========================

cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_NAME,

  api_key:
    process.env.CLOUDINARY_KEY,

  api_secret:
    process.env.CLOUDINARY_SECRET,
});

// =========================
// EXPORT
// =========================

module.exports =
  cloudinary;