BePolite – Intelligent Neighborhood Assistance App

BePolite is a modern, fast, and reliable neighborhood assistance
platform designed to connect users with local helpers for tasks such as
carrying items, moving furniture, delivering small goods, or any quick
favor that requires a nearby helping hand.

This project includes a full backend system built with Node.js +
TypeScript + PostgreSQL and a mobile-friendly frontend UI concept
designed for simplicity, clarity, and speed.

------------------------------------------------------------------------

🚀 Features

🧑‍🤝‍🧑 Core User Functions

-   User registration & login (JWT authentication)
-   Real-time location-based Provider suggestions
-   Requesting help for small tasks
-   Viewing session history
-   In-app speed tests to check connection quality

🧑‍🔧 Provider Functions

-   Becoming a provider with one tap
-   Sharing real-time availability
-   Automatically showing best provider based on:
    -   Distance
    -   Availability
    -   Speed test results
    -   Session rating history

🔄 Sessions

-   Starting and ending a help session
-   Recording details to the database
-   Fetching session history

⚡ Real-Time

-   WebSocket gateway for quick updates
-   Server-Sent Events (SSE) for light real-time streaming

------------------------------------------------------------------------

🛠️ Backend Tech Stack

Core Technologies

-   Node.js
-   TypeScript
-   Fastify (high-performance backend framework)
-   PostgreSQL (primary database)
-   Drizzle ORM (schema management + migrations)
-   JWT (auth system)
-   Zod (schema validation)

Architecture

-   Modular service-based backend
-   Clean folder structure (modules, services, controllers,
    repositories)
-   Fastify plugins for:
    -   WebSockets
    -   SSE
    -   Authentication hooks

Testing

-   Vitest for unit testing
-   Fully mocked services (Auth, Users, Providers, Sessions, Speedtest)
-   Future integration test support

------------------------------------------------------------------------

🎨 Frontend (Concept UI)

Although the full frontend app is not included, the concept design: -
Mobile-first interface - Clean card layout - Real-time provider
visibility - Color theme: - Electric Blue (#4A90E2) - Neutral Light Gray
(#F5F7FA) - Midnight Black (#0A0A0A) - Designed for React Native or
Flutter

------------------------------------------------------------------------

📂 Project Structure

    neighbornet-backend/
    │
    ├── src/
    │   ├── modules/
    │   │   ├── auth/
    │   │   ├── users/
    │   │   ├── providers/
    │   │   ├── sessions/
    │   │   ├── speedtest/
    │   │   └── realtime/
    │   ├── database/
    │   ├── utils/
    │   └── app.ts
    │
    ├── tests/
    │   ├── auth.test.ts
    │   ├── users.test.ts
    │   ├── providers.test.ts
    │   ├── sessions.test.ts
    │   ├── speedtest.test.ts
    │   └── realtime.test.ts
    │
    └── package.json

------------------------------------------------------------------------

📡 API Overview

🔐 Authentication

-   POST /auth/register
-   POST /auth/login
-   POST /auth/refresh
-   POST /auth/logout

👤 Users

-   GET /users/:id
-   PUT /users/:id

🧑‍🔧 Providers

-   GET /providers/nearby
-   POST /providers/availability
-   POST /providers/stop
-   GET /providers/best

⏱️ Sessions

-   POST /sessions/start
-   POST /sessions/end
-   GET /sessions/history

⚡ Real-Time

-   /ws – WebSocket gateway
-   /sse – Server-Sent Events stream

------------------------------------------------------------------------

🧪 Running Tests

    npm test

If Vitest is not recognized, reinstall:

    npm install -D vitest

------------------------------------------------------------------------

📦 Installation

1.  Clone the repo:

    git clone https://github.com/yourusername/bepolite.git

2.  Install dependencies:

    npm install

3.  Configure environment variables .env:

    DATABASE_URL=postgres://user:password@localhost:5432/bepolite
    JWT_SECRET=your-secret-key

4.  Run server:

    npm run dev

------------------------------------------------------------------------

🤝 Contributing

Pull requests are welcome!
Make sure to follow the code style and include tests.

------------------------------------------------------------------------

📜 License

This project is licensed under the MIT License.

------------------------------------------------------------------------

🌟 Thanks for using BePolite!

Built for speed, simplicity, and real-world community assistance.
