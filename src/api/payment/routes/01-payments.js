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
  ],
};
