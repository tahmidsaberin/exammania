import winston from "winston";
import { env } from "../config/env";

const { combine, timestamp, colorize, printf, json } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: "HH:mm:ss" }),
  printf(({ level, message, timestamp: ts, ...meta }) => {
    const m = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${ts} [${level}] ${message}${m}`;
  })
);

export const logger = winston.createLogger({
  level: env.NODE_ENV === "test" ? "silent" : "info",
  format: env.NODE_ENV === "production" ? combine(timestamp(), json()) : devFormat,
  transports: [new winston.transports.Console()],
});
