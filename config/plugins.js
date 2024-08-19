module.exports = () => ({
  email: {
    config: {
      provider: "nodemailer",
      providerOptions: {
        host: "smtps.uhserver.com",
        port: 465,
        auth: {
          user: "contato@8020digital.com.br",
          pass: "F1r3wall@0212",
        },
        secure: true
      },
      settings: {
        defaultFrom: "contato@8020digital.com.br",
        defaultReplyTo: "contato@8020digital.com.br",
      },
    },
  },
});
