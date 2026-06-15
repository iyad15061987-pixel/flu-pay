const { Resend } =
  require("resend");

const resend =
  new Resend(
    process.env
      .RESEND_API_KEY
  );

const sendMail =
  async ({
    to,
    subject,
    text,
  }) => {
    try {

      console.log(
  "EMAIL_FROM:",
  process.env.EMAIL_FROM
);

console.log(
  "RESEND KEY EXISTS:",
  !!process.env.RESEND_API_KEY
);

      const response =
        await resend.emails.send({
          from:
            process.env
              .EMAIL_FROM,

          to,

          subject,

          html: `
            <div style="font-family: Arial; padding:20px;">
              <h2>FlowPay</h2>

              <p>${text}</p>
            </div>
          `,
        });

      console.log(
  "RESEND RESPONSE:",
  JSON.stringify(response, null, 2)
);

      return response;

    } catch (err) {
      console.log(
        "❌ Email error:"
      );

      console.log(err);

      throw err;
    }
  };

module.exports =
  sendMail;