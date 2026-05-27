const express =
  require("express");

const router =
  express.Router();

const adminAuth =
  require(
    "../middleware/adminAuth"
  );

const allowRoles =
  require(
    "../middleware/roles"
  );

const User =
  require(
    "../models/User"
  );

// =========================
// UPDATE USER ROLE
// =========================

router.post(
  "/admin/update-role",

  adminAuth,

  allowRoles(
    "SuperAdmin"
  ),

  async (req, res) => {
    try {
      const {
        email,

        role,
      } = req.body;

      await User.findOneAndUpdate(
        {
          email,
        },

        {
          role,
        }
      );

      res.json({
        message:
          "Role updated",
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