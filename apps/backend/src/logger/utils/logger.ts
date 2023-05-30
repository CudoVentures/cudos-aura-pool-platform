import { createLogger, format, transports } from 'winston';

const SERVICE_NAME = 'CUDOS_MARKETS';

const consoleLogger = createLogger({
    format: format.combine(
        format.colorize({
            all: true,
        }),
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json(),
        format.printf((info) => {
            return `${info.service} {${info.level}} ${info.timestamp} ${info.label ?? ''}: ${info.message}`;
        }),
    ),
    transports: [
        new transports.Console(),
    ],
    defaultMeta: {
        service: SERVICE_NAME,
    },
});

export function createFileLogger(absoluteFileLocation: string, prefix: string = undefined) {
    return createLogger({
        format: format.combine(
            format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss',
            }),
            format.errors({ stack: true }),
            format.splat(),
            format.json(),
            format.printf((info) => {
                return `${info.service} {${info.level}} ${info.timestamp} ${info.label ?? ''}: ${info.message}`;
            }),
        ),
        transports: [
            new transports.File({
                filename: absoluteFileLocation,
                maxsize: 1 << 27, // 10MB
                maxFiles: 4,
            }),
        ],
        defaultMeta: {
            service: SERVICE_NAME,
            label: prefix,
        },
    })
}

export default consoleLogger;
