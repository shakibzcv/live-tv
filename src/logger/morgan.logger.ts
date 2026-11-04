import morgan, { type StreamOptions } from 'morgan';
import logger from './winston.logger';
import { NODE_ENV } from '../env';

// Pipe Morgan HTTP logs into Winston at the 'http' level
const stream: StreamOptions = {
  write: (message: string): void => {
    logger.http(message.trim());
  },
};

// Skip HTTP logging in non-development environments
const skip = (): boolean => {
  const env = NODE_ENV ?? 'development';
  return env !== 'development';
};

const morganMiddleware = morgan(
  ':remote-addr :method :url :status - :response-time ms',
  { stream, skip }
);

export default morganMiddleware;
