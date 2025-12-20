import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { queueEmail } from "../queues/email.server";
import logger from "../logger.server";

/**
 * GDPR: Customer Data Request Webhook
 *
 * Shopify triggers this webhook when a customer requests their data.
 * You must provide the customer's data within 30 days.
 *
 * Payload includes:
 * - shop_id: The shop ID
 * - shop_domain: The shop domain
 * - customer: Customer object with id, email, phone
 * - orders_requested: Array of order IDs to include
 */

interface DataRequestPayload {
  shop_id: number;
  shop_domain: string;
  customer: {
    id: number;
    email: string;
    phone: string | null;
  };
  orders_requested: number[];
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload } = await authenticate.webhook(request);
  const data = payload as DataRequestPayload;

  logger.info(`Received customers/data_request webhook for ${shop}`);
  logger.info(`Customer ID: ${data.customer.id}, Email: ${data.customer.email}`);

  try {
    // TODO: Implement data collection logic
    // 1. Gather all customer data stored in your app
    // 2. Include data related to the requested order IDs
    // 3. Format the data according to GDPR requirements
    // 4. Send the data to the customer (email or download link)

    // Example: Queue an email notification for manual processing
    await queueEmail({
      to: "privacy@yourapp.com",
      subject: `GDPR Data Request: Customer ${data.customer.email}`,
      body: `
A customer has requested their data from shop: ${shop}

Customer Details:
- ID: ${data.customer.id}
- Email: ${data.customer.email}
- Phone: ${data.customer.phone || "N/A"}

Orders Requested: ${data.orders_requested.join(", ") || "None"}

Please process this request within 30 days as required by GDPR.
      `,
      shop,
    });

    logger.info(`Data request queued for processing: ${data.customer.email}`);
  } catch (error) {
    logger.error("Error processing customers/data_request webhook:", error);
    // Still return 200 to acknowledge receipt
  }

  return new Response();
};
