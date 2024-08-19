"use strict";

/**
 * payment controller
 */

// d012e1f543eb327286ad1f5001cac58d9b26347a4f5c714217630b4013940a1529d6ad55ec7f22147e9f7df6a1957fb3cebdb8902a2ad0561b77e0dcfde2fd20b75f23818f7283c42f1fada843213722e6297f1dd877a064fe3bc3a427590f3877682af00d99747f783a68dc0b4c64427d0a86486d0805d972090e94aa300b7d

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::payment.payment", ({ strapi }) => {
  const paymentIntegrationService = strapi.service(
    "api::payment-integration.payment-integration"
  );

  const paymentService = strapi.service("api::payment.payment");

  const signupService = strapi.service("api::signup.signup");

  return {
    async integration(ctx) {
      const { body } = ctx.request;

      paymentIntegrationService.create({
        data: {
          payload: body,
        },
      });

      if (body.event === "payment_initiation/completed") {
        let paymentEntry = null;

        try {
          const response = await paymentService.find({
            filters: {
              payment_identification: body.payload.payment_identification,
            },
            populate: ["signup"],
          });

          paymentEntry = response.results[0];
        } catch (err) {
          return ctx.send("Error on load payment", 400);
        }

        try {
          await paymentService.update(paymentEntry.id, {
            data: {
              status: "CONFIRMED",
              confirmed_at: new Date(),
            },
          });
        } catch (err) {
          return ctx.send("Error on update payment", 400);
        }

        return ctx.send({ paymentEntry }, 200);
      }

      return ctx.send({ message: "event not found" }, 404);
    },

    async testEmail(ctx) {
      const { body } = ctx.request;

      const { email } = body;

      console.log({ email });

      try {
        await strapi
          .plugin("email-designer")
          .service("email")
          .sendTemplatedEmail(
            {
              // required
              to: email,

              // optional if /config/plugins.js -> email.settings.defaultFrom is set
              from: "Pedro da 8020 Digital <contato@8020digital.com.br>",

              // // optional if /config/plugins.js -> email.settings.defaultReplyTo is set
              // replyTo: "reply@example.com",

              // // optional array of files
              // attachments: [],
            },
            {
              // required - Ref ID defined in the template designer (won't change on import)
              templateReferenceId: 1,

              // If provided here will override the template's subject.
              // Can include variables like `Thank you for your order {{= USER.firstName }}!`
              // subject: `Thank you for your order`,
            },
            {
              // this object must include all variables you're using in your email template
              name: "pedro paulo",
              totalValue: "R$ 140,00",
              tshirtSize: "M",
            }
          );
      } catch (err) {
        strapi.log.debug("📺: ", err);
        return ctx.badRequest(null, err);
      }

      return ctx.send("OK", 200);
    },
  };
});
