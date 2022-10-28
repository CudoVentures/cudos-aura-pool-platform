# Project usage

## Installation

```bash
$ npm install
```

## Configuration

Create ./config/.env file based on ./config/.env.example

Variables declared in snake case with all uppercase letters will be public (e.g. APP_DEFAULT_NETWORK)
Variables declared in snake case with only first letter of each word with uppercase letter will be backend only (e.g. App_Port)

<em>Important: EACH VARIABLE MUST STARTS WITH "APP_" (public) or "App_" (backend only) </em>

## Development without docker

Start the backend

```bash
$ npm run start:backend:dev
```

Build the frontend (optional)

```bash
$ npm run build:frontend:dev
```

## Production without docker

Build

```bash
$ npm run build:prod
```

Start

Copy ./dist and package.json to desired location.
```bash
cp -r ./dist /usr/app
cp package.json /usr/app
```

Navigate to desired location
```bash
cd /usr/app
```

Install packages

```bash
npm i --omit=dev
```

Start the app

<em>Important: It is highly recommended to start the app in production using pm2, systemd or docker</em>

```bash
node ./dist/apps/backend/main
```

## Development with docker

Create ./docker/dev.arg based on ./docker/dev.arg.example

Build and Start the container using VS shortcuts commands or

```bash
cd ./docker && docker-compose --env-file ./dev.arg -f ./dev.yml -p cudos-aura-platform-dev up --build
```

## Production with docker

Create ./docker/prod.arg based on ./docker/prod.arg.example

Build and Start the container using VS shortcuts commands or

```bash
cd ./docker && docker-compose --env-file ./prod.arg -f ./prod.yml -p cudos-aura-platform-prod up --build
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

[MIT licensed](LICENSE).


# Project information about development

The project is SPA application. It includes both a frontend and a backend.

The frontend app is located at /apps/frontend.

The backend app is located at /apps/backend.

The project's config is located at /config. An .env must be created based on .example.env in the config folder.

The project is using the clean architecture.

The project must ALWAYS be deployed on / of a domain.

The project during development must be re-built when a new asset is added to public directory.

## Backend

Backend is based on NestJs. Its architecture and folder structure is, more or less, identical or similar to project's clean architecture so no any major changes are done on backend part. For more information about how nestjs works please refer to official nestjs' documentation.

## Frontend

Frontend is based on React, using function components. For more information about it, please refer to official React's documentation.

State management is handled using MobX. For more information about it and how MobX is integrated into React, please refer to official MobX's documentation.

The frontend is designed to use project's clean architecture. Its structure could be summarized as follows:

```
./app/frontend/src
|   App.tsx // React's entry point of the app
|   main.tsx // Connection point between the actual DOM and the React
└───core // the "core" feature which components, states, etc. are shared amoung the app
└───features // each subfolder corresponds to a feature
└───public // this folder is explosed by the webserver
    |   index.html // the entry point of the app
    └───assets // contains the assets of the app

```

All stores are initialized in App.ts

All non-react assets and page layout is defined in index.html.

When React is ready and loaded the page layout looks like:

```html
<body>
    <div class="ReactEntryPoint"> <!-- Entry point of the react application. --> 
        <div class="AppRouter"> <!-- Wrapper of the transitions between pages. -->
            <div class="ReactBody"> <!-- Wrapper of the entire page including its ui helper components. -->
                <div class="Page" /> <!-- The actual page is inserted here. This is the actual ENTRY POINT of the app. -->
                <div class="..." /> <!-- Modals ui components are inserted here. -->
                <div class="..." /> <!-- Alert ui components are inserted here. -->
                <div class="..."/> <!-- Helper ui components, etc. are inserted here. -->
            <div>
        </div>
    </div>
    <div id="page_loading" class="PageLoading" /> <!-- Default loading indicator. --> 
</body>
```

Frontend features:
- Default loading indicator that is part of index.html. It is removed once the React is loaded.
- Global CSS class named "Transition" which is enabled after React is loaded.
- Fixed backwards navigation on Safari.
- Proper handling of :hover styles on touch devices
- Set of utilities JS functions which are non-project related are defined in ./core/Main.ts
- Set of CSS styles that hold the entire project but are not project specific are defined in ./core/presentation/styles/main.css
- Set of CSS styles that that are project specific are defined in ./core/presentation/styles/content.css
- App's routes are defined in ./features/app-routes
- Global dim/blur feature available through the AppStore
- Global disabler of click action while async job is running available through the AppStore
- Global loading indicator available through the AppStore
- Global alert component available through AlertStore
- Predefined Modal window wrapper and store.
- Uploader helper function and React component
- Default non-React view for unsupported browsers

Frontend project does not include
- Any UI components
- Multi page builder

