const ApiKey =
  require(
    "../models/ApiKey"
  );

module.exports =
  async (
    req,
    res,
    next
  ) => {
    try {
      const apiKey =
        req.headers[
          "x-api-key"
        ];

      if (!apiKey) {
        return res.status(401).json({
          message:
            "API key required",
        });
      }

      const key =
        await ApiKey.findOne({
          apiKey,

          active: true,
        });

      if (!key) {
        return res.status(401).json({
          message:
            "Invalid API key",
        });
      }

      key.lastUsed =
        new Date();

      await key.save();

      req.apiUser =
        key;

      next();

    } catch (err) {
      console.log(err);

      res.status(500).json({
        message:
          "API authentication failed",
      });
    }
  };