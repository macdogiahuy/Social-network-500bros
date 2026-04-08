import chalk from 'chalk';
import { format, createLogger, transports, type Logger as LoggerType } from 'winston';
import { resolve } from 'path';

const errorColor = chalk.red.bold;
const warningColor = chalk.yellow.bold;
const successColor = chalk.green.bold;
const infoColor = chalk.white;

const logFolderPath = process.env['LOG_FOLDER_PATH'] ?? './logs';
const maxLogSize = parseInt(process.env['LOG_FILE_MAX_SIZE'] ?? '10485760');
const isProduction = process.env.NODE_ENV === 'production';

const customLevels = {
  error: 0,
  warning: 1,
  info: 2,
  success: 3
};

const timestampFormat = format.timestamp({
  format: 'DD-MMM-YYYY HH:mm:ss.SSS'
});

const jsonFormat = format.combine(
  format.timestamp(),
  format.json()
);

const coloredOutputFormat = format.printf((log) => {
  let color = infoColor;

  switch (log.level) {
    case 'error':
      color = errorColor;
      break;
    case 'warning':
      color = warningColor;
      break;
    case 'success':
      color = successColor;
      break;
  }

  return `${log['timestamp']}\t${color(log.message)}`;
});

const consoleFormat = format.combine(timestampFormat, coloredOutputFormat);

const logger = createLogger({
  levels: customLevels,
  transports: [
    new transports.File({
      level: 'error',
      filename: resolve(logFolderPath, 'error.log'),
      maxsize: maxLogSize,
      format: jsonFormat
    }),
    new transports.File({
      level: 'success',
      filename: resolve(logFolderPath, 'combined.log'),
      maxsize: maxLogSize,
      format: jsonFormat
    }),
    new transports.Console({
      level: 'success',
      format: isProduction ? jsonFormat : consoleFormat,
      handleExceptions: true
    })
  ],
  exceptionHandlers: [
    new transports.File({
      filename: resolve(logFolderPath, 'exceptions.log'),
      format: jsonFormat
    })
  ]
});

const Logger = {
  error: (message: string, meta?: Record<string, unknown>): LoggerType =>
    logger.error(message, meta),
  warning: (message: string, meta?: Record<string, unknown>): LoggerType =>
    logger.warning(message, meta),
  info: (message: string, meta?: Record<string, unknown>): LoggerType =>
    logger.info(message, meta),
  success: (message: string, meta?: Record<string, unknown>): LoggerType =>
    logger.log('success', message, meta)
};

export default Logger;
