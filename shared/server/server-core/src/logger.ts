import winston from "winston";
import { Config } from "./config/index.js";
import { geMorganMiddleware } from "./config/morgan.js";
import type { AppLogLevels, AppLogger } from "./types.js";

const env = Config.get().env;
const isDevOrTestEnv = env === "development" || env === "test";
const appName = Config.get().appName;

winston.addColors({
	battle: "cyan",
	error: "red",
	warn: "yellow",
	info: "green",
	http: "magenta",
	debug: "white",
});

const logFormat = (loggingAs?: string) =>
	winston.format.combine(
		winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
		winston.format.errors({ stack: true }),
		winston.format.colorize({ all: true }),
		winston.format.label({ label: loggingAs ?? "" }),
		winston.format.printf(({ level, message, label, timestamp }) => {
			if (label && label !== "") {
				return `${timestamp} [${label}] ${level}: ${message}`;
			}

			return `${timestamp} ${level}: ${message}`;
		}),
	);

const transports: winston.transport[] = [
	new winston.transports.File({
		filename: `/var/log/${appName}/error.log`,
		level: "error",
	}),
	new winston.transports.File({
		filename: `/var/log/${appName}/access.log`,
		level: "http",
	}),
	new winston.transports.File({
		filename: `/var/log/${appName}/battle.log`,
		level: "battle",
	}),
];

if (isDevOrTestEnv) {
	transports.unshift(new winston.transports.Console());
}

const levels: AppLogLevels = {
	error: 1,
	warn: 2,
	info: 3,
	http: 4,
	debug: 5,
};

const logFactory = (label?: string) =>
	winston.createLogger({
		levels,
		format: logFormat(label),
		transports,
		level: "debug",
	}) as AppLogger;

export const logAs = (label?: string) => logFactory(label);
export const logMiddleware = geMorganMiddleware(logFactory());
