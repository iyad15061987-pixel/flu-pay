const {
  v4: uuidv4,
} = require("uuid");

module.exports =
  (req, res, next) => {
    const requestId =
      uuidv4();

    req.requestId =
      requestId;

    console.log(
      JSON.stringify({
        type:
          "REQUEST",

        requestId,

        method:
          req.method,

        url:
          req.originalUrl,

        ip:
          req.ip,

        timestamp:
          new Date().toISOString(),
      })
    );

    res.setHeader(
      "X-Request-ID",
      requestId
    );

    next();
  };