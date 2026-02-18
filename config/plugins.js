module.exports = ({ env }) => ({
  email: {
    config: {
      provider: "nodemailer",
      providerOptions: {
        host: env("SMTP_HOST", "smtp.mailgun.org"),
        port: env.int("SMTP_PORT", 587),
        auth: {
          user: env("SMTP_USERNAME"),
          pass: env("SMTP_PASSWORD"),
        },
        secure: false,
      },
      settings: {
        defaultFrom: env("EMAIL_FROM", "contato@8020digital.com.br"),
        defaultReplyTo: env("EMAIL_REPLY_TO", "contato@8020digital.com.br"),
      },
    },
  },
});
