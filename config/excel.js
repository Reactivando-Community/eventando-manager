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
      ],
      relation: {
        payment: {
          column: ["value"],
        },
      },
      locale: "false",
    },
  },
};
