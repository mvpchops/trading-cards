import type { Router } from "express-serve-static-core";
import type { BackendService } from "backend-core";
import { jwtAuthenticateMW } from "backend-core";
import {
	createUserController,
	userLoginController,
	getCurrentUserController,
	addToFavoritesController,
	removeFromFavoritesController
} from "./users.controller.js";

const useRouter = (router: Router): void => {
	router.post("/users", createUserController);
	router.post("/authenticate", userLoginController);

	router.get("/users/me", jwtAuthenticateMW, getCurrentUserController);

	router.patch("/users/:userId/favorites", jwtAuthenticateMW, addToFavoritesController);
	router.delete("/users/:userId/favorites", jwtAuthenticateMW, removeFromFavoritesController);
};

export const service: BackendService = { useRouter };
