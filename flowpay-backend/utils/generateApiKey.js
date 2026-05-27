const crypto =
  require("crypto");

module.exports =
  () => {
    return (
      "fp_live_" +
      crypto
        .randomBytes(32)
        .toString("hex")
    );
  };