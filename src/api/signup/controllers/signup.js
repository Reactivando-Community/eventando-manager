"use strict";

/**
 * signup controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

const PixAiIntegration = require("../../../datasources/pixai");

module.exports = createCoreController("api::signup.signup", ({ strapi }) => {
  const eventService = strapi.service("api::event.event");
  const paymentService = strapi.service("api::payment.payment");
  const signupService = strapi.service("api::signup.signup");

  return {
    async customCreate(ctx) {
      const { params } = ctx;

      const { body } = ctx.request;

      let eventEntry = null;

      try {
        eventEntry = await eventService.findOne(params.id, {
          populate: ["payment_option"],
        });
      } catch (err) {
        return ctx.send(err, 500);
      }

      let paymentValue = null;

      eventEntry.payment_option.forEach(({ id, value }) => {
        if (id === body.payment_option) {
          paymentValue = value;
        }
      });

      if (!paymentValue) {
        return ctx.send(
          { status: "error", message: "Esse produto já acabou!" },
          400
        );
      }

      let paymentIntegrationData = null;

      try {
        const response = await PixAiIntegration.createPayment({
          description: `Inscrição no evento ${eventEntry.name}: ${body.name} - ${body.email}`,
          value: paymentValue,
          token: eventEntry.pixai_token_integration,
        });

        paymentIntegrationData = response;
      } catch (err) {
        return ctx.send({ err, message: "Error on payment integration" }, 400);
      }

      let paymentEntry = null;

      try {
        paymentEntry = await paymentService.create({
          data: {
            value: paymentValue,
            event: eventEntry.id,
            payment_identification:
              paymentIntegrationData.localPayment.payment_identification,
            pix_qr_code: paymentIntegrationData.localPayment.pix_qr_code,
            payment_data: paymentIntegrationData,
          },
        });
      } catch (err) {
        return ctx.send({ err, message: "Failed to create payment" }, 400);
      }

      let signupEntry = null;

      try {
        signupEntry = await signupService.create({
          data: {
            name: body.name,
            email: body.email,
            phone_number: body.phone_number,
            payment: paymentEntry.id,
            event: eventEntry.id,
            t_shirt_size: body.t_shirt_size,
            additional_information: body.additional_information,
          },
        });
      } catch (err) {
        return ctx.send({ err, message: "Failed to create signup" }, 400);
      }

      const payloadToSend = {
        ...signupEntry,
        qr_code: paymentEntry.pix_qr_code,
        payment_id: paymentEntry.id,
      };

      return ctx.send(payloadToSend, 200);
    },
  };
});
