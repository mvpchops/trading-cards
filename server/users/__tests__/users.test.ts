import process from "node:process";
import axios from "axios";
import Dotenv from "dotenv";
import { expect } from "chai";
import { describe, it } from "mocha";

import type { AxiosError } from "axios";
import type * as oas from "../../../shared/api/sdk/types";

Dotenv.config({
	path: '.env.test.local'
});

const http = axios.create({
	timeout: 10000,
	headers: { "Content-Type": "application/json" },
	baseURL: process.env['SERVER_URL'] || 'http://127.0.0.1:8889'
});

const onError = (err: unknown, handler?: (msg: string) => void) => {
	const error = err as AxiosError;
	// The erver responded with code out of the 2xx range
	if (error.response) {
		console.warn(`[${error.status}] ${error.response.statusText}`);
		if (!handler || typeof handler !== "function") return;
		handler(`status [${error.status}] is out of the 2xx range]`);
	} 
	
	// No response was received
	// `error.request` is an instance of http.ClientRequest
	else if (error.request) {
		console.warn(`[${error.status}] ${error.request.statusText}`);
		if (!handler || typeof handler !== "function") return;
		handler('No response was received from the server');
	} 

	// Something else happened in setting up the request
	else {
		console.warn("Error", error.message);
	}
};

const testUser = {
	id: '',
	authToken: '',
	nickname: "somenick",
	password: "eXdoloreD0l0r3e"
};

describe("Users Service", () => {
	it("should create a new user", async () => {
		let status: number | undefined = undefined;
		let data: oas.UserCreatedDto | undefined = undefined;
		try{
			const response = await http.post("/users", {
				nickname: testUser.nickname,
				password: testUser.password,
			});
			[status, data] = [response.status, response.data];
		} catch (err) {
			// catch Aios errors
			onError(err, (msg) => expect.fail(msg));
		} finally {
			// error or not, run assertions
			expect(status).to.equal(201);
			expect(data).to.be.an("object");
			if(data) {
				expect(data.id).to.be.a("string");
			}
		}
	});

	it("should login a user", async () => {
		let status: number | undefined = undefined;
		let data: oas.AuthToken | undefined = undefined;
		try{
			const response = await http.post("/authenticate", {
				nickname: testUser.nickname,
				password: testUser.password,
			});
			[status, data] = [response.status, response.data];
		} catch (err) {
			// catch Aios errors
			onError(err, (msg) => expect.fail(msg));
		} finally {
			// error or not, run assertions
			expect(status).to.equal(200);
			expect(data).to.be.an("object");
			if (data) {
				expect(data.token).to.be.a("string");
				testUser.authToken = data.token;
				console.log(`[TEST] Auth token: ${testUser.authToken}`);
			}
		}
	});

	it("should get a user", async () => {
		let status: number | undefined = undefined;
		let data: oas.UserDto | undefined = undefined;
		try{
			const response = await http.get("/users/me", {
				headers: {
					Authorization: `Bearer ${testUser.authToken}`,
				},
			});
			[status, data] = [response.status, response.data];
		} catch (err) {
			// catch Aios errors
			onError(err, (msg) => expect.fail(msg));
		} finally {
			// error or not, run assertions
			expect(status).to.equal(200);
			expect(data).to.be.an("object");
			if (data) {
				expect(data.id).to.be.a("string");
				expect(data.nickname).to.be.a("string");
				testUser.id = data.id;
				console.log(`[TEST] User: ${data.id}`);
			}
		}
	});

	it("should add a card to a user's favorites", async () => {
		let status: number | undefined = undefined;
		try{
			const response = await http.patch(
				`/users/${testUser.id}/favorites`, {
					card: "d65a13a8-8e6d-4ad6-b322-ef2ffd505615",
				}, {
					headers: {
						Authorization: `Bearer ${testUser.authToken}`,
					},
				});
			status = response.status;
		} catch (err) {
			// catch Aios errors
			onError(err, (msg) => expect.fail(msg));
		} finally {
			// error or not, run assertions
			expect(status).to.equal(204);
		}
	});

	it("should load a user's favorites", async () => {
		let status: number | undefined = undefined;
		let data: oas.UserDto | undefined = undefined;
		try{
			const response = await http.get(
				'/users/me', {
					headers: {
						Authorization: `Bearer ${testUser.authToken}`,
					},
				});
			[status, data] = [response.status, response.data];
		} catch (err) {
			// catch Aios errors
			onError(err, (msg) => expect.fail(msg));
		} finally {
			// error or not, run assertions
			expect(status).to.equal(200);
			if (data) {
				expect(data.id).to.be.equal(testUser.id);
				expect(data.nickname).to.be.equal(testUser.nickname);
				expect(data.favorites).to.be.an("array").that.is.not.empty;
			}
		}
	});
});
