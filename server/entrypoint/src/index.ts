import express from 'express';
import {
	/*apiRateLimiter, */ apiAutoValidator, cacheFor,
	expressApp, apiDocumentationRoot, Config
} from 'backend-core';

import { service as usersService } from 'users';
import {service as searchCardsService} from 'searchcards';
import type { Router, Request, Response } from 'express-serve-static-core';

// eslint-disable-next-line new-cap
const router: Router = express.Router({caseSensitive: true});

const lastModifiedDate = (new Date('2024-7-05 09:00:00')).toISOString();
router.get('/', (_request: Request, response: Response) => {
	response.set('Last-Modified', lastModifiedDate);
	response.set('Cache-Control', cacheFor('30 days'));
	response.json({
		message: `${Config.get().appName} API Services (v1) - Since ${lastModifiedDate}`,
	});
});

usersService.useRouter(router);
searchCardsService.useRouter(router);

// const middlewares = [apiRateLimiter, ...apiAutoValidator];
const middlewares = [...apiAutoValidator];
const staticAssets = [
	{
		route: '/docs',
		directory: apiDocumentationRoot
	}
];

expressApp(router, middlewares, staticAssets);