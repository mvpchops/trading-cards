import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Config } from "./config/index.js";

import type { JwtPayload } from 'jsonwebtoken'
import type { NextFunction } from "express-serve-static-core";

export interface JwtDataPayload extends JwtPayload {
	uid: string;
};

export const hashPswd = async (pswd: string): Promise<string> => {
	const salt = await bcrypt.genSalt(12);
	const hash = await bcrypt.hash(pswd, salt);
	return hash;
};

export const comparePswd = async (
	pswd: string,
	hashed: string,
): Promise<boolean> => {
	const status = await bcrypt.compare(pswd, hashed);
	return status;
};

export const jwtSign = async (
	payload: JwtDataPayload,
): Promise<string> => {
	const encoded = jwt.sign({ data: payload }, Config.get().authSecret, {
		expiresIn: "1d",
	});
	return encoded;
};

export const jwtVerify = async (token: string) => {
	const decoded = jwt.verify(token, Config.get().authSecret);
	return decoded;
};

passport.use(new JwtStrategy(
	{
		secretOrKey: Config.get().authSecret,
		jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	},
	async (payload, done) => {
		try {
			return done(null, payload);
		} catch (err) {
			return done(err, null);
		}
	},
));

// without the cast, the middleware is not recognized as a function
// it shows up in the type definition file as type "any"
export const jwtAuthenticateMW = passport.authenticate('jwt', { session: false }) as NextFunction;	
