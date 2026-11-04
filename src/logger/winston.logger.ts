import winston from 'winston';
import { NODE_ENV } from '../env';

// Custom severity levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
} as const;

type LogLevel = keyof typeof levels;

// Log level based on environment
const level = (): LogLevel => {
  const isDevelopment = (NODE_ENV ?? 'development') === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Color map per level
const colors: Record<LogLevel, string> = {
  error: 'red',
  warn: 'yellow',
  info: 'blue',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'DD MMM, YYYY - HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info: winston.Logform.TransformableInfo) => {
    const { timestamp, level, message } = info;
    return `[${timestamp}] ${level}: ${String(message)}`;
  })
);

// Transports: console + rotating log files
const transports: winston.transport[] = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  new winston.transports.File({
    filename: 'logs/info.log',
    level: 'info',
  }),
  new winston.transports.File({
    filename: 'logs/http.log',
    level: 'http',
  }),
];

const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

export default logger;
