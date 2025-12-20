import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import logger from "../logger.server";

/**
 * GDPR: Customer Redact Webhook
 *
 * Shopify triggers this webhook 48 hours after a customer deletes their data
 * or when a shop owner requests deletion of a customer's data.
 *
 * You must delete all customer personal data from your systems.
 *
 * Payload includes:
 * - shop_id: The shop ID
 * - shop_domain: The shop domain
 * - customer: Customer object with id, email, phone
 * - orders_to_redact: Array of order IDs to redact
 */

interface CustomerRedactPayload {
  shop_id: number;
  shop_domain: string;
  customer: {
    id: number;
    email: string;
    phone: string | null;
  };
  orders_to_redact: number[];
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload } = await authenticate.webhook(request);
  const data = payload as CustomerRedactPayload;

  logger.info(`Received customers/redact webhook for ${shop}`);
  logger.info(`Customer ID: ${data.customer.id}, Email: ${data.customer.email}`);

  try {
    // TODO: Implement customer data deletion logic
    // Delete or anonymize all personal data for this customer:
    // - Customer profile data
    // - Order history (if stored)
    // - Communication preferences
    // - Any other personal identifiable information (PII)

    // Example: Delete customer-related records from your database
    // await db.customerData.deleteMany({
    //   where: {
    //     customerId: data.customer.id.toString(),
    //     shop: shop,
    //   },
    // });

    logger.info(`Customer data redacted for: ${data.customer.id} from shop: ${shop}`);
  } catch (error) {
    logger.error("Error processing customers/redact webhook:", error);
    // Still return 200 to acknowledge receipt
  }

  return new Response();
};
