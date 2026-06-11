const jwt =
  require("jsonwebtoken");

// =========================
// AUTH MIDDLEWARE
// =========================

const auth =
  (req, res, next) => {

    try {

      const token =
        req.headers.authorization?.split(
          " "
        )[1];

      console.log(
        "========================="
      );

      console.log(
        "TOKEN =",
        token
      );

      console.log(
        "JWT_SECRET =",
        process.env.JWT_SECRET
      );

      if (!token) {

        console.log(
          "NO TOKEN FOUND"
        );

        return res.status(401).json({
          message:
            "Unauthorized",
        });

      }

      const decoded =
        jwt.verify(
          token,
          process.env.JWT_SECRET
        );

      console.log(
        "DECODED =",
        decoded
      );

      req.user =
        decoded;

      next();

    } catch (err) {

      console.log(
        "JWT ERROR =",
        err.message
      );

      return res.status(401).json({
        message:
          "Invalid token",
      });

    }

  };

// =========================
// ADMIN ONLY
// =========================

const adminOnly =
  (req, res, next) => {

    if (
      req.user.role !==
      "admin"
    ) {

      return res.status(403).json({
        message:
          "Admin access only",
      });

    }

    next();

  };

// =========================
// EXPORTS
// =========================

module.exports = {
  auth,
  adminOnly,
};