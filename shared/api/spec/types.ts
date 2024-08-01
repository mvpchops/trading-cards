import type {
    RequestHandler, IRouter, RouteParameters
} from 'express-serve-static-core';
// import type {
//     RequestHandler, ParamsDictionary, IRouter, RouteParameters,
//     NextFunction, Request, Response
// } from 'express-serve-static-core';
// import type { ServerResponse } from "node:http";

// interface ParsedQs {
//     [key: string]: undefined | string | string[] | ParsedQs | ParsedQs[];
// }

// type Send<ResBody = unknown, T = Response<ResBody>> = (body?: ResBody) => T;

// interface APIResponse<
//     ResBody = unknown,
//     LocalsObj extends Record<string, unknown> = Record<string, unknown>,
//     StatusCode extends number = number,
// > extends ServerResponse, Express.Response {
//     status(code: StatusCode): this;
//     send: Send<ResBody, this>;
//     json: Send<ResBody, this>;
// }

// export interface APIRequestHandler<
//     P = ParamsDictionary,
//     ResBody = unknown,
//     ReqBody = unknown,
//     ReqQuery = ParsedQs,
//     LocalsObj extends Record<string, unknown> = Record<string, unknown>,
// > extends RequestHandler {
//     (
//         req: Request<P, ResBody, ReqBody, ReqQuery, LocalsObj>,
//         res: Response<ResBody, LocalsObj>,
//         next: NextFunction,
//     ): void;
// }

export type IEndpoint = {
    route: string;
    resBody?: unknown;
    reqBody?: unknown;
    queryParams?: unknown;
};

export type Handler<E extends IEndpoint> = RequestHandler<RouteParameters<E['route']>, E['resBody'], E['reqBody'], E['queryParams']>;

export interface APIRouter<E extends IEndpoint> /*extends Router*/ {
    post<
        Route extends string = E['route'],
        Paths = RouteParameters<Route>,
        ResBody = E['resBody'],
        ReqBody = E['reqBody'],
        ReqQuery = E['queryParams'],
        LocalsObj extends Record<string, unknown> = Record<string, unknown>
    >(
        path: Route,
        ...handlers: Array<RequestHandler<Paths, ResBody, ReqBody, ReqQuery, LocalsObj>>
    ): IRouter;
};




