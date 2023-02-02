import { createLogger, format, transports } from 'winston';

const SERVICE_NAME = 'ETH_PAYMENT_RELAYER';

const formatModel = format.combine(
    format.colorize({
        all: true,
    }),
    format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
    format.printf(
        (info) => ` ${info.service} {${info.level}} ${info.timestamp} ${info.label ?? ''}: ${info.message}`,
    ),
);
const defaultTransports = [new transports.Console()]

const Logger = createLogger({
    format: formatModel,
    transports: defaultTransports,
    defaultMeta: {
        service: SERVICE_NAME,
    },
});

export default Logger;
