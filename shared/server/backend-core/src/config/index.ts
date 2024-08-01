import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { z } from "zod";
import Dotenv from "dotenv";
import { createEnv } from "@t3-oss/env-core";

const backToRoot = [];
const cwd = process.cwd();

// we are starting the backend app normally from the root module
if (cwd.endsWith("entrypoint")) {
	backToRoot.push("../", "../");
}
// we are reaching into the backend-core module to run scripts like DB migrations
else if (cwd.endsWith("backend-core")) {
	backToRoot.push("../", "../", "../");
}
// we are running the tests
else if (process.env.NODE_ENV === "test") {
	backToRoot.push("./");
}
// not sure where we are running from
// halt and review
else {
	console.log("CWD: ", cwd);
	process.exit(1);
}

// if we are NOT running in a test or production environment,
// we want to use the development environment
if (!["test", "development"].includes(process.env.NODE_ENV || "")) {
	process.env.NODE_ENV = "development";
}

// load a local .env.*.local file unless in production
let pathToLocalEnvFile: string;
const isDevOrTestEnv = ["test", "development"].includes(
	process.env.NODE_ENV || "development",
);

if (isDevOrTestEnv) {
	console.log(`Running in ${process.env.NODE_ENV} mode`);
	pathToLocalEnvFile = path.resolve(
		...backToRoot,
		`.env.${process.env.NODE_ENV}.local`,
	);
	Dotenv.config({ path: pathToLocalEnvFile });
	console.log(`Loaded env file from ${pathToLocalEnvFile}`);
} else {
	console.log("Running in production mode");
	Dotenv.config();
}

const reloadEnv = () => {
	if (isDevOrTestEnv) {
		const envVariables = Dotenv.parse(
			fs.readFileSync(pathToLocalEnvFile, 'utf-8')
		);
		const keys = Object.keys(envVariables);
		for (const key of keys) {
			delete process.env[key];
		}
		Dotenv.config({ path: pathToLocalEnvFile });
	} else {
		Dotenv.config();
	}
};

export const Config = {
	get: ({latest}: {latest?: boolean} = {}) => {
		if (latest === true) reloadEnv();
		return createEnv({
			server: {
				env: z.string(),
				port: z.string(),
				appName: z.string(),
				authSecret: z.string(),
				cardsRepoAPI: z.string(),
				scryfallApiBase: z.string(),
				cacheURL: z.string().url(),
				databaseUrl: z.string().url(),
				rateLimitHourWindow: z.coerce.number(),
				cardsRepoMaxRetries: z.coerce.number(),
				rateLimitRequestsPerWindow: z.coerce.number(),
			},
			runtimeEnvStrict: {
				port: process.env.PORT ?? "8889",
				authSecret: process.env.JWT_SECRET,
				cacheURL: process.env.CACHE_URL,
				databaseUrl: process.env.DATABASE_URL,
				cardsRepoAPI: process.env.CardsRepoAPI,
				env: process.env.NODE_ENV ?? "development",
				scryfallApiBase: process.env.ScryfallAPIBase,
				rateLimitHourWindow: process.env.RATE_LIMIT_HOURS ?? "1",
				cardsRepoMaxRetries: process.env.MaxCardsRepoAPIRetries || "3",
				rateLimitRequestsPerWindow:
					process.env.RATE_LIMIT_MAX_REQUESTS ?? "5000",
				appName: (process.env.APP_NAME || "App")
					.toLowerCase()
					.replaceAll(/\s+/g, "-"),
			},
		});
	},
};
