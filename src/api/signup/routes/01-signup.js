module.exports = {
  routes: [
    {
      // Path defined with an URL parameter
      method: "POST",
      path: "/signup/:id",
      handler: "signup.customCreate",
      config: {
        auth: false,
      },
    },
  ],
};
