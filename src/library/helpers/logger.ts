import { config } from 'config';
import { createLogger, format, transports } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, label, printf, colorize } = format;

const myFormat = printf((info) => {
  return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});

const logLevel = config.logs.level === 'local' ? 'debug' : 'warn';

const options = {
  file: {
    level: logLevel,
    filename: `${config.logs.directory}/%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    timestamp: true,
    handleExceptions: true,
    humanReadableUnhandledException: true,
    prettyPrint: true,
    json: true,
    maxSize: '20m',
    colorize: true,
    maxFiles: '14d',
  },
};

const logger = createLogger({
  format: combine(label({ label: config.appName }), timestamp(), myFormat),
  transports: [
    new transports.File({
      filename: `${config.logs.directory}/combined.log`,
    }),
  ],
  exceptionHandlers: [new DailyRotateFile(options.file)],
  exitOnError: false,
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: combine(
        label({ label: config.appName }),
        colorize(),
        timestamp(),
        myFormat,
      ),
    }),
  );
}

export default logger;
