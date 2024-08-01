import appRootPath from 'app-root-path';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const customFileFormat = winston.format.printf((options) => {
  const { timestamp, level, message } = options;
  delete options.level;
  delete options.message;
  delete options.timestamp;
  return `${timestamp} ${level}: ${message} - ${JSON.stringify(options)}`;
});

const transports = [];

if (!process.env.IS_SERVERLESS) {
  transports.push(
    new DailyRotateFile({
      level: 'silly',
      filename: `${appRootPath}/logs/application-%DATE%-logs.log`,
      datePattern: 'DD-MM-YYYY',
      zippedArchive: true,
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'DD-MM-YYYY HH:mm:ss',
        }),
        customFileFormat,
      ),
      maxSize: '5m',
      maxFiles: '60d',
    }),
  );
}

const Logger = winston.createLogger({
  level: 'silly',
  exitOnError: false,
  transports: [
    ...transports,
    new winston.transports.Console({
      format: winston.format.combine(winston.format.errors({ stack: true }), winston.format.cli(), winston.format.simple()),
    }),
  ],
});

export const logger = Logger;
