import {
	comparePswd,
	db,
	hashPswd,
	jwtSign,
	logAs,
	schema,
	redis,
} from "backend-core";
import { eq, and } from "drizzle-orm";
import * as errors from "./users.errors.js";

import type * as oas from "../../../shared/api/sdk/types.js";

const log = logAs("users");

const nicknameIsTaken = async (nickname: string): Promise<boolean> => {
	const [user] = await db()
		.select({
			id: schema.users.id,
		})
		.from(schema.users)
		.where(eq(schema.users.nickname, nickname));
	return user !== undefined;
};


/**
 * Authenticate a user with their nickname and password
 * @param dto - The login dto
 * @throws UserServiceError if the login details are invalid
 * @returns The auth token
 */
export const loginUser = async (
	dto: oas.LoginAttempt,
): Promise<oas.AuthToken> => {
	if (!dto) throw new errors.UserServiceError(errors.MISSING_LOGIN_DETAILS_MSG);

	if (dto.createUser === true) {
		log.info(`attempt to create user [${dto.nickname}] at first login`);
		const nicknameTaken = await nicknameIsTaken(dto.nickname);
		if (nicknameTaken) throw new errors.UserServiceError(errors.NICKNAME_TAKEN_MSG);

		const user = await createUser(dto);
		const token = await jwtSign({ uid: user.id });
		log.info(`generated JWT for [created] user [${dto.nickname}]`);
		return { token };
	}

	const [user] = await db()
		.select({
			id: schema.users.id,
			hashedPswd: schema.users.password,
		})
		.from(schema.users)
		.where(eq(schema.users.nickname, dto.nickname));

	if (!user) throw new errors.UserServiceError(errors.INVALID_LOGIN_MSG);
	if (!comparePswd(dto.password, user.hashedPswd))
		throw new errors.UserServiceError(errors.INVALID_LOGIN_MSG);

	const token = await jwtSign({ uid: user.id });
	log.info(`generated JWT for [authenticating] user [${dto.nickname}]`);
	return { token };
};

/**
 * Create a new user with their unique nickname and password
 * @param dto - The details of the user to create
 * @throws UserServiceError if the user details are invalid
 * @returns The created user
 */
export const createUser = async (
	dto: oas.CreateUserDto,
): Promise<oas.UserCreatedDto> => {
	if (!dto) throw new errors.UserServiceError(errors.CANNOT_CREATE_USER_MSG);
	const pswdHashed = await hashPswd(dto.password);

	const [created] = await db()
		.insert(schema.users)
		.values({ nickname: dto.nickname, password: pswdHashed })
		.returning();

	if (!created)
		throw new errors.UserServiceError(errors.CANNOT_CREATE_USER_MSG);

	log.info(`created user [${dto.nickname}]`);
	return {
		id: created.id,
	};
};

/**
 * Get a currently authenticated user
 * @param userId - The ID of the user to retrieve
 * @throws UserServiceError if the user cannot be retrieved
 * @returns The user
 */
export const getUser = async (userId: oas.UserId): Promise<oas.UserDto> => {
	if (!userId)
		throw new errors.UserServiceError(errors.CANNOT_RETRIEVE_USER_MSG);

	const cachedUser = await redis().get(userId);
	if (cachedUser) return JSON.parse(cachedUser);

	const [user] = await db()
		.select({
			id: schema.users.id,
			nickname: schema.users.nickname,
		})
		.from(schema.users)
		.where(eq(schema.users.id, userId));

	if (!user) throw new errors.UserServiceError(errors.CANNOT_RETRIEVE_USER_MSG);

	const fetchedUser: oas.UserDto = user;
	log.info(`retrieved user [${user.nickname}]`);

	const favorites = await db()
		.select({
			cardId: schema.favorites.cardId,
		})
		.from(schema.favorites)
		.where(eq(schema.favorites.userId, user.id))
		.limit(500);

	if (favorites && favorites.length > 0) {
		log.info(`retrieved favorites for user [${user.nickname}]`);
		fetchedUser.favorites = favorites.map((fav) => fav.cardId);
	}

	redis().set(user.id, JSON.stringify(fetchedUser));

	return fetchedUser;
};

/**
 * Add a card to a user's favorites. If the card is already in the user's favorites, this operation will be a no-op.
 * @param cardId - The ID of the card to add
 * @param userId - The ID of the user to add the card to
 * @throws UserServiceError if the card cannot be added to the user's favorites
 * @returns True if the card was added to the user's favorites, false otherwise
 */
export const addToFavorites = async (
	cardId: string,
	userId: string,
): Promise<boolean> => {
	if (!cardId || !userId)
		throw new errors.UserServiceError(
			errors.CANNOT_COMPLETE_FAVORITE_ACTION_MSG,
		);

	await db()
		.insert(schema.favorites)
		.values({ cardId, userId })
		.onConflictDoNothing();

	const cachedUser = await redis().get(userId);
	if (cachedUser) {
		const user = JSON.parse(cachedUser);
		if (!user.favorites) user.favorites = [cardId];
		else user.favorites = [...user.favorites, cardId];

		redis().set(userId, JSON.stringify(user));
	}

	log.info(`added card [${cardId}] to favorites of user [${userId}]`);
	return true;
};

/**
 * Remove a card from a user's favorites. If the card is not in the user's favorites, this operation will be a no-op.
 * @param cardId - The ID of the card to remove
 * @param userId - The ID of the user to remove the card from
 * @throws UserServiceError if the card cannot be removed from the user's favorites
 * @returns True if the card was removed from the user's favorites, false otherwise
 */
export const removeFromFavorites = async (
	cardId: string,
	userId: string,
): Promise<boolean> => {
	if (!cardId || !userId)
		throw new errors.UserServiceError(
			errors.CANNOT_COMPLETE_FAVORITE_ACTION_MSG,
		);

	await db()
		.delete(schema.favorites)
		.where(
			and(
				eq(schema.favorites.userId, userId),
				eq(schema.favorites.cardId, cardId),
			),
		);

	const cachedUser = await redis().get(userId);
	if (cachedUser) {
		const user = JSON.parse(cachedUser) as oas.UserDto;
		if (user.favorites) {
			user.favorites = user.favorites.filter((cId) => cId !== cardId);
			redis().set(userId, JSON.stringify(user));
		}
	}

	log.info(`removed card [${cardId}] from favorites of user [${userId}]`);
	return true;
};
