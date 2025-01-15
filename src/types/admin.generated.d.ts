/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as AdminTypes from './admin.types';

export type GetLocationsQueryVariables = AdminTypes.Exact<{ [key: string]: never; }>;


export type GetLocationsQuery = { locations: { nodes: Array<Pick<AdminTypes.Location, 'id' | 'name'>> } };

export type GetTranslatableResourcesQueryVariables = AdminTypes.Exact<{
  resourceType: AdminTypes.TranslatableResourceType;
}>;


export type GetTranslatableResourcesQuery = { translatableResources: { nodes: Array<{ translatableContent: Array<Pick<AdminTypes.TranslatableContent, 'key' | 'value'>> }> } };

export type CreateOrderMutationVariables = AdminTypes.Exact<{
  order: AdminTypes.OrderCreateOrderInput;
  options?: AdminTypes.InputMaybe<AdminTypes.OrderCreateOptionsInput>;
}>;


export type CreateOrderMutation = { orderCreate?: AdminTypes.Maybe<{ userErrors: Array<Pick<AdminTypes.OrderCreateUserError, 'field' | 'message'>>, order?: AdminTypes.Maybe<Pick<AdminTypes.Order, 'id' | 'name'>> }> };

export type CreateProductMutationVariables = AdminTypes.Exact<{
  productSet: AdminTypes.ProductSetInput;
  synchronous: AdminTypes.Scalars['Boolean']['input'];
}>;


export type CreateProductMutation = { productSet?: AdminTypes.Maybe<{ product?: AdminTypes.Maybe<Pick<AdminTypes.Product, 'id' | 'title'>>, userErrors: Array<Pick<AdminTypes.ProductSetUserError, 'field' | 'message'>> }> };

export type GetProductVariantsQueryVariables = AdminTypes.Exact<{
  cursor?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
}>;


export type GetProductVariantsQuery = { productVariants: { nodes: Array<Pick<AdminTypes.ProductVariant, 'id' | 'price' | 'compareAtPrice'>>, pageInfo: Pick<AdminTypes.PageInfo, 'endCursor' | 'hasNextPage'> } };

export type GetProductsQueryVariables = AdminTypes.Exact<{
  cursor?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
}>;


export type GetProductsQuery = { products: { nodes: Array<(
      Pick<AdminTypes.Product, 'id' | 'title' | 'productType' | 'vendor' | 'description' | 'tags' | 'handle'>
      & { featuredMedia?: AdminTypes.Maybe<{ image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url' | 'id'>> }>, options: Array<Pick<AdminTypes.ProductOption, 'name' | 'values'>>, variants: { nodes: Array<(
          Pick<AdminTypes.ProductVariant, 'id' | 'price' | 'compareAtPrice' | 'sku' | 'barcode' | 'inventoryQuantity' | 'inventoryPolicy'>
          & { image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'id' | 'url'>>, selectedOptions: Array<Pick<AdminTypes.SelectedOption, 'name' | 'value'>>, inventoryItem: (
            Pick<AdminTypes.InventoryItem, 'tracked'>
            & { measurement: { weight?: AdminTypes.Maybe<Pick<AdminTypes.Weight, 'unit' | 'value'>> } }
          ) }
        )> } }
    )>, pageInfo: Pick<AdminTypes.PageInfo, 'hasNextPage' | 'endCursor' | 'hasPreviousPage' | 'startCursor'> } };

export type RunBulkOperationMutationVariables = AdminTypes.Exact<{
  query: AdminTypes.Scalars['String']['input'];
}>;


export type RunBulkOperationMutation = { bulkOperationRunQuery?: AdminTypes.Maybe<{ bulkOperation?: AdminTypes.Maybe<Pick<AdminTypes.BulkOperation, 'id'>>, userErrors: Array<Pick<AdminTypes.BulkOperationUserError, 'field' | 'message'>> }> };

export type CreateWebhookMutationVariables = AdminTypes.Exact<{
  topic: AdminTypes.WebhookSubscriptionTopic;
  webhookSubscription: AdminTypes.WebhookSubscriptionInput;
}>;


export type CreateWebhookMutation = { webhookSubscriptionCreate?: AdminTypes.Maybe<{ webhookSubscription?: AdminTypes.Maybe<Pick<AdminTypes.WebhookSubscription, 'id'>> }> };

interface GeneratedQueryTypes {
  "#graphql\n      query GetLocations {\n        locations(first: 10) {\n          nodes {\n            id\n            name\n          }\n        }\n      }": {return: GetLocationsQuery, variables: GetLocationsQueryVariables},
  "#graphql\n      query GetTranslatableResources($resourceType: TranslatableResourceType!) {\n        translatableResources(first: 10, resourceType: $resourceType) {\n          nodes {\n            translatableContent {\n              key\n              value\n            }\n          }\n        }\n     }": {return: GetTranslatableResourcesQuery, variables: GetTranslatableResourcesQueryVariables},
  "#graphql\n      query GetProductVariants($cursor: String) {\n        productVariants(first: 250, after: $cursor) {\n            nodes {\n              id\n              price\n              compareAtPrice\n            }\n            pageInfo {\n              endCursor\n              hasNextPage\n            }\n        }\n      }": {return: GetProductVariantsQuery, variables: GetProductVariantsQueryVariables},
  "#graphql\n        query GetProducts($cursor: String) {\n        products(first: 250, after: $cursor) {\n          nodes {\n            id\n            title\n            featuredMedia {\n              ... on MediaImage {\n               image {\n                url\n                id\n               }\n              }\n            }\n            productType\n            vendor\n            description\n            tags\n            handle\n            options {\n              name\n              values\n            }\n            variants (first: 100) {\n                nodes {\n                    id\n                    price\n                    compareAtPrice\n                    sku\n                    barcode\n                    image {\n                        id\n                        url\n                    }\n                    selectedOptions {\n                        name\n                        value\n                    }\n                    inventoryQuantity\n                    inventoryPolicy\n                    inventoryItem {\n                        measurement {\n                            weight {\n                                unit\n                                value\n                            }\n                        }\n                        tracked\n                    }\n                }\n            }\n          }\n          pageInfo {\n            hasNextPage\n            endCursor\n            hasPreviousPage\n            startCursor\n          }\n    }\n}\n      ": {return: GetProductsQuery, variables: GetProductsQueryVariables},
}

interface GeneratedMutationTypes {
  "#graphql\n      mutation CreateOrder($order: OrderCreateOrderInput!, $options: OrderCreateOptionsInput) {\n        orderCreate(order: $order, options: $options) {\n          userErrors {\n            field\n            message\n          }\n          order {\n            id\n            name\n          }\n        }\n      }": {return: CreateOrderMutation, variables: CreateOrderMutationVariables},
  "#graphql\n      mutation createProduct($productSet: ProductSetInput!, $synchronous: Boolean!) {\n        productSet(synchronous: $synchronous, input: $productSet) {\n          product {\n            id\n            title\n          }\n          userErrors {\n            field\n            message\n          }\n        }\n      }": {return: CreateProductMutation, variables: CreateProductMutationVariables},
  "#graphql\n      mutation RunBulkOperation($query: String!) {\n        bulkOperationRunQuery(\n          query: $query\n        ) {\n          bulkOperation {\n            id\n          }\n          userErrors {\n            field\n            message\n          }\n        }\n      }": {return: RunBulkOperationMutation, variables: RunBulkOperationMutationVariables},
  "#graphql\n      mutation createWebhook($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {\n        webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {\n          webhookSubscription {\n            id\n          }\n        }\n      }": {return: CreateWebhookMutation, variables: CreateWebhookMutationVariables},
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
