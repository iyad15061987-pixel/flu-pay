const crypto =
  require("crypto");

module.exports = () => {

  const codes = [];

  for (
    let i = 0;
    i < 10;
    i++
  ) {

    codes.push(
      crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase()
    );
  }

  return codes;
};