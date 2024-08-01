import { logAs } from "backend-core";
import type * as oas from "../../../shared/api/sdk/types.js";
import * as errors from "./users.errors.js";
import * as service from "./users.service.js";
import type { JwtDataPayload } from "backend-core";

const log = logAs("users");

export const userLoginController: oas.LoginUserHandler = async (
	request,
	response,
): Promise<void> => {
	const payload = request.body;
	log.info(`login attempt from [${payload.nickname}]`);
	try {
		const authToken = await service.loginUser(payload);
		response.json(authToken);
	} catch (err) {
		const error = err as Error;
		log.error(error);
		const errOut: oas.APIResponseError = { message: error.message };
		const status = error instanceof errors.UserServiceError ? 400 : 500;
		response.status(status).json(errOut);
	}
};

export const createUserController: oas.CreateUserHandler = async (
	request,
	response,
): Promise<void> => {
	const payload = request.body;
	log.info(`attempt to create user [${payload.nickname}]`);
	try {
		const createdUser = await service.createUser(payload);
		response.status(201).json(createdUser);
	} catch (err) {
		const error = err as Error;
		console.error(error);
		log.error(error);
		const errOut: oas.APIResponseError = { message: error.message };
		const status = error instanceof errors.UserServiceError ? 400 : 500;
		response.status(status).json(errOut);
	}
};

export const getCurrentUserController: oas.GetUserHandler = async (
	request,
	response,
): Promise<void> => {
	try {
		// TODO: move this to a middleware or a central place
		if (!request.user
			|| !('data' in request.user)
		) throw new errors.UserServiceError(errors.CANNOT_RETRIEVE_USER_MSG);
		// TODO-end

		const { data: { uid: userId } } = request.user as { data: JwtDataPayload};
		log.info(`attempt to get user [${userId}]`);
		const user = await service.getUser(userId);
		response.json(user);
	} catch (err) {
		const error = err as Error;
		log.error(error);
		const errOut: oas.APIResponseError = { message: error.message };
		const status = error instanceof errors.UserServiceError ? 400 : 500;
		response.status(status).json(errOut);
	}
};

export const addToFavoritesController: oas.AddToFavoritesHandler = async (
	request,
	response,
): Promise<void> => {
	try {
		// TODO: move this to a middleware or a central place
		if (!request.user
			|| !('data' in request.user)
		) throw new errors.UserServiceError(errors.CANNOT_RETRIEVE_USER_MSG);
		// TODO-end

		const { card } = request.body;
		const { data: { uid: userId } } = request.user as { data: JwtDataPayload};
		log.info(`attempt to add card [${card}] to favorites for user [${userId}]`);

		const status = await service.addToFavorites(card, userId);
		if (status && status === true) response.status(204).send();
		else response.status(400).json({ message: "Failed to add card to favorites" });
	} catch (err) {
		const error = err as Error;
		log.error(error);
		const errOut: oas.APIResponseError = { message: error.message };
		const status = error instanceof errors.UserServiceError ? 400 : 500;
		response.status(status).json(errOut);
	}
};

export const removeFromFavoritesController: oas.RemoveFromFavoritesHandler = async (
	request,
	response,
): Promise<void> => {
	try {
		// TODO: move this to a middleware or a central place
		if (!request.user
			|| !('data' in request.user)
		) throw new errors.UserServiceError(errors.CANNOT_RETRIEVE_USER_MSG);
		// TODO-end

		const { card } = request.body;
		const { data: { uid: userId } } = request.user as { data: JwtDataPayload};
		log.info(`attempt to remove card [${card}] from favorites for user [${userId}]`);
		
		const status = await service.removeFromFavorites(card, userId);
		if (status && status === true) response.status(204).send();
		else response.status(400).json({ message: "Failed to remove card from favorites" });
	} catch (err) {
		const error = err as Error;
		log.error(error);
		const errOut: oas.APIResponseError = { message: error.message };
		const status = error instanceof errors.UserServiceError ? 400 : 500;
		response.status(status).json(errOut);
	}
};	
