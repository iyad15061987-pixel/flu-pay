const axios =
  require("axios");


// ==================================================
// GET PAYPAL ACCESS TOKEN
// ==================================================

const getAccessToken =
  async () => {

    const response =
      await axios({

        url:
          process.env.PAYPAL_ENV === "live"

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




// ==================================================
// VERIFY PAYPAL WEBHOOK
// ==================================================

const verifyPayPalWebhook =
  async (req) => {


    const accessToken =
      await getAccessToken();



    const response =
      await axios.post(


        process.env.PAYPAL_ENV === "live"

          ? "https://api-m.paypal.com/v1/notifications/verify-webhook-signature"

          : "https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature",



        {

          auth_algo:
            req.headers["paypal-auth-algo"],


          cert_url:
            req.headers["paypal-cert-url"],


          transmission_id:
            req.headers["paypal-transmission-id"],


          transmission_sig:
            req.headers["paypal-transmission-sig"],


          transmission_time:
            req.headers["paypal-transmission-time"],


          webhook_id:
            process.env.PAYPAL_WEBHOOK_ID,


          webhook_event:
            req.body,

        },


        {

          headers: {

            Authorization:
              `Bearer ${accessToken}`,


            "Content-Type":
              "application/json",

          },

        }

      );



    return (
      response.data.verification_status ===
      "SUCCESS"
    );

  };





module.exports = {

  getAccessToken,

  verifyPayPalWebhook,

};