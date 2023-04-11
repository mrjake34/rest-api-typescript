import chalk, { blue, blueBright, yellow, yellowBright, red, redBright } from 'chalk';
import { createLogger, format, transports, Logger } from 'winston';

const logger = createLogger({
    level: 'debug',
    format: format.combine(format.timestamp(), format.prettyPrint(), format.simple()),
    transports: [
        new transports.File({ filename: 'info.log', level: 'info' }),
        new transports.File({ filename: 'warn.log', level: 'warn' }),
        new transports.File({ filename: 'error.log', level: 'error' })
    ]
});

export default class Logging {
    public static commonLog = (message: any, level: string, saveLog: boolean, firstColor: chalk.Chalk, secondColor: chalk.Chalk) => {
        console.log(firstColor(`[${new Date().toLocaleString()}] [${level.toUpperCase()}]`), typeof message === 'string' ? secondColor(message) : message);
        if (saveLog) {
            logger.log({
                level: level,
                message: message
            });
        }
    };
    public static info = (message: any, saveLog: boolean) => {
        Logging.commonLog(message, 'info', saveLog, blue, blueBright);
    };
    public static warn = (message: any, saveLog: boolean) => {
        Logging.commonLog(message, 'warn', saveLog, yellow, yellowBright);
    };
    public static error = (message: any, saveLog: boolean) => {
        Logging.commonLog(message, 'error', saveLog, red, redBright);
    };
}
