import winston from "winston";
import path from "path";

const logLevel = process.env.LOG_LEVEL || "info";
const logFilePath = process.env.LOG_FILE_PATH || "./logs/app.log";

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

// Console format for development (more readable)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  }),
);

// Create transports array
const transports: winston.transport[] = [
  // Console transport (always enabled)
  new winston.transports.Console({
    format: consoleFormat,
  }),
];

// Add file transport in production
if (process.env.NODE_ENV === "production") {
  transports.push(
    new winston.transports.File({
      filename: path.join(process.cwd(), logFilePath),
      format: logFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
  );

  // Separate file for errors
  transports.push(
    new winston.transports.File({
      filename: path.join(process.cwd(), "logs/error.log"),
      level: "error",
      format: logFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
  );
}

// Create the logger
const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  transports,
  // Don't exit on handled exceptions
  exitOnError: false,
});

// Log unhandled exceptions and rejections
if (process.env.NODE_ENV === "production") {
  logger.exceptions.handle(
    new winston.transports.File({
      filename: path.join(process.cwd(), "logs/exceptions.log"),
    }),
  );

  logger.rejections.handle(
    new winston.transports.File({
      filename: path.join(process.cwd(), "logs/rejections.log"),
    }),
  );
}

// Create child logger for specific contexts
export function createContextLogger(context: string) {
  return logger.child({ context });
}

// Export the logger instance
export default logger;

// Export log level constants for convenience
export const LogLevel = {
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
  HTTP: "http",
  VERBOSE: "verbose",
  DEBUG: "debug",
  SILLY: "silly",
} as const;
