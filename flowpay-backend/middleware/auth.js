const jwt =
  require("jsonwebtoken");

// =========================
// AUTH MIDDLEWARE
// =========================

const auth =
  (req, res, next) => {

    try {

      let token =
        req.headers.authorization?.split(
          " "
        )[1];

      if (!token) {

        token =
          req.query.token;
      }

      if (!token) {

        console.log(
          "NO TOKEN RECEIVED"
        );

        return res.status(401).json({
          message:
            "Unauthorized",
        });
      }

      console.log(
        "TOKEN RECEIVED:",
        token
      );

      console.log(
        "JWT_SECRET:",
        process.env.JWT_SECRET
      );

      const decoded =
        jwt.verify(
          token,
          process.env.JWT_SECRET
        );

      console.log(
        "TOKEN VERIFIED:",
        decoded
      );

      req.user =
        decoded;

      next();

    } catch (err) {

      console.log(
        "JWT VERIFY ERROR:",
        err.message
      );

      console.log(
        "JWT_SECRET:",
        process.env.JWT_SECRET
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