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
      const eventId = params.id;

      let paymentValue = null;
      let selectedBatch = null;
      let eventEntry = null;

      // 1. Resolve Batch or Legacy Payment Option
      if (body.batch_id) {
        selectedBatch = await strapi.entityService.findOne(
          "api::batch.batch",
          body.batch_id,
          {
            populate: { product: { populate: ["event"] } },
          }
        );

        if (
          !selectedBatch ||
          !selectedBatch.product ||
          selectedBatch.product.event.id != eventId
        ) {
          return ctx.send(
            { status: "error", message: "Lote inválido para este evento" },
            400
          );
        }

        if (
          !selectedBatch.enabled ||
          !selectedBatch.product.enabled ||
          !selectedBatch.product.event
        ) {
          return ctx.send(
            { status: "error", message: "Este produto está desativado" },
            400
          );
        }

        // 1.1 Validity window check
        const now = new Date();
        if (
          selectedBatch.valid_from &&
          now < new Date(selectedBatch.valid_from)
        ) {
          return ctx.send(
            { status: "error", message: "Lote ainda não disponível" },
            400
          );
        }
        if (
          selectedBatch.valid_until &&
          now > new Date(selectedBatch.valid_until)
        ) {
          return ctx.send(
            { status: "error", message: "Lote esgotado (prazo encerrado)" },
            400
          );
        }

        // 1.2 Stock control (Confirmed + Recent Pending)
        if (selectedBatch.max_quantity) {
          const confirmedCount = await strapi.db
            .query("api::payment.payment")
            .count({
              where: {
                batch: selectedBatch.id,
                status: { $in: ["CONFIRMED", "PEDING_PAYMENT"] }, // Keeping typo from schema
              },
            });

          if (confirmedCount >= selectedBatch.max_quantity) {
            return ctx.send(
              { status: "error", message: "Esse produto já acabou!" },
              400
            );
          }
        }

        paymentValue = selectedBatch.value;
        eventEntry = selectedBatch.product.event;
      } else if (body.payment_option) {
        // Legacy flow
        eventEntry = await eventService.findOne(eventId, {
          populate: ["payment_option"],
        });

        if (!eventEntry) {
          return ctx.send(
            { status: "error", message: "Evento não encontrado" },
            404
          );
        }

        eventEntry.payment_option.forEach(({ id, value }) => {
          if (id === body.payment_option) {
            paymentValue = value;
          }
        });
      }

      if (!paymentValue) {
        return ctx.send(
          {
            status: "error",
            message: "Esse produto já acabou ou opção inválida!",
          },
          400
        );
      }

      // 2. Payment Integration
      let paymentIntegrationData = null;
      try {
        const response = await PixAiIntegration.createPayment({
          description: `Inscrição no evento ${eventEntry.name}: ${body.name} - ${body.email}`,
          value: paymentValue,
          token: eventEntry.pixai_token_integration,
        });

        paymentIntegrationData = response;
      } catch (err) {
        console.error("PixAiIntegration.createPayment err: ", err);
        return ctx.send({ err, message: "Error on payment integration" }, 400);
      }

      // 3. Create Payment Entry
      let paymentEntry = null;
      try {
        paymentEntry = await paymentService.create({
          data: {
            value: paymentValue,
            event: eventEntry.id,
            batch: selectedBatch ? selectedBatch.id : null,
            payment_identification:
              paymentIntegrationData.localPayment.payment_identification,
            pix_qr_code: paymentIntegrationData.localPayment.pix_qr_code,
            payment_data: paymentIntegrationData,
          },
        });
      } catch (err) {
        return ctx.send({ err, message: "Failed to create payment" }, 400);
      }

      // 4. Create Signup Entry
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

      return ctx.send(
        {
          ...signupEntry,
          qr_code: paymentEntry.pix_qr_code,
          payment_id: paymentEntry.id,
        },
        200
      );
    },
  };
});
