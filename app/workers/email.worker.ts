import { Job } from "bullmq";
import { createWorker } from "../queue.server";
import { EmailJobData } from "../queues/email.server";
import logger from "../logger.server";

// Email processor function
async function processEmailJob(job: Job<EmailJobData>) {
  const { to, subject, body, shop } = job.data;

  logger.info(`Processing email job ${job.id}:`, {
    to,
    subject,
    shop,
  });

  try {
    // TODO: Replace with actual email sending logic (SendGrid, AWS SES, etc.)
    // For now, we'll just simulate sending an email
    await simulateSendEmail(to, subject, body);

    logger.info(`Email sent successfully to ${to}`);
    return { success: true, to, subject };
  } catch (error) {
    logger.error(`Failed to send email to ${to}:`, error);
    throw error; // This will trigger BullMQ's retry mechanism
  }
}

// Simulate email sending (replace with actual email service)
async function simulateSendEmail(
  to: string,
  subject: string,
  body: string,
): Promise<void> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate occasional failures for testing retry mechanism
  if (Math.random() < 0.1) {
    throw new Error("Simulated email service error");
  }

  logger.debug(`[SIMULATED EMAIL]
To: ${to}
Subject: ${subject}
Body: ${body}
`);
}

// Create and export the worker
export const emailWorker = createWorker<EmailJobData>(
  "email",
  processEmailJob,
  {
    concurrency: 3,
  },
);

// Worker event handlers
emailWorker.on("completed", (job) => {
  logger.info(`Email job ${job.id} completed successfully`);
});

emailWorker.on("failed", (job, err) => {
  logger.error(`Email job ${job?.id} failed:`, err.message);
});

emailWorker.on("error", (err) => {
  logger.error("Email worker error:", err);
});

logger.info("Email worker started and listening for jobs");
