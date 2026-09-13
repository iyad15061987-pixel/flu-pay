const cloudinary =
  require("cloudinary").v2;

// =========================
// CLOUDINARY CONFIGURATION
// =========================

cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_NAME || process.env.CLOUDINARY_CLOUD_NAME,

  api_key:
    process.env.CLOUDINARY_KEY || process.env.CLOUDINARY_API_KEY,

  api_secret:
    process.env.CLOUDINARY_SECRET || process.env.CLOUDINARY_API_SECRET,
});

// =========================
// EXPORT
// =========================

module.exports =
  cloudinary;