import type { Handler, APIRouter } from '../spec/types';
import type { components, operations, paths } from './generated';

// components
export type APIWelcome = components["schemas"]["APIWelcome"];
export type APIError = components["schemas"]["APIError"];
export type APIResponseError = components["schemas"]["APIResponseError"];
export type PageParam = components["schemas"]["PageParam"];
export type SearchTermParam = components["schemas"]["SearchTermParam"];
export type OrderByParam = components["schemas"]["OrderByParam"];
export type SortDirParam = components["schemas"]["SortDirParam"];
export type UserDto = components["schemas"]["UserDto"];
export type UserId = components["schemas"]["UserId"];
export type CreateUserDto = components["schemas"]["CreateUserDto"];
export type FavCardDto = components["schemas"]["FavCardDto"];
export type UserCreatedDto = components["schemas"]["UserCreatedDto"];
export type LoginAttempt = components["schemas"]["LoginAttempt"];
export type AuthToken = components["schemas"]["AuthToken"];
export type CardPrices = components["schemas"]["CardPrices"];
export type CardImageURIs = components["schemas"]["CardImageURIs"];
export type Card = components["schemas"]["Card"];
export type Pagination = components["schemas"]["Pagination"];
export type QueryResult = components["schemas"]["QueryResult"];

// responses
export type CardsQueryResponse = components["schemas"]["CardsQueryResponse"];

// parameters
export type SearchCardsQureyParams = operations["searchCards"]["parameters"]["query"];

// export type EgAllParams = operations["examplePath"]["parameters"];

// TODO
// Go from "/users/authenticate": "/users/authenticate"
// TO "/users/authenticate": { 'route': "/users/authenticate", handler: ??? }
// such that handler is already typed for the route using the right types above
// this will be magical
export type Endpoints = {
    [K in keyof paths]: K
}

type HasContent = { content: { 'application/json': unknown } };
type HasRequestBody = HasContent;
// // type Has200ResponseBody = { 200: HasContent };
// // type Has201ResponseBody = { 201: HasContent };
type HttpStatus = 100 | 200 | 201 | 400 | 401 | 404 | 429 | 500;
type Has2xxResponseBody<S extends HttpStatus> = { [K in S]: HasContent };

// type OperationPaths = keyof paths;
export type OperationIDs = keyof operations;

export type RouteSpec<OP extends OperationIDs, S extends HttpStatus> = {
    [Key in keyof operations[OP]]: Key extends 'parameters'
        ? operations[OP][Key]
        : Key extends 'responses'
            ? operations[OP][Key] extends Has2xxResponseBody<S>
                ? {
                    [Status in keyof Has2xxResponseBody<S>]: operations[OP][Key][Status]['content']['application/json']
                }
                : unknown
            : Key extends 'requestBody'
                ? operations[OP][Key] extends HasRequestBody
                    ? operations[OP][Key]['content']['application/json']
                    : unknown
                : never; 
};
// export type GetExamples = RouteSpec<'examplePath', 200>;

// Users
type CreateUserEndpoint = {
    route: '/users';
    reqBody: CreateUserDto;
    resBody: UserCreatedDto | APIResponseError;
};

type CreateUserRouter = APIRouter<CreateUserEndpoint>;
export type CreateUserHandler = Handler<CreateUserEndpoint>;

type UserLoginEndpoint = {
    route: '/authenticate';
    reqBody: LoginAttempt;
    resBody: AuthToken | APIResponseError
};

type LoginUserRouter = APIRouter<UserLoginEndpoint>;
export type LoginUserHandler = Handler<UserLoginEndpoint>;

type GetUserEndpoint = {
    route: '/users/me';
    resBody: UserDto | APIResponseError;
};
export type GetUserHandler = Handler<GetUserEndpoint>;

type AddToFavoritesEndpoint = {
    route: '/users/:userId/favorites';
    reqBody: FavCardDto;
    resBody: APIResponseError;
};
export type AddToFavoritesHandler = Handler<AddToFavoritesEndpoint>;

type RemoveFromFavoritesEndpoint = {
    route: '/users/:userId/favorites';
    reqBody: FavCardDto;
    resBody: APIResponseError;
};
export type RemoveFromFavoritesHandler = Handler<RemoveFromFavoritesEndpoint>;

export type UsersRouter = CreateUserRouter | LoginUserRouter;
// End Users

// Search Cards
type SearchCardsEndpoint = {
    route: '/search';
    queryParams: SearchCardsQureyParams;
    resBody: CardsQueryResponse | APIResponseError;
};

export type SearchCardsHandler = Handler<SearchCardsEndpoint>;
// End Search Cards

// type ManualExamplepathRoute = {
//     params: ExamplePathAllParams;
//     reqBody: LoginAttempt;
//     resBody: CardsQueryResponse | APIResponseError;
// }

// "/example": {
//     get: operations["examplePath"];
// }

// export type TEndpoint = {
//     [K in keyof paths]: {
//         path: K;
//     }
// }