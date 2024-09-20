module.exports = {
  config: {
    "api::signup.signup": {
      columns: [
        "id",
        "name",
        "email",
        "phone_number",
        "additional_information",
        "t_shirt_size",
        "createdAt"
      ],
      relation: {
        payment: {
          column: ["value", "status"],
        },
      },
      locale: "false",
    },
  },
};
