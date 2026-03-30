"use strict";

const { errors } = require("@strapi/utils");
const { PolicyError } = errors;

module.exports = {
  async beforeCreate(event) {
    try {
      const { data } = event.params;
      if (!data) return;

      // Extract product ID — Strapi v4 may pass relations as connect objects
      let productId = data.product;
      if (productId && typeof productId === "object") {
        if (Array.isArray(productId.connect) && productId.connect.length > 0) {
          const first = productId.connect[0];
          productId = typeof first === "object" ? first.id : first;
        } else if (productId.id) {
          productId = productId.id;
        } else {
          productId = null;
        }
      }
      if (!productId) return;
      await validateBatchCapacity({ ...data, product: productId });
    } catch (err) {
      if (err instanceof PolicyError) throw err;
      strapi.log.error("[batch lifecycle beforeCreate] Error:", err.message);
    }
  },

  async beforeUpdate(event) {
    try {
      const { data, where } = event.params;
      if (!data || !where) return;

      const existingBatch = await strapi.entityService.findOne(
        "api::batch.batch",
        where.id,
        { populate: { product: true } }
      );

      if (!existingBatch) return;

      let productId =
        data.product ||
        (existingBatch.product && existingBatch.product.id) ||
        null;
      if (productId && typeof productId === "object") {
        if (Array.isArray(productId.connect) && productId.connect.length > 0) {
          const first = productId.connect[0];
          productId = typeof first === "object" ? first.id : first;
        } else if (productId.id) {
          productId = productId.id;
        } else {
          productId = null;
        }
      }
      if (!productId) return;

      const validationData = {
        ...existingBatch,
        ...data,
        product: productId,
        id: where.id,
      };

      await validateBatchCapacity(validationData);
    } catch (err) {
      if (err instanceof PolicyError) throw err;
      strapi.log.error("[batch lifecycle beforeUpdate] Error:", err.message);
    }
  },
};

async function validateBatchCapacity(data) {
  const product = await strapi.entityService.findOne(
    "api::product.product",
    data.product,
    { populate: { event: true } }
  );

  if (!product || !product.event) return;

  const event = product.event;
  if (!event.max_slots) return;

  const allBatches = await strapi.entityService.findMany("api::batch.batch", {
    filters: {
      product: {
        event: event.id,
      },
    },
    populate: { payments: true },
  });

  const now = new Date();
  let eventOccupancy = 0;

  for (const b of allBatches) {
    if (data.id && b.id === data.id) continue;

    const soldCount = await strapi.db.query("api::payment.payment").count({
      where: {
        batch: b.id,
        status: { $in: ["CONFIRMED", "PEDING_PAYMENT"] },
      },
    });

    const isExpired = b.valid_until && now > new Date(b.valid_until);
    const isOpen = b.enabled && !isExpired;

    if (isOpen) {
      eventOccupancy += Math.max(soldCount, b.max_quantity || 0);
    } else {
      eventOccupancy += soldCount;
    }
  }

  const currentBatchSoldCount = data.id
    ? await strapi.db.query("api::payment.payment").count({
        where: {
          batch: data.id,
          status: { $in: ["CONFIRMED", "PEDING_PAYMENT"] },
        },
      })
    : 0;

  const isCurrentExpired =
    data.valid_until && now > new Date(data.valid_until);
  const isCurrentOpen = data.enabled !== false && !isCurrentExpired;

  if (isCurrentOpen) {
    eventOccupancy += Math.max(currentBatchSoldCount, data.max_quantity || 0);
  } else {
    eventOccupancy += currentBatchSoldCount;
  }

  if (eventOccupancy > event.max_slots) {
    throw new PolicyError(
      `Capacidade excedida! A ocupação calculada (${eventOccupancy}) ultrapassa o limite do evento (${event.max_slots}). Dica: Lotes encerrados contam apenas as vendas reais.`
    );
  }
}
