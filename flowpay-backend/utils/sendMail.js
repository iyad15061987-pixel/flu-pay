const { Resend } =
  require("resend");

let resend = null;

if (
  process.env.RESEND_API_KEY
) {
  resend = new Resend(
    process.env.RESEND_API_KEY
  );
}

const sendMail =
  async ({
    to,
    subject,
    text,
  }) => {

    try {

      if (!resend) {

        console.log(
          "RESEND DISABLED"
        );

        return {
          success: true,
        };
      }

      const response =
        await resend.emails.send({
          from:
            process.env.EMAIL_FROM,

          to,

          subject,

          html: `
            <div style="font-family:Arial;padding:20px;">
              <h2>FlowPay</h2>
              <p>${text}</p>
            </div>
          `,
        });

      return response;

    } catch (err) {

      console.log(
        "Email error:"
      );

      console.log(err);

      return null;
    }
  };

module.exports =
  sendMail;