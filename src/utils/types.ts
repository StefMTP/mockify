export interface CreateOrderResponse {
  orderCreate: {
    order: {
      id: string;
      name: string;
    };
    userErrors: {
      field: string[];
      message: string;
    }[];
  };
}

export interface CreateOrderInput {
  email: string;
  shippingAddress: {
    address1: string;
    city: string;
    countryCode: string;
    firstName: string;
    lastName: string;
    phone: string;
    zip: string;
  };
  shippingLines: {
    title: string;
    priceSet: {
      shopMoney: { amount: string; currencyCode: string };
    };
  }[];
  lineItems: {
    priceSet: {
      shopMoney: { amount: string; currencyCode: string };
    };
    quantity: number;
    requiresShipping: boolean;
    sku?: string;
    title?: string;
    varinantId?: string;
  }[];
  transactions: {
    kind: string;
    status: string;
    amountSet: {
      shopMoney: { amount: string; currencyCode: string };
    };
    gateway: string;
  }[];
  tags?: string[];
  fulfillment?: {
    locationId: string;
  };
}

export interface CreateOrderOptions {
  inventoryBehaviour: string;
  sendReceipt: boolean;
}

export interface ProductSetInput {
  title: string;
  descriptionHtml: string;
  productOptions: { name: string; values: { name: string }[] }[];
  productType: string;
  status: "ACTIVE" | "ARCHIVED" | "DRAFT";
  tags: string[];
  variants: {
    sku: string;
    barcode: string;
    price: string;
    compareAtPrice: string | null;
    inventoryPolicy: "CONTINUE" | "DENY";
    optionValues: { name: string; optionName: string }[];
  }[];
  vendor: string;
}

export interface ProductSetResponse {
  productSet: {
    product: {
      id: string;
      title: string;
    };
    userErrors: {
      field: string[];
      message: string;
    }[];
  };
}

export enum productStatus {
  ACTIVE = "ACTIVE",
  DRAFT = "DRAFT",
  ARCHIVED = "ARCHIVED",
}

export interface BulkOperationRunQueryResponse {
  bulkOperationRunQuery: {
    bulkOperation: {
      id: string;
    };
    userErrors: {
      field: string[];
      message: string;
    }[];
  };
}

export interface WebhookCreateMutationResponse {
  webhookSubscriptionCreate: {
    webhookSubscription: { id: string };
    userErrors: {
      field: string[];
      message: string;
    }[];
  };
}

export enum ShopifyWebhookTopics {
  APP_PURCHASES_ONE_TIME_UPDATE = "APP_PURCHASES_ONE_TIME_UPDATE",
  APP_SCOPES_UPDATE = "APP_SCOPES_UPDATE",
  APP_SUBSCRIPTIONS_APPROACHING_CAPPED_AMOUNT = "APP_SUBSCRIPTIONS_APPROACHING_CAPPED_AMOUNT",
  APP_SUBSCRIPTIONS_UPDATE = "APP_SUBSCRIPTIONS_UPDATE",
  APP_UNINSTALLED = "APP_UNINSTALLED",
  ATTRIBUTED_SESSIONS_FIRST = "ATTRIBUTED_SESSIONS_FIRST",
  ATTRIBUTED_SESSIONS_LAST = "ATTRIBUTED_SESSIONS_LAST",
  AUDIT_EVENTS_ADMIN_API_ACTIVITY = "AUDIT_EVENTS_ADMIN_API_ACTIVITY",
  BULK_OPERATIONS_FINISH = "BULK_OPERATIONS_FINISH",
  CARTS_CREATE = "CARTS_CREATE",
  CARTS_UPDATE = "CARTS_UPDATE",
  CHANNELS_DELETE = "CHANNELS_DELETE",
  CHECKOUTS_CREATE = "CHECKOUTS_CREATE",
  CHECKOUTS_DELETE = "CHECKOUTS_DELETE",
  CHECKOUTS_UPDATE = "CHECKOUTS_UPDATE",
  COLLECTIONS_CREATE = "COLLECTIONS_CREATE",
  COLLECTIONS_DELETE = "COLLECTIONS_DELETE",
  COLLECTIONS_UPDATE = "COLLECTIONS_UPDATE",
  COLLECTION_LISTINGS_ADD = "COLLECTION_LISTINGS_ADD",
  COLLECTION_LISTINGS_REMOVE = "COLLECTION_LISTINGS_REMOVE",
  COLLECTION_LISTINGS_UPDATE = "COLLECTION_LISTINGS_UPDATE",
  COLLECTION_PUBLICATIONS_CREATE = "COLLECTION_PUBLICATIONS_CREATE",
  COLLECTION_PUBLICATIONS_DELETE = "COLLECTION_PUBLICATIONS_DELETE",
  COLLECTION_PUBLICATIONS_UPDATE = "COLLECTION_PUBLICATIONS_UPDATE",
  COMPANIES_CREATE = "COMPANIES_CREATE",
  COMPANIES_DELETE = "COMPANIES_DELETE",
  COMPANIES_UPDATE = "COMPANIES_UPDATE",
  COMPANY_CONTACTS_CREATE = "COMPANY_CONTACTS_CREATE",
  COMPANY_CONTACTS_DELETE = "COMPANY_CONTACTS_DELETE",
  COMPANY_CONTACTS_UPDATE = "COMPANY_CONTACTS_UPDATE",
  COMPANY_CONTACT_ROLES_ASSIGN = "COMPANY_CONTACT_ROLES_ASSIGN",
  COMPANY_CONTACT_ROLES_REVOKE = "COMPANY_CONTACT_ROLES_REVOKE",
  COMPANY_LOCATIONS_CREATE = "COMPANY_LOCATIONS_CREATE",
  COMPANY_LOCATIONS_DELETE = "COMPANY_LOCATIONS_DELETE",
  COMPANY_LOCATIONS_UPDATE = "COMPANY_LOCATIONS_UPDATE",
  CUSTOMERS_CREATE = "CUSTOMERS_CREATE",
  CUSTOMERS_DELETE = "CUSTOMERS_DELETE",
  CUSTOMERS_DISABLE = "CUSTOMERS_DISABLE",
  CUSTOMERS_EMAIL_MARKETING_CONSENT_UPDATE = "CUSTOMERS_EMAIL_MARKETING_CONSENT_UPDATE",
  CUSTOMERS_ENABLE = "CUSTOMERS_ENABLE",
  CUSTOMERS_MARKETING_CONSENT_UPDATE = "CUSTOMERS_MARKETING_CONSENT_UPDATE",
  CUSTOMERS_MERGE = "CUSTOMERS_MERGE",
  CUSTOMERS_UPDATE = "CUSTOMERS_UPDATE",
  CUSTOMER_ACCOUNT_SETTINGS_UPDATE = "CUSTOMER_ACCOUNT_SETTINGS_UPDATE",
  CUSTOMER_GROUPS_CREATE = "CUSTOMER_GROUPS_CREATE",
  CUSTOMER_GROUPS_DELETE = "CUSTOMER_GROUPS_DELETE",
  CUSTOMER_GROUPS_UPDATE = "CUSTOMER_GROUPS_UPDATE",
  CUSTOMER_PAYMENT_METHODS_CREATE = "CUSTOMER_PAYMENT_METHODS_CREATE",
  CUSTOMER_PAYMENT_METHODS_REVOKE = "CUSTOMER_PAYMENT_METHODS_REVOKE",
  CUSTOMER_PAYMENT_METHODS_UPDATE = "CUSTOMER_PAYMENT_METHODS_UPDATE",
  CUSTOMER_TAGS_ADDED = "CUSTOMER_TAGS_ADDED",
  CUSTOMER_TAGS_REMOVED = "CUSTOMER_TAGS_REMOVED",
  DISCOUNTS_CREATE = "DISCOUNTS_CREATE",
  DISCOUNTS_DELETE = "DISCOUNTS_DELETE",
  DISCOUNTS_REDEEMCODE_ADDED = "DISCOUNTS_REDEEMCODE_ADDED",
  DISCOUNTS_REDEEMCODE_REMOVED = "DISCOUNTS_REDEEMCODE_REMOVED",
  DISCOUNTS_UPDATE = "DISCOUNTS_UPDATE",
  DISPUTES_CREATE = "DISPUTES_CREATE",
  DISPUTES_UPDATE = "DISPUTES_UPDATE",
  DOMAINS_CREATE = "DOMAINS_CREATE",
  DOMAINS_DESTROY = "DOMAINS_DESTROY",
  DOMAINS_UPDATE = "DOMAINS_UPDATE",
  DRAFT_ORDERS_CREATE = "DRAFT_ORDERS_CREATE",
  DRAFT_ORDERS_DELETE = "DRAFT_ORDERS_DELETE",
  DRAFT_ORDERS_UPDATE = "DRAFT_ORDERS_UPDATE",
  FULFILLMENTS_CREATE = "FULFILLMENTS_CREATE",
  FULFILLMENTS_UPDATE = "FULFILLMENTS_UPDATE",
  FULFILLMENT_EVENTS_CREATE = "FULFILLMENT_EVENTS_CREATE",
  FULFILLMENT_EVENTS_DELETE = "FULFILLMENT_EVENTS_DELETE",
  INVENTORY_ITEMS_CREATE = "INVENTORY_ITEMS_CREATE",
  INVENTORY_ITEMS_DELETE = "INVENTORY_ITEMS_DELETE",
  INVENTORY_ITEMS_UPDATE = "INVENTORY_ITEMS_UPDATE",
  INVENTORY_LEVELS_CONNECT = "INVENTORY_LEVELS_CONNECT",
  INVENTORY_LEVELS_DISCONNECT = "INVENTORY_LEVELS_DISCONNECT",
  INVENTORY_LEVELS_UPDATE = "INVENTORY_LEVELS_UPDATE",
  LOCALES_CREATE = "LOCALES_CREATE",
  LOCALES_UPDATE = "LOCALES_UPDATE",
  LOCATIONS_ACTIVATE = "LOCATIONS_ACTIVATE",
  LOCATIONS_CREATE = "LOCATIONS_CREATE",
  LOCATIONS_DEACTIVATE = "LOCATIONS_DEACTIVATE",
  LOCATIONS_DELETE = "LOCATIONS_DELETE",
  LOCATIONS_UPDATE = "LOCATIONS_UPDATE",
  MARKETS_CREATE = "MARKETS_CREATE",
  MARKETS_DELETE = "MARKETS_DELETE",
  MARKETS_UPDATE = "MARKETS_UPDATE",
  ORDERS_CANCELLED = "ORDERS_CANCELLED",
  ORDERS_CREATE = "ORDERS_CREATE",
  ORDERS_DELETE = "ORDERS_DELETE",
  ORDERS_EDITED = "ORDERS_EDITED",
  ORDERS_FULFILLED = "ORDERS_FULFILLED",
  ORDERS_PAID = "ORDERS_PAID",
  ORDERS_PARTIALLY_FULFILLED = "ORDERS_PARTIALLY_FULFILLED",
  ORDERS_RISK_ASSESSMENT_CHANGED = "ORDERS_RISK_ASSESSMENT_CHANGED",
  PRODUCTS_CREATE = "PRODUCTS_CREATE",
  PRODUCTS_DELETE = "PRODUCTS_DELETE",
  PRODUCTS_UPDATE = "PRODUCTS_UPDATE",
  TAX_SERVICES_CREATE = "TAX_SERVICES_CREATE",
  TAX_SERVICES_UPDATE = "TAX_SERVICES_UPDATE",
  VARIANTS_IN_STOCK = "VARIANTS_IN_STOCK",
  VARIANTS_OUT_OF_STOCK = "VARIANTS_OUT_OF_STOCK",
}
