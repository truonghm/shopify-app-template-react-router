import { createQueue } from "../queue.server";

export interface EmailJobData {
  to: string;
  subject: string;
  body: string;
  shop?: string;
}

// Create the email queue
export const emailQueue = createQueue<EmailJobData>("email");

// Helper function to add an email job to the queue
export async function queueEmail(data: EmailJobData) {
  return await emailQueue.add("send-email", data, {
    priority: 1,
  });
}

// Helper function to add a high-priority email job
export async function queueUrgentEmail(data: EmailJobData) {
  return await emailQueue.add("send-urgent-email", data, {
    priority: 10,
    attempts: 5,
  });
}
