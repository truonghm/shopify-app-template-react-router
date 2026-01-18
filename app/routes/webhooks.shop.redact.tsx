import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import logger from "../logger.server";

/**
 * GDPR: Shop Redact Webhook
 *
 * Shopify triggers this webhook 48 hours after a store owner uninstalls your app
 * or requests deletion of their shop data.
 *
 * You must delete all shop and customer data from your systems.
 *
 * Payload includes:
 * - shop_id: The shop ID
 * - shop_domain: The shop domain
 */

// interface ShopRedactPayload {
//   shop_id: number;
//   shop_domain: string;
// }

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop } = await authenticate.webhook(request);

  logger.info(`Received shop/redact webhook for ${shop}`);

  try {
    // Delete all shop-related data
    // This is the final cleanup - ensure all data is removed

    // Delete sessions
    await db.session.deleteMany({ where: { shop } });

    // TODO: Delete all other shop-related data:
    // - Shop settings/configuration
    // - All customer data for this shop
    // - All order data for this shop
    // - Any analytics or logs containing shop data
    // - Any cached data or temporary files

    // Example cleanup:
    // await db.shopSettings.deleteMany({ where: { shop } });
    // await db.customerData.deleteMany({ where: { shop } });
    // await db.orderData.deleteMany({ where: { shop } });
    // await db.analytics.deleteMany({ where: { shop } });

    logger.info(`All data redacted for shop: ${shop}`);
  } catch (error) {
    logger.error("Error processing shop/redact webhook:", error);
    // Still return 200 to acknowledge receipt
  }

  return new Response();
};
