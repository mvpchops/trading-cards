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

describe("Search Cards Service", () => {
	it("should search for cards", async () => {
		let status: number | undefined = undefined;
		let results: oas.QueryResult | undefined = undefined;
		try{
			const response = await http.get("/search", {
				params: {
					term: 'pokey',
				},
			});
			[status, results] = [response.status, response.data];
		} catch (err) {
			// catch Aios errors
			onError(err, (msg) => expect.fail(msg));
		} finally {
			// error or not, run assertions
			expect(status).to.equal(200);
			expect(results).to.be.an("object");
			if (results) {
				expect(results.total).to.be.greaterThan(0);
				expect(results.data).to.be.an("array").that.is.not.empty;
				if (results.data && results.data.length > 0) {
                    const card = results.data[0];
                    if (!card) {
                        expect.fail("No card found in results");
                    }
                    expect(card).to.be.an("object");
                    expect(card.id).to.be.a("string");
                    expect(card.name).to.be.a("string");
                    expect(card.name).to.match(/pokey/i);
				}
            }
		}
	});

	it("should search for cards with a page", async () => {
		let status: number | undefined = undefined;
		let results: (oas.QueryResult & oas.Pagination) | undefined = undefined;
		try{
			const response = await http.get("/search", {
				params: {
					term: 'red',
					page: 2,
				},
			});
			[status, results] = [response.status, response.data];
		} catch (err) {
			// catch Aios errors
			onError(err, (msg) => expect.fail(msg));
		} finally {
			// error or not, run assertions
			expect(status).to.equal(200);
			expect(results).to.be.an("object");
			if (results) {
				expect(results.total).to.be.greaterThan(0);
				expect(results.data).to.be.an("array").that.is.not.empty;
				if (results.data && results.data.length > 0) {
                    const card = results.data[0];
                    if (!card) {
                        expect.fail("No card found in results");
                    }
                    expect(card).to.be.an("object");
                    expect(card.id).to.be.a("string");
                    expect(card.name).to.be.a("string");
					expect(card.name.split(/\s*/).join('')).to.match(/red/i);
				}
				expect(results.next).to.be.match(/red/i);
				expect(results.next).to.be.match(/page=\d+/);
				expect(results.previous).to.be.match(/red/i);
				expect(results.previous).to.match(/page=\d+/);
            }
		}
	});
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