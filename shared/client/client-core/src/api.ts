import type {
	CardsQueryResponse,
} from "../../../api/sdk/types.js";

import * as store from "./store.js";
import { settle, wait } from "./ui.js";

import type { AppUser } from "./types.js";

type APIResponse = CardsQueryResponse | undefined;
type APIInvokerFunction = () => Promise<APIResponse>;
type ResultsReceiverFunction = (results: APIResponse) => void;

const CallStatusReady = "READY";
const CallStatusInFlight = "INFLIGHT";

let delayChain: Promise<unknown> | undefined;
let APICallStatus = CallStatusReady;

// TODO: make this configurable for dev & prod
const apiBase = "http://localhost:8889";

const searchForTerm =
	(term: string, pagedTo = ""): APIInvokerFunction =>
	async (): Promise<CardsQueryResponse> => {
		let endpoint = `/search?term=${term}`;
		if (pagedTo !== "") {
			const url = new URL(pagedTo, `${apiBase}`);
			endpoint = `/search${url.search}`;
		}

		const resp = await fetch(`${apiBase}${endpoint}`);
		if (!resp.ok) throw new Error("Failed to fetch search results", {cause: resp});

		return resp.json();
	};

const issueSearch = async (
	apiCall: APIInvokerFunction,
): Promise<CardsQueryResponse | undefined> => {
	let data: CardsQueryResponse | undefined = undefined;
	try {
		console.log("Calling backend API ...");
		APICallStatus = CallStatusInFlight;
		data = await apiCall();
		APICallStatus = CallStatusReady;
		console.log("Backend responded!");
	} catch (e) {
		console.warn(e);
	} 

	return data;
};

// Aready issued a call? wait for it while 'staging' new calls.
// Though we can delay issuing the API calls, we don't want
// 10 "delayed" calls all going out within a very short time window because
// the delays all elapsed in quick succession.
//
// Thus, calling readyToSearchAndDisplayResults('bird') within a loop
// of 10 iterations will:
// 1. allow the first call go through to the backend immediately
// 2. delay till 1 seconds after the last of the remaining 9 calls was issued
// 3. make only one backend call (not 9) for the remaining calls, which is likely
//    what the user wants to see results for
//
// Not rigorously tested, but works fine.
// Uncomment the loop at the
// bottom of the startApp function in client/vanilla/src/index.js,
// run `pnpm --filter vanilla-client start`, (re)load the app
// in the browser and view the console logs
export const performSearch = async (
	term: string,
	setResults: ResultsReceiverFunction,
	pagedTo = "",
) => {
	const apiCallr = searchForTerm(term, pagedTo);

	if (APICallStatus === CallStatusInFlight) {
		delayChain ||= Promise.resolve();

		delayChain = settle(wait()).after(delayChain);
		return;
	}

	const result = await issueSearch(apiCallr);
	setResults(result);

	if (delayChain) {
		await delayChain;
		delayChain = undefined;
		const result = await issueSearch(apiCallr);
		setResults(result);
	}
};

export const authenticateUser = async (
	nickname: string,
	password: string,
	createUser: boolean,
) => {
	const response = await fetch(`${apiBase}/authenticate`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ nickname, password, createUser }),
	});

	if (!response.ok) throw new Error("Authentication failed");

	const { token } = await response.json();
	const { authToken, isAuthenticated } = store.updateCurrentUser({
		authToken: token,
		isAuthenticated: true,
	});

	if (authToken) localStorage.setItem("jwToken", authToken);

	await fetchCurrentUserData(authToken);
	return {
		token: authToken,
		isAuthenticated,
	};
};

export const fetchCurrentUserData = async (
	token?: string,
): Promise<AppUser | undefined> => {
	const authToken = token || store.getCurrentUser().authToken;
	if (!authToken || authToken.trim() === "") {
		console.warn("cannot fetch current user data without auth token");
		return;
	}

	const response = await fetch(`${apiBase}/users/me`, {
		headers: {
			Authorization: `Bearer ${authToken}`,
			"Content-Type": "application/json",
		},
	});
	if (!response.ok) throw new Error("Failed to fetch current user data");

	const user = await response.json();
	const currentUser = store.updateCurrentUser({
		id: user.id,
		isAuthenticated: true,
	});
	localStorage.setItem("userId", user.id);
	return currentUser;
};

export const addCardToUsersFavs = async (cardId: string): Promise<boolean> => {
	const { id, authToken } = store.getCurrentUser();
	if (!id || !authToken)
		throw new Error("Cannot add card to favorites. User not authenticated");

	const response = await fetch(`${apiBase}/users/${id}/favorites`, {
		method: "PATCH",
		headers: {
			Authorization: `Bearer ${authToken}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ card: cardId }),
	});
	if (!response.ok) throw new Error("Failed to fetch user data");
	return true;
};

export const removeCardFromUsersFavs = async (
	cardId: string,
): Promise<boolean> => {
	const { id, authToken } = store.getCurrentUser();
	if (!id || !authToken)
		throw new Error(
			"Cannot remove card from favorites. User not authenticated",
		);

	const response = await fetch(`${apiBase}/users/${id}/favorites`, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${authToken}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ card: cardId }),
	});
	if (!response.ok) throw new Error("Failed to fetch user data");
	return true;
};
