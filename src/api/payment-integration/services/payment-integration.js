'use strict';

/**
 * payment-integration service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::payment-integration.payment-integration');
