# Connect Widget AI Context

## Project Overview

`@mxenabled/connect-widget` is a UI-only library for the Connect Widget, built with React and TypeScript. It provides the visual components and state management for the widget but relies on an external API and configuration provided by the consuming application to function.

The library uses `ConnectWidget` as the main entry point and `ApiProvider` to inject the necessary API callbacks.

**Core Technologies:**

- **UI Framework:** React
- **Language:** TypeScript
- **State Management:** Redux Toolkit
- **Build Tool:** Vite
- **Testing:** Vitest
- **(Old. Do not introduce more usage) Component Library:** Kyper UI (`@kyper/*`)

## Building and Running

The project relies on standard npm scripts for development, building, and testing:

- **Install Dependencies:** `npm install`
- **Development Build (Watch Mode):** `npm run dev`
- **Production Build:** `npm run build`
- **Run Tests:** `npm run test`
- **Watch Tests:** `npm run watch`
- **Lint Code:** `npm run lint`
- **Link locally:** Use `npm link` in the root and then `npm link @mxenabled/connect-widget` in the consuming application to test local changes.

## Development Conventions

This repository has strict architectural, styling, and testing standards defined in the Architecture Decision Records (`architectureDecisionRecords/`). All new code must conform to these ADRs.

### Architecture & Design

- **Architecture Decision Records (ADRs):** Any significant technical choices should be documented as an ADR. Pull requests with new code that does not adhere to the agreed-upon ADRs will not be approved (exceptions for urgent hotfixes).
- **Styling:** The project uses **CSS Modules** for styling. Do not use Tailwind CSS or other global CSS frameworks unless specifically working on existing legacy code that hasn't been migrated.

### Testing

- **Frameworks:** Use **Vitest** for unit and integration testing. **MSW (Mock Service Worker)** is the standard for API mocking in tests. **Cypress** is the standard for end-to-end tests.
- **Philosophy:** Prefer integration tests over unit tests. Mock as little as possible. The primary goal of testing is to ensure that the frontend works properly with the backend and to provide confidence to deploy without manual testing.

### Git & Version Control

- **Conventional Commits:** All commit messages must follow the Conventional Commits specification to trigger semantic versioning releases properly.
- You can use `npx cz` (Commitizen) to launch interactive prompts for formatting your commit message.
  - `fix:` triggers a PATCH bump
  - `feat:` triggers a MINOR bump
  - `BREAKING CHANGE:` footer triggers a MAJOR bump.

## Project Structure Highlights

- `src/`: Contains all the source code for the widget.
  - `components/`: React components.
  - `redux/`: Redux actions, reducers, selectors, and store configuration.
  - `context/`: React context providers (like `ApiContext`).
  - `hooks/`: Custom React hooks.
  - `views/`: Higher-level view components.
- `docs/`: Extensive documentation on analytics, API requirements, client config, and user features.
- `architectureDecisionRecords/`: Documentation of core engineering decisions (ADRs).
