## Backend Entrypoint

This is the entrypoint for the entire backend app. 
It pulls in the different backend services and bootstraps their endpoints into a unified router, assembles middlewares and static
resorces (e.g the API docs) and uses an export from the server-core module to spin up the server

