"use strict";

const { errors } = require("@strapi/utils");
const { PolicyError } = errors;

module.exports = {
  async beforeCreate(event) {
    const { data } = event;
    await validateBatchCapacity(data);
  },

  async beforeUpdate(event) {
    const { data, where } = event;

    // For update, we need to fetch the existing record to know the product/event context if not provided in data
    const existingBatch = await strapi.entityService.findOne(
      "api::batch.batch",
      where.id,
      {
        populate: { product: true },
      }
    );

    // Merge existing data with new data for validation
    const validationData = {
      ...existingBatch,
      ...data,
      id: where.id,
    };

    await validateBatchCapacity(validationData);
  },
};

async function validateBatchCapacity(data) {
  // 1. Find the product and event
  const product = await strapi.entityService.findOne(
    "api::product.product",
    data.product,
    {
      populate: { event: true },
    }
  );

  if (!product || !product.event) return;

  const event = product.event;
  if (!event.max_slots) return;

  // 2. Fetch all batches for this event to calculate current occupancy
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

  // Helper to count active payments (Confirmed + Pending)
  const countActivePayments = (batch) => {
    if (!batch.payments) return 0;
    return batch.payments.filter((p) =>
      ["CONFIRMED", "PEDING_PAYMENT"].includes(p.status)
    ).length;
  };

  // 3. Calculate occupancy considering open vs closed batches
  const processBatch = (batchData, isBeingEdited = false) => {
    const isExpired =
      batchData.valid_until && now > new Date(batchData.valid_until);
    const isEnabled = batchData.enabled !== false;
    const isOpen = isEnabled && !isExpired;

    const soldCount = isBeingEdited
      ? countActivePayments(batchData)
      : batchData.payments?.length || 0;
    // Note: if isBeingEdited, we already have the payments populated.
    // For the one being created/updated, we'll use the data provided.

    if (isOpen) {
      // Open batch: reserve the max_quantity or current sales if it somehow exceeded
      return Math.max(soldCount, batchData.max_quantity || 0);
    } else {
      // Closed batch: count only what was actually sold/is pending
      return soldCount;
    }
  };

  // Add occupancy from existing batches (excluding the one being updated)
  for (const b of allBatches) {
    if (data.id && b.id === data.id) continue;

    // We need to fetch payment count for each batch if not populated accurately
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

  // Add occupancy for the batch being created/updated
  const currentBatchSoldCount = data.id
    ? await strapi.db.query("api::payment.payment").count({
        where: {
          batch: data.id,
          status: { $in: ["CONFIRMED", "PEDING_PAYMENT"] },
        },
      })
    : 0;

  const isCurrentExpired = data.valid_until && now > new Date(data.valid_until);
  const isCurrentOpen = data.enabled !== false && !isCurrentExpired;

  if (isCurrentOpen) {
    eventOccupancy += Math.max(currentBatchSoldCount, data.max_quantity || 0);
  } else {
    eventOccupancy += currentBatchSoldCount;
  }

  // 4. Compare with Event.max_slots
  if (eventOccupancy > event.max_slots) {
    throw new PolicyError(
      `Capacidade excedida! A ocupação calculada (${eventOccupancy}) ultrapassa o limite do evento (${event.max_slots}). Dica: Lotes encerrados contam apenas as vendas reais.`
    );
  }
}
