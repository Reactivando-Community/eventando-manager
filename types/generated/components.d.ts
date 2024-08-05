import type { Schema, Attribute } from '@strapi/strapi';

export interface PaymentPaymentOptions extends Schema.Component {
  collectionName: 'components_payment_payment_options';
  info: {
    displayName: 'Payment Options';
    icon: 'calendar';
  };
  attributes: {
    name: Attribute.String;
    value: Attribute.BigInteger;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'payment.payment-options': PaymentPaymentOptions;
    }
  }
}
