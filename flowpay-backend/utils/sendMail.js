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
        "✅ Email sent:",
        response.data?.id
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