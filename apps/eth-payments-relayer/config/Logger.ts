import { createLogger, format, transports } from 'winston';

const SERVICE_NAME = 'ETH_PAYMENT_RELAYER';

const formatModel = format.combine(
    format.colorize(),
    format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
);
const defaultTransports = [new transports.Console()]

const Logger = createLogger({
    format: formatModel,
    transports: defaultTransports,

});

export default Logger;
