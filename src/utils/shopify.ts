import { AdminApiClient, createAdminApiClient } from "@shopify/admin-api-client";
import config from "./config.js";
import {
  Maybe,
  OrderCreateOptionsInput,
  OrderCreateOrderInput,
  ProductSetInput,
  ProductVariant,
  TranslatableResourceType,
  WebhookSubscriptionFormat,
  WebhookSubscriptionTopic,
} from "../types/admin.types.js";

export default class ShopifyClient {
  client: AdminApiClient;

  constructor() {
    this.client = createAdminApiClient({
      storeDomain: `${config.shop}.myshopify.com`,
      apiVersion: "2024-10",
      accessToken: config.accessToken,
    });
  }

  async getLocations() {
    const { data, errors } = await this.client.request(`#graphql
      query GetLocations {
        locations(first: 10) {
          nodes {
            id
            name
          }
        }
      }`);

    if (errors) {
      throw new Error(JSON.stringify(errors, null, 2));
    }

    return data!.locations.nodes;
  }

  async getTranslatableResources(resourceType: TranslatableResourceType) {
    const { data, errors } = await this.client.request(
      `#graphql
      query GetTranslatableResources($resourceType: TranslatableResourceType!) {
        translatableResources(first: 10, resourceType: $resourceType) {
          nodes {
            translatableContent {
              key
              value
            }
          }
        }
     }`,
      { variables: { resourceType } }
    );

    if (errors) {
      throw new Error(JSON.stringify(errors, null, 2));
    }

    return data!.translatableResources.nodes.flatMap((node) =>
      node.translatableContent.filter((content) => content.key == "name" && content.value)
    );
  }

  async createOrderMutation(order: OrderCreateOrderInput, options: OrderCreateOptionsInput) {
    const { data, errors, extensions } = await this.client.request(
      `#graphql
      mutation CreateOrder($order: OrderCreateOrderInput!, $options: OrderCreateOptionsInput) {
        orderCreate(order: $order, options: $options) {
          userErrors {
            field
            message
          }
          order {
            id
            name
          }
        }
      }`,
      { variables: { order, options } }
    );

    if (errors) {
      throw new Error(JSON.stringify(errors, null, 2));
    }
    if (!data?.orderCreate) {
      throw new Error("No data returned from orderCreate mutation");
    }
    if (data.orderCreate.userErrors?.length) {
      throw new Error(JSON.stringify(data.orderCreate.userErrors, null, 2));
    }

    return { order: data.orderCreate.order!, extensions };
  }

  async productSetMutation(productSet: ProductSetInput, synchronous: boolean) {
    const { data, errors, extensions } = await this.client.request(
      `#graphql
      mutation createProduct($productSet: ProductSetInput!, $synchronous: Boolean!) {
        productSet(synchronous: $synchronous, input: $productSet) {
          product {
            id
            title
          }
          userErrors {
            field
            message
          }
        }
      }`,
      { variables: { synchronous, productSet } }
    );

    if (errors) {
      throw new Error(JSON.stringify(errors, null, 2));
    }
    if (!data?.productSet) {
      throw new Error("No data returned from productSet mutation");
    }
    if (data.productSet.userErrors?.length) {
      throw new Error(JSON.stringify(data.productSet.userErrors, null, 2));
    }

    return { product: data.productSet.product!, extensions };
  }

  async getProductVariants(cursor: Maybe<string> | undefined) {
    const { data, errors } = await this.client.request(
      `#graphql
      query GetProductVariants($cursor: String) {
        productVariants(first: 250, after: $cursor) {
            nodes {
              id
              price
              compareAtPrice
            }
            pageInfo {
              endCursor
              hasNextPage
            }
        }
      }`,
      { variables: { cursor } }
    );

    if (errors) {
      throw new Error(JSON.stringify(errors, null, 2));
    }

    return data!.productVariants;
  }

  async getAllProductVariants() {
    let cursor: Maybe<string> | undefined = null;
    let hasNextPage = true;
    let allVariants: Pick<ProductVariant, "id" | "price" | "compareAtPrice">[] = [];

    while (hasNextPage) {
      const { nodes, pageInfo } = await this.getProductVariants(cursor);
      allVariants = allVariants.concat(nodes);
      cursor = pageInfo.endCursor;
      hasNextPage = pageInfo.hasNextPage;
    }

    return allVariants;
  }

  async bulkOperationRunQuery(query: string) {
    const { data, errors } = await this.client.request(
      `#graphql
      mutation RunBulkOperation($query: String!) {
        bulkOperationRunQuery(
          query: $query
        ) {
          bulkOperation {
            id
          }
          userErrors {
            field
            message
          }
        }
      }`,
      { variables: { query } }
    );

    if (errors) {
      throw new Error(JSON.stringify(errors, null, 2));
    }
    if (!data?.bulkOperationRunQuery) {
      throw new Error("No data returned from bulkOperationRunQuery mutation");
    }

    if (data.bulkOperationRunQuery.userErrors?.length) {
      throw new Error(JSON.stringify(data.bulkOperationRunQuery.userErrors, null, 2));
    }

    return data.bulkOperationRunQuery.bulkOperation!.id;
  }

  async bulkOperationProductsQuery() {
    const query = `{
      productVariants {
        edges {
          node {
            id
          }
        }
      }
    }`;

    return await this.bulkOperationRunQuery(query);
  }

  async webhookCreateMutation(topic: WebhookSubscriptionTopic, callbackUrl: string) {
    const { data, errors } = await this.client.request(
      `#graphql
      mutation createWebhook($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
        webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
          webhookSubscription {
            id
          }
        }
      }`,
      {
        variables: {
          topic,
          webhookSubscription: { callbackUrl, format: WebhookSubscriptionFormat.Json },
        },
      }
    );

    if (errors) {
      throw new Error(JSON.stringify(errors, null, 2));
    }
    if (!data?.webhookSubscriptionCreate) {
      throw new Error("No data returned from webhookSubscriptionCreate mutation");
    }

    return data.webhookSubscriptionCreate.webhookSubscription!;
  }
}
