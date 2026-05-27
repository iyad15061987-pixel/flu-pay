module.exports =
  (
    err,
    req,
    res,
    next
  ) => {
    console.log(
      JSON.stringify({
        type: "ERROR",

        requestId:
          req.requestId,

        message:
          err.message,

        stack:
          err.stack,

        timestamp:
          new Date().toISOString(),
      })
    );

    res.status(
      err.status || 500
    ).json({
      message:
        err.message ||
        "Internal Server Error",

      requestId:
        req.requestId,
    });
  };