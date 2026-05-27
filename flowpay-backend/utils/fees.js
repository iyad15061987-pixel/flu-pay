const calculateInternalFee =
  (amount) => {
    return amount * 0.0001;
  };

const calculateExternalFee =
  (amount) => {
    return amount * 0.035;
  };

module.exports = {
  calculateInternalFee,
  calculateExternalFee,
};