"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOrderData = void 0;
exports.generateProductData = generateProductData;
const faker_1 = require("@faker-js/faker");
function generateProductData() {
  return {
    title: faker_1.faker.commerce.productName(),
    body_html: `<strong>${faker_1.faker.commerce.productDescription()}</strong>`,
    vendor: faker_1.faker.company.name(),
    product_type: faker_1.faker.commerce.department(),
    variants: [
      {
        title: faker_1.faker.commerce.productName(),
        price: faker_1.faker.commerce.price({ min: 10, max: 100, dec: 2 }),
        sku: faker_1.faker.string.uuid(),
        inventory_quantity: faker_1.faker.number.int({ min: 1, max: 100 }),
      },
    ],
  };
}
function generateRandomMPN(length = 8) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ-/";
  let mpn = "";
  for (let i = 0; i < length; i++) {
    mpn += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return mpn;
}
const createLineItem = () => {
  return {
    priceSet: {
      shopMoney: {
        amount: faker_1.faker.commerce.price({ min: 20, max: 1500 }),
        currencyCode: "EUR",
      },
    },
    quantity: faker_1.faker.number.int({ min: 1, max: 3 }),
    requiresShipping: faker_1.faker.number.float({ min: 0, max: 1 }) >= 0.95 ? false : true,
    sku: generateRandomMPN(7),
    title: faker_1.faker.commerce.productName(),
  };
};
const generateOrderData = () => {
  const locations = [
    { name: "Big Poppa Warehouse", id: "gid://shopify/Location/93743448396" },
    { name: "Eshop Clowns", id: "gid://shopify/Location/93743481164" },
    { name: "Main Bros", id: "gid://shopify/Location/93294788940" },
  ];
  const shippingLines = [
    { title: "ACS Smartpoint Locker", price: "1.49" },
    { title: "BOX NOW Lockers", price: "3.00" },
    { title: "Με Courier", price: "3.00" },
    { title: "Με Courier", price: "0.00" },
    { title: "Local Delivery", price: "6.00" },
  ];
  const paymentMethods = [
    { title: "Cash on Delivery (COD)", status: "PENDING" },
    { title: "Bank Deposit", status: "PENDING" },
    { title: "Πληρωμή στο κατάστημα", status: "PENDING" },
    { title: "Viva.com Smart Checkout", status: "SUCCESS" },
    { title: "Klarna", status: "SUCCESS" },
  ];
  const location = locations[faker_1.faker.number.int({ min: 0, max: 2 })];
  const shippingLine = shippingLines[faker_1.faker.number.int({ min: 0, max: 4 })];
  const paymentMethod = paymentMethods[faker_1.faker.number.int({ min: 0, max: 4 })];
  const lineItems = faker_1.faker.helpers.multiple(createLineItem, {
    count: faker_1.faker.number.int({ min: 1, max: 5 }),
  });
  return {
    email: faker_1.faker.internet.email(),
    tags: [`anathesi:${location.name}`],
    shippingAddress: {
      address1: faker_1.faker.location.streetAddress(),
      city: faker_1.faker.location.city(),
      countryCode: "GR",
      firstName: faker_1.faker.person.firstName(),
      lastName: faker_1.faker.person.lastName(),
      phone: faker_1.faker.phone.number(),
      zip: faker_1.faker.location.zipCode("#####"),
    },
    fulfillment: {
      locationId: location.id,
    },
    shippingLines: [
      {
        title: shippingLine.title,
        priceSet: {
          shopMoney: { amount: shippingLine.price, currencyCode: "EUR" },
        },
      },
    ],
    lineItems,
    transactions: [
      {
        kind: "SALE",
        status: paymentMethod.status,
        amountSet: {
          shopMoney: {
            amount: (
              lineItems.reduce(
                (sum, item) => sum + +item.priceSet.shopMoney.amount * item.quantity,
                0
              ) + +shippingLine.price
            ).toFixed(2),
            currencyCode: "EUR",
          },
        },
        gateway: paymentMethod.title,
      },
    ],
  };
};
exports.generateOrderData = generateOrderData;
