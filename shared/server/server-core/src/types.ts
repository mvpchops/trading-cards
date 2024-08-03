import type winston from "winston";

export type AppLogLevels = {
	// add a custom / high priority level here
	error: number;
	warn: number;
	info: number;
	http: number;
	debug: number;
};

export type AppLogger = winston.Logger & {
	[k in keyof AppLogLevels]: winston.LeveledLogMethod;
};

export type CatchAllError = {
	status?: number;
	message?: string;
	errors?: string[];
};

export type ServeStatic = {
	route: string;
	directory: string;
};
