import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import logger from "../logger.server";

/**
 * App Proxy Route
 *
 * This route handles requests from your online store via the app proxy.
 * App proxy requests are automatically HMAC-validated by the authenticate.public method.
 *
 * To configure the app proxy:
 * 1. Go to your app settings in the Partner Dashboard
 * 2. Navigate to "App setup" → "App proxy"
 * 3. Set Subpath prefix: "apps" (or your choice)
 * 4. Set Subpath: "your-app-name"
 * 5. Set Proxy URL: https://your-app-url.com/proxy
 *
 * Requests to https://yourstore.myshopify.com/apps/your-app-name/* will be
 * proxied to https://your-app-url.com/proxy/*
 */

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    // Authenticate the proxy request (includes HMAC validation)
    const { session, admin } = await authenticate.public.appProxy(request);

    // Get the path after /proxy/
    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/").filter(Boolean);
    const proxyPath = pathSegments.slice(1).join("/"); // Remove "proxy" prefix

    // Example: Return shop information
    if (session) {
      return Response.json({
        success: true,
        shop: session.shop,
        path: proxyPath,
        message: "Authenticated app proxy request",
      });
    }

    // If no session, the request is still valid but from a logged-out user
    return Response.json({
      success: true,
      path: proxyPath,
      message: "Valid app proxy request (no session)",
    });
  } catch (error) {
    logger.error("App proxy authentication error:", error);
    return Response.json(
      {
        success: false,
        error: "Invalid proxy request",
      },
      { status: 401 },
    );
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    // Authenticate the proxy request
    const { session, admin } = await authenticate.public.appProxy(request);

    // Parse request body based on content type
    const contentLength = request.headers.get("content-length");
    let body: any = null;

    // Only parse body if there's actually content
    if (contentLength && parseInt(contentLength) > 0) {
      const contentType = request.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        body = await request.json();
      } else if (contentType.includes("application/x-www-form-urlencoded")) {
        const formData = await request.formData();
        body = Object.fromEntries(formData);
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const entries: Array<[string, FormDataEntryValue]> = [];
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          continue;
        }
        entries.push([key, value]);
      }
      body = Object.fromEntries(entries);
      } else {
        // For other content types, try to read as text
        body = await request.text();
      }
    }

    // Example: Handle different actions based on the request
    // You can add your own logic here

    return Response.json({
      success: true,
      shop: session?.shop,
      message: "Proxy action processed successfully",
      received: body,
    });
  } catch (error) {
    logger.error("App proxy action error:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to process proxy action",
      },
      { status: 500 },
    );
  }
};
