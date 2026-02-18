'use strict';

/**
 * event controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::event.event', ({ strapi }) => ({
  async findOne(ctx) {
    const { id } = ctx.params;

    const isNumericString = /^\d+$/.test(id);
    if (isNumericString) {
      return await super.findOne(ctx);
    }

    const event = await strapi.db.query('api::event.event').findOne({
      where: {
        $or: [
          { slug: id },
          { uuid: id }
        ]
      }
    });

    if (!event) {
      return ctx.notFound();
    }

    ctx.params.id = event.id;
    return await super.findOne(ctx);
  },

  async update(ctx) {
    const { id } = ctx.params;

    const isNumericString = /^\d+$/.test(id);
    if (isNumericString) {
      return await super.update(ctx);
    }

    const event = await strapi.db.query('api::event.event').findOne({
      where: {
        $or: [
          { slug: id },
          { uuid: id }
        ]
      }
    });

    if (!event) {
      return ctx.notFound();
    }

    ctx.params.id = event.id;
    return await super.update(ctx);
  },

  async delete(ctx) {
    const { id } = ctx.params;

    const isNumericString = /^\d+$/.test(id);
    if (isNumericString) {
      return await super.delete(ctx);
    }

    const event = await strapi.db.query('api::event.event').findOne({
      where: {
        $or: [
          { slug: id },
          { uuid: id }
        ]
      }
    });

    if (!event) {
      return ctx.notFound();
    }

    ctx.params.id = event.id;
    return await super.delete(ctx);
  }
}));
