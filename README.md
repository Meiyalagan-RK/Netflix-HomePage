# Netflix-HomePage

Complete Netflix-style homepage with a Node/Express API backend and Cypress end-to-end test suite for automation practice.

## Features
- Netflix-like homepage UI (hero banner, nav, rows, cards)
- Dynamic data loading from backend API (`/api/content`)
- Search integration (`/api/search?q=...`)
- Subscription form with server-side validation (`/api/subscribe`)
- Health endpoint (`/api/health`)
- Cypress E2E coverage for UI + API scenarios

## Tech Stack
- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Node.js + Express
- Testing: Cypress

## Setup
```bash
npm install
npm run dev
```
App will run at:
`http://localhost:3000`

## API Endpoints
- `GET /api/health` → API status
- `GET /api/content` → homepage content (hero + rows)
- `GET /api/search?q=<term>` → title search
- `POST /api/subscribe` → subscribe with payload:
  ```json
  {
    "email": "user@example.com",
    "plan": "premium"
  }
  ```

## Cypress Test Cases Included
`cypress/e2e/homepage.cy.js`

1. Homepage loads hero and rows from API
2. Search returns matching title
3. Search with no result shows zero cards
4. Valid subscription submission works
5. Invalid subscription shows API validation message
6. Health endpoint contract check
7. Search endpoint negative test (missing query)

## Run Tests
In separate terminals:
```bash
npm run dev
npm run test:api
npm run test:cypress
```

## Practice Ideas for More Cypress Cases
- Add login modal and test positive/negative login flows
- Add My List toggle and persist state using API/localStorage
- Add pagination in rows and test lazy loading/scroll behavior
- Add network stubbing (`cy.intercept`) for error handling UI tests
