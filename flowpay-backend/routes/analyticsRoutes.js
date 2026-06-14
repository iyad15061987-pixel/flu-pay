const {
  setCache,
  getCache,
} = require(
  "../utils/cache"
);

const express =
  require("express");

const router =
  express.Router();

const {
  auth,
  adminOnly,
} = require(
  "../middleware/auth"
);

const User =
  require(
    "../models/User"
  );

const Transaction =
  require(
    "../models/Transaction"
  );

const Kyc =
  require(
    "../models/Kyc"
  );

  const PaymentLink =
  require(
    "../models/PaymentLink"
  );

// =========================
// USER ANALYTICS
// =========================

router.get(
  "/analytics",

  auth,

  async (req, res) => {

    try {

      const cacheKey =
        `analytics_${req.user.id}`;

      const cached =
        await getCache(
          cacheKey
        );

      if (cached) {
        return res.json(
          cached
        );
      }

      const user =
        await User.findById(
          req.user.id
        );

      if (!user) {

        return res.status(404).json({
          message:
            "User not found",
        });

      }

      // =========================
      // AGGREGATIONS
      // =========================

      const sentAggregation =
        await Transaction.aggregate([
          {
            $match: {
              fromEmail:
                user.email,
            },
          },

          {
            $group: {
              _id: null,

              totalSent: {
                $sum:
                  "$amount",
              },

              totalFees: {
                $sum:
                  "$fee",
              },

              sentCount: {
                $sum: 1,
              },
            },
          },
        ]);

      const receivedAggregation =
        await Transaction.aggregate([
          {
            $match: {
              toEmail:
                user.email,
            },
          },

          {
            $group: {
              _id: null,

              totalReceived:
                {
                  $sum:
                    "$netAmount",
                },

              receivedCount:
                {
                  $sum: 1,
                },
            },
          },
        ]);

      const sentData =
        sentAggregation[0] ||
        {};

      const receivedData =
        receivedAggregation[0] ||
        {};

        const totalPaymentLinks =
  await PaymentLink.countDocuments({
    userId:
      req.user.id,
  });

const paidLinks =
  await PaymentLink.countDocuments({
    userId:
      req.user.id,

    status:
      "paid",
  });

const pendingLinks =
  await PaymentLink.countDocuments({
    userId:
      req.user.id,

    status:
      "pending",
  });

const paymentRevenue =
  await PaymentLink.aggregate([
    {
      $match: {
        userId:
          user._id,

        status:
          "paid",
      },
    },

    {
      $group: {
        _id: null,

        revenue: {
          $sum:
            "$amount",
        },
      },
    },
  ]);
  
  const responseData = {
  totalSent:
    sentData.totalSent ||
    0,

  totalReceived:
    receivedData.totalReceived ||
    0,

  totalFees:
    sentData.totalFees ||
    0,

  sentCount:
    sentData.sentCount ||
    0,

  receivedCount:
    receivedData.receivedCount ||
    0,

  totalPaymentLinks,

  paidLinks,

  pendingLinks,

  paymentRevenue:
    paymentRevenue[0]
      ?.revenue || 0,
};

      await setCache(
        cacheKey,
        responseData,
        120
      );

      return res.json(
        responseData
      );

    } catch (err) {

      console.log(err);

      return res.status(500).json({
        message:
          "Server error",
      });

    }

  }
);

// =========================
// ADMIN ANALYTICS
// =========================

router.get(
  "/admin/analytics",

  auth,

  adminOnly,

  async (req, res) => {

    try {

      const cacheKey =
        "admin_analytics";

      const cached =
        await getCache(
          cacheKey
        );

      if (cached) {
        return res.json(
          cached
        );
      }

      // =========================
      // USERS
      // =========================

      const totalUsers =
        await User.countDocuments();

      const verifiedUsers =
        await User.countDocuments({
          verified: true,
        });

      const frozenUsers =
        await User.countDocuments({
          frozen: true,
        });

      // =========================
      // TRANSACTION STATS
      // =========================

      const transactionStats =
        await Transaction.aggregate([
          {
            $group: {
              _id: null,

              totalVolume: {
                $sum:
                  "$amount",
              },

              totalFees: {
                $sum:
                  "$fee",
              },

              totalTransactions:
                {
                  $sum: 1,
                },
            },
          },
        ]);

      const stats =
        transactionStats[0] ||
        {};

      // =========================
      // DAILY VOLUME
      // =========================

      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      const dailyStats =
        await Transaction.aggregate([
          {
            $match: {
              createdAt: {
                $gte:
                  today,
              },
            },
          },

          {
            $group: {
              _id: null,

              dailyVolume:
                {
                  $sum:
                    "$amount",
                },
            },
          },
        ]);

      // =========================
      // MONTHLY VOLUME
      // =========================

      const monthStart =
        new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1
        );

      const monthlyStats =
        await Transaction.aggregate([
          {
            $match: {
              createdAt: {
                $gte:
                  monthStart,
              },
            },
          },

          {
            $group: {
              _id: null,

              monthlyVolume:
                {
                  $sum:
                    "$amount",
                },
            },
          },
        ]);

      // =========================
      // WEEKLY CHART
      // =========================

      const last7Days =
        new Date();

      last7Days.setDate(
        last7Days.getDate() - 7
      );

      const weeklyVolume =
        await Transaction.aggregate([
          {
            $match: {
              createdAt: {
                $gte:
                  last7Days,
              },
            },
          },

          {
            $group: {
              _id: {
                $dateToString:
                  {
                    format:
                      "%Y-%m-%d",

                    date:
                      "$createdAt",
                  },
              },

              volume: {
                $sum:
                  "$amount",
              },

              transactions:
                {
                  $sum: 1,
                },
            },
          },

          {
            $sort: {
              _id: 1,
            },
          },
        ]);

      // =========================
      // USER GROWTH
      // =========================

      const userGrowth =
        await User.aggregate([
          {
            $match: {
              createdAt: {
                $gte:
                  last7Days,
              },
            },
          },

          {
            $group: {
              _id: {
                $dateToString:
                  {
                    format:
                      "%Y-%m-%d",

                    date:
                      "$createdAt",
                  },
              },

              users: {
                $sum: 1,
              },
            },
          },

          {
            $sort: {
              _id: 1,
            },
          },
        ]);

      // =========================
      // KYC
      // =========================

      const totalKyc =
        await Kyc.countDocuments();

      const approvedKyc =
        await Kyc.countDocuments(
          {
            status:
              "approved",
          }
        );

      const pendingKyc =
        await Kyc.countDocuments(
          {
            status:
              "pending",
          }
        );

      const rejectedKyc =
        await Kyc.countDocuments(
          {
            status:
              "rejected",
          }
        );

      // =========================
      // FRAUD
      // =========================

      const suspiciousTransactions =
        await Transaction.countDocuments(
          {
            amount: {
              $gte:
                10000,
            },
          }
        );

      // =========================
      // RESPONSE
      // =========================

      const responseData = {

        totalUsers,

        verifiedUsers,

        frozenUsers,

        totalTransactions:
          stats.totalTransactions ||
          0,

        totalVolume:
          stats.totalVolume ||
          0,

        totalFees:
          stats.totalFees ||
          0,

        dailyVolume:
          dailyStats[0]
            ?.dailyVolume ||
          0,

        monthlyVolume:
          monthlyStats[0]
            ?.monthlyVolume ||
          0,

        totalKyc,

        approvedKyc,

        pendingKyc,

        rejectedKyc,

        suspiciousTransactions,

        weeklyVolume,

        userGrowth,
      };

      await setCache(
        cacheKey,
        responseData,
        120
      );

      return res.json(
        responseData
      );

    } catch (err) {

      console.log(err);

      return res.status(500).json({
        message:
          "Server error",
      });

    }

  }
);

// =========================
// TREASURY ANALYTICS
// =========================

router.get(
  "/admin/treasury-analytics",

  auth,

  adminOnly,

  async (req, res) => {

    try {

      const cacheKey =
        "treasury_analytics";

      const cached =
        await getCache(
          cacheKey
        );

      if (cached) {
        return res.json(
          cached
        );
      }

      const treasuryStats =
        await Transaction.aggregate([
          {
            $group: {
              _id: null,

              volume: {
                $sum:
                  "$amount",
              },

              fees: {
                $sum:
                  "$fee",
              },

              totalTransactions:
                {
                  $sum: 1,
                },
            },
          },
        ]);

      const stats =
        treasuryStats[0] ||
        {};

      const responseData = {

        totalTransactions:
          stats.totalTransactions ||
          0,

        volume:
          stats.volume || 0,

        fees:
          stats.fees || 0,
      };

      await setCache(
        cacheKey,
        responseData,
        120
      );

      return res.json(
        responseData
      );

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