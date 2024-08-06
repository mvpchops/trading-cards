# Trading Game Cards MVP

[![CI](https://github.com/mvpchops/trading-cards/actions/workflows/CI.yaml/badge.svg)](https://github.com/mvpchops/trading-cards/actions/workflows/CI.yaml)

This is a **high fidelity** trading game cards MVP built with Typescript, Node.js, Postgres, Drizzle, Redis, OpenAPI, and Docker. It is a monorepo that features a vanilla HTML/Javascript/CSS + Bootstrap frontend as well as a React + Tailwind frontend, both of which communicate (with a [shared client-core](/shared/server/client/client-core)) to the same backend that implements a RESTful API spec-ed with OpenAPI 3.x

The goal of this project is to create a simple, yet fully functional, testable, and deployable MVP to **showcase a robust starting point** to early stage startups and entrepreneurs looking to get ahead and quickly go from idea to functionaly MVP.

![MVP Screenshot](static/images/vanilla-js-frontent-app-transformed.png)

## Features & Highlights

> See it in action at [https://trading-cards-react-mvp.netlify.app/](https://trading-cards-react-mvp.netlify.app)


- A PostgreSQL database with data migrations support (via [drizzle-kit](https://github.com/drizzle-team/drizzle-kit))
- Externalized configuration with type-safe environment variables
- Utilises Redis caching and supports HTTP caching
- A well designed and [documented REST API](https://trading-cards-backend-staging.up.railway.app/docs/) using the OpenAPI 3.x specification
- Modern integration testing with TestContainers
- Dockerized with Docker Compose and a Dockerfile
- First class support for TypeScript and pervasive type safety, both in source code and in tests. API controllers and services heavily use types generated from the OpenAPI spec as well as others put together by hand :point_down: :point_down: <br /><br /> 
    ![](/static/images/hand-made-ts-types-transformed.png)


## Wanna Take It For A Spin :sunglasses:

Review the deployed app online :rocket:

- React App - https://trading-cards-react-mvp.netlify.app
- Vanilly HTML/JS App - https://trading-cards-vanilla-js-mvp.netlify.app
- Backend - https://trading-cards-backend-staging.up.railway.app
- API Docs - https://trading-cards-backend-staging.up.railway.app/docs/


## Technology Stack

![backend topology](/static/images/Railway-backend-topology-transformed.png)

### Backend
- Typescript
- Node.js
- Express
- OpenAPI 3.x
- PostgreSQL
- Drizzle ORM
- Redis

### Frontend 
- Typescript
- React
- HTML/CSS
- Bootstrap
- Tailwind CSS
- Parcel

### CI/CD, Testing, and Packaging
- Mocha
- Docker
- Github Actions
- TestContainers


### Running Tests

[Github Actions will run the tests](https://github.com/mvpchops/trading-cards/actions/runs/10248704190/job/28350534204) on push to the `dev` branch and on pull requests to `dev` and `main` branches

![running tests](static/images/GHA-workflow-transformed.png)


## System Components

```mermaid
flowchart LR
    cache[Redis]
    db[PostgreSQL]
    server[Express Server]
    apispec[OpenAPI Spec]
    scryfall[Scryfall API]
    search[SearchCards]
    users[Users]
    servercore[Backend Core]
    clientcore[Client Core]
    react[React Web App]
    vanilla[Vanilla HTML/JS Web App]
    
    subgraph Backend
        subgraph "Users, Auth, & Favorites Service"
            server --> apispec --> users
            users --> apispec
            users --> servercore
            servercore --> cache
            servercore --> db
        end
        subgraph "Search Cards Service"
            server --> apispec --> search --> scryfall
            search --> apispec
            search --> servercore
        end
    end
    subgraph Frontend
        react --> clientcore --> server
        vanilla --> clientcore --> server
    end
```

<br /><br /><br />
### Searching for game cards
---

```mermaid
sequenceDiagram
    autonumber
    actor WepApp as Web App
    box linen <br> Express with OpenAPI validation <br>
        participant Server as Express Server
        participant BackendCore as Backend Core
    end
    participant SearchCards
    participant ScryfallAPI
    
    WepApp->>Server: GET /search?term=pokey
    activate Server
        Server->>BackendCore: is the request valid?
        BackendCore-->>Server: yes #128A0C
        Server->>SearchCards: search for pokey
        activate SearchCards
        loop until backoff & retry exhausted
            SearchCards-->>ScryfallAPI: search for pokey 
            ScryfallAPI-->>SearchCards: pokey cards
        end
        deactivate SearchCards
        SearchCards-->>Server: pokey cards
        Server-->>WepApp: HTTP 200, (paged) pokey cards
    deactivate Server
```    

<br /><br /><br />
### Adding a card to a user's favorites
---

```mermaid
sequenceDiagram
    autonumber
    actor WepApp as Web App
    box linen <br> Express with OpenAPI validation <br>
        participant Server as Express Server
        participant BackendCore as Backend Core
    end
    participant Users
    participant PostgreSQL as DB
    participant Redis as Cache
    
    WepApp->>Server: PATCH /users/:userId/favorites
    activate Server
        Server->>BackendCore: is the request valid?
        BackendCore-->>Server: yes #128A0C
        Server->>BackendCore: is the user authenticated?
        BackendCore-->>Server: yes #128A0C
        Server->>Users: get the user
        activate Users
            Users->>Redis: get user from cache if cached
            Redis-->>Users: user
            Users->>PostgreSQL: get user from DB if not cached
            PostgreSQL-->>Users: user
            Users->>PostgreSQL: add pokey to user's favorites
            Users->>Redis: add pokey to user's favorites
        deactivate Users
        Users->>Server: added pokey to user's favorites
        Server-->>WepApp: HTTP 204
    deactivate Server
```  

## Contact

If you have any questions, comments or would like to discuss your MVP, feel free to reach out via email at [mvpchops@gmail.com](mailto:mvpchops@gmail.com)

