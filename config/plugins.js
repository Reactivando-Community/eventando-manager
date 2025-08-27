module.exports = () => ({
  email: {
    config: {
      provider: "nodemailer",
      providerOptions: {
        host: "smtp.mailgun.org", // Mailgun's SMTP server
        port: 587,
        auth: {
          user: "eventando@8020digital.com.br",
          pass: "F1r3wall@0212",
        },
        secure: false,
      },
      settings: {
        defaultFrom: "contato@8020digital.com.br",
        defaultReplyTo: "contato@8020digital.com.br",
      },
    },
  },
});
