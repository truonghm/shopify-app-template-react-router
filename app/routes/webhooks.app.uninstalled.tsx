import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { queueEmail } from "../queues/email.server";
import logger from "../logger.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  logger.info(`Received ${topic} webhook for ${shop}`);

  try {
    // Webhook requests can trigger multiple times and after an app has already been uninstalled.
    // If this webhook already ran, the session may have been deleted previously.
    if (session) {
      // Delete all sessions for this shop
      await db.session.deleteMany({ where: { shop } });

      // TODO: Add any additional cleanup logic here:
      // - Cancel active subscriptions
      // - Archive or delete shop-specific data
      // - Update analytics/metrics

      // Example: Queue a notification email
      await queueEmail({
        to: "admin@yourapp.com",
        subject: `App uninstalled: ${shop}`,
        body: `The app has been uninstalled from shop: ${shop}`,
        shop,
      });

      logger.info(`Successfully cleaned up data for shop: ${shop}`);
    } else {
      logger.info(
        `Webhook already processed or session not found for shop: ${shop}`,
      );
    }
  } catch (error) {
    logger.error(`Error processing app/uninstalled webhook for ${shop}:`, error);
    // Still return 200 to acknowledge receipt to prevent retries
  }

  return new Response();
};
