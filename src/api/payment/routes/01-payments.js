module.exports = {
  routes: [
    {
      // Path defined with an URL parameter
      method: "POST",
      path: "/payment/integration",
      handler: "payment.integration",
      config: {
        auth: false,
      },
    },
    {
      // Path defined with an URL parameter
      method: "POST",
      path: "/payment/email",
      handler: "payment.testEmail",
      config: {
        auth: false,
      },
    },
    {
      // Path defined with an URL parameter
      method: "POST",
      path: "/payment/resend-email",
      handler: "payment.resendEmail",
      config: {
        auth: false,
      },
    },
  ],
};
