## Backend-Core

Core shared functionalities and types for other backend services

```typescript
import {
	cacheFor
} from 'backend-core';

const router: Router = express.Router({caseSensitive: true});

const lastModifiedDate = (new Date('2024-4-05 09:00:00')).toISOString();

router.get('/', (_request: Request, response: Response) => {
	response.set('Last-Modified', lastModifiedDate);
	response.set('Cache-Control', cacheFor('30 days'));
	response.json({
		message: `Trading Game Cards API Services (v1) - Since ${lastModifiedDate}`,
	});
});

```