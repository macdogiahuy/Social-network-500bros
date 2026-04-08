# User Module Architecture

The `src/modules/user/` directory in our application is structured using a very clean, layered architecture pattern, heavily inspired by **Clean Architecture** (or Hexagonal Architecture/Ports and Adapters). This structure is designed to separate business logic from technical implementation details like databases, HTTP frameworks, or message brokers. 

Here is a detailed breakdown of the components:

## The Architecture Breakdown
```
src/modules/user/
├── infras/
│   ├── repository/
│   ├── services/
│   └── transport/
├── interface/
├── model/
├── usecase/
├── user.controller.ts
├── user.route.ts
└── module.ts
```

### 1. Core Domain & Business Logic (Inner Layers)
These layers are the heart of your application and should not depend on external libraries like Express, Redis, or Prisma.
*   **`model/` (Domain Entities & Rules):** 
    Contains the core data structures and business rules for your application.
    *   `index.ts`: The main User entity definition and related DTOs (Data Transfer Objects).
    *   `reset-password.ts`: Contains the domain logic or specific data structures for the password reset flow.
    *   `error.ts`: Defines custom, domain-specific errors (e.g., `UserNotFoundError`, `InvalidPasswordError`).

*   **`interface/` (Ports):**
    This folder typically holds TypeScript interfaces that define the contracts required by the use cases. By defining interfaces here (like `IUserRepository` or `IEmailService`), the inner business logic can call out to databases or external services without tightly coupling to their specific implementations (adhering to the Dependency Inversion Principle).

*   **`usecase/` (Application Business Rules):**
    This contains specific application workflows or user stories. It orchestrates the flow of data using the models and interfaces.
    *   `index.ts`: Likely handles traditional actions like creating users, updating profiles, etc.
    *   `password-reset.usecase.ts`: Encapsulates the multi-step business logic of requesting and validating a password reset.
    *   `user-stats.usecase.ts`: Manages operations related to user followers, followings, and other statistical metrics.

### 2. Infrastructure (Outer Layer)
The `infras/` folder contains the "adapters" that plug into the core interfaces. This is where your code interacts with the outside world (databases, third-party APIs, message queues).
*   **`infras/repository/`**: Implementations of your database logic, typically using Prisma in your stack.
    *   `index.ts`: Main user data access logic (e.g., `findUserById`, `createUser`).
    *   `reset-token.repository.ts`: Handles the persistence layer for password reset tokens.
*   **`infras/services/`**: Implementations for external third-party services.
    *   `email.service.ts`: Integration logic to send emails (e.g., using SendGrid, NodeMailer).
*   **`infras/transport/`**: This handles asynchronous or inter-service communications context.
    *   `redis-consumer.ts`: Listens to Redis pub/sub or event queues to process background events.
    *   `password-reset-http.service.ts` & `user-stats-http.service.ts`: These likely handle either exposing specific HTTP service layers over the wire or acting as HTTP clients that talk to *other* microservices.

### 3. Entry Points & Wiring (Delivery Layer)
This is the layer that interacts with the user/client making the request.
*   **`user.route.ts`**: Defines your Express Router endpoints (e.g., `router.post('/register', ...)`).
*   **`user.controller.ts`**: The controllers handle the Express HTTP `Request` and `Response` objects. They extract the payload, pass it into the appropriate `usecase`, catch any errors, and format the HTTP response (e.g., returning a `200 OK` or `400 Bad Request`).
*   **`module.ts`**: This acts as the Dependency Injection container. It wires everything together: instantiating the repositories, passing those repositories into the use cases, parsing the use cases into the controllers, and finally exporting everything so the main `app.ts` or server runner can mount it.

### Summary
This structure is highly scalable. If you ever needed to change your database from Prisma to Raw SQL, or swap your Express app out for Fastify, your core logic (`model/` and `usecase/`) would remain completely untouched, while only the outer adapters (`infras/` and `controller`/`route`) would be rewritten.
