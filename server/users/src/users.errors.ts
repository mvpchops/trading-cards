import { BackendApplicationError } from "backend-core";

export class UserServiceError extends BackendApplicationError {}

export const MISSING_LOGIN_DETAILS_MSG = "Cannot authenticate with missing or incomplete credentials";
export const INVALID_LOGIN_MSG = "Cannot authenticate with invalid credentials";
export const CANNOT_CREATE_USER_MSG = "Cannot create user with invalid or incomplete details";
export const CANNOT_RETRIEVE_USER_MSG = "Cannot retrieve user with invalid ID";
export const CANNOT_COMPLETE_FAVORITE_ACTION_MSG = "Cannot complete the favorite action with provided details";
export const CANNOT_CREATE_PSWD_MSG = "Cannot create user with non-compliant password";
export const NICKNAME_TAKEN_MSG = "Cannot create user with already taken nickname";

