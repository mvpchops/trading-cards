import { BackendApplicationError } from "backend-core";

export class CardsServiceError extends BackendApplicationError {}

export const INVALID_SEARCH_TERM_MSG = "Cannot proceed with missing, invalid, incomplete details";
export const CARDS_REPO_UNREACHABLE_MSG = "Unable to reach repository API for game cards";
export const CARD_SEARCH_FAILED_MSG = "Unable to handle your search request. Pls try again";
