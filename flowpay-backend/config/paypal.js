const axios =
  require("axios");

const getAccessToken =
  async () => {

    const response =
      await axios({
        url:
          process.env.PAYPAL_ENV ===
          "live"
            ? "https://api-m.paypal.com/v1/oauth2/token"
            : "https://api-m.sandbox.paypal.com/v1/oauth2/token",

        method:
          "post",

        data:
          "grant_type=client_credentials",

        auth: {
          username:
            process.env.PAYPAL_CLIENT_ID,

          password:
            process.env.PAYPAL_SECRET,
        },

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
      });

    return response.data.access_token;
  };

module.exports = {
  getAccessToken,
};