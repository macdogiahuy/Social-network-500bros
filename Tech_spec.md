# Technical Specification

## 1. Technology Stack

### Frontend (`bento-social-next`)
- **Core Framework**: Next.js 14.2 (App Router), React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS, `tailwind-variants`
- **UI Components**: Radix UI Primitives (`@radix-ui/*`), Framer Motion (Animations), Lucide React (Icons)
- **State & Data Management**: React Query (`react-query`)
- **Forms & Validation**: React Hook Form, Zod
- **Networking**: Axios, Socket.io Client, Simple-peer (WebRTC for real-time media)
- **Architecture Tools**: TSyringe (Dependency Injection)

### Backend (`bento-microservices-express`)
- **Core Framework**: Express.js (v5)
- **Language**: TypeScript
- **Database ORM**: Prisma (`@prisma/client` v5)
- **Real-time & Caching**: Socket.io (v4), Redis (v4 client)
- **Validation**: Zod
- **Architecture Tools**: TSyringe (Dependency Injection)
- **Security & Middlewares**: Helmet, Compression, Cors, Bcrypt, JSONWebToken (JWT)
- **File Handling**: Multer, Sharp (Image processing)
- **Logging**: Winston, Morgan

### Infrastructure & Operations
- **Containerization**: Docker & Docker Compose (for DB and Redis)
- **Database Engine**: MySQL (exposed on port 3307)
- **In-Memory Datastore**: Redis (exposed on port 6379)
- **Scripting**: Windows Batch Scripts (`.bat`) for environment restorations, start, and stop.

## 2. Infrastructure Setup & Environment Variables

The system relies heavily on `.env` files for operational configurations. Distinct environments exist:
- `.env.development`: Targets local localhost processes.
- `.env.network`: Adjusts database URLs and CORS origins for network-accessible deployments (e.g., local LAN testing).

## 3. Notable Implementations

### Networking & Real-Time
The inclusion of `simple-peer` alongside `socket.io-client` indicates WebRTC capabilities, likely pointing towards peer-to-peer audio/video calls or real-time streaming, built on top of standard textual conversations.

### Image Optimization
The backend utilizes `multer` for receiving multi-part file payloads and `sharp` for fast generation of thumbnails and optimization of avatars/post media before persisting them.

### Dependency Injection
Both frontend and backend packages explicitly install `tsyringe` and `reflect-metadata`. This implies an enterprise-grade Class-based object instantiation pattern throughout the system, moving away from standard functional exports commonly found in Express/React codebases.
