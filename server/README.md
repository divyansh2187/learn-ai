# LearnAI — Backend API

**An AI-powered personalized learning platform for building structured courses, generating educational content, and tracking learning progress.**

LearnAI Backend is a modular REST API built with **Node.js, Express.js, TypeScript, Prisma ORM, and PostgreSQL**. It powers the core learning workflows of LearnAI, including AI-assisted course creation, lesson generation, exercises, quizzes, learning resources, personal study tools, project submissions, and progress analytics.

The goal is to make personalized learning more structured, interactive, and measurable through a single learning platform.

---

## Table of Contents

- [Introduction](#introduction)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Database Design](#database-design)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Database and Prisma](#database-and-prisma)
- [API Reference](#api-reference)
- [AI Content Generation](#ai-content-generation)
- [Authentication and Authorization](#authentication-and-authorization)
- [Learning Progress and Analytics](#learning-progress-and-analytics)
- [Error Handling](#error-handling)
- [Testing and Quality Assurance](#testing-and-quality-assurance)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Development Workflow](#development-workflow)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Introduction

Traditional learning platforms often provide static courses with limited personalization and fragmented progress tracking.

LearnAI is designed to bring course creation, educational content, practice, assessment, and progress tracking into one integrated experience.

The backend acts as the central layer between the client application, AI services, and the PostgreSQL database. It processes requests, applies application rules, manages learning data, and returns structured responses to the client.

### Core objectives

- **Personalization:** Tailor course structures to learning topics, goals, difficulty, and preferred learning styles.
- **Structured learning:** Organize educational material into courses, modules, and lessons.
- **Active practice:** Support exercises, quizzes, and project-based learning.
- **Measurable progress:** Record learning activity and expose progress statistics.
- **Resource organization:** Bring video resources, notes, bookmarks, and flashcards into the learning workflow.
- **Maintainable architecture:** Separate HTTP handling, business logic, database access, and integrations.

## Key Features

### 1. AI-powered course generation

Create structured learning paths based on a topic and supported learning preferences.

The course-generation workflow includes:

- Request validation.
- Learning-goal and difficulty mapping.
- AI-generated course outlines.
- Module and lesson organization.
- Database persistence.
- Association of generated courses with the authenticated user.

### 2. AI-generated lesson content

Generate educational content for individual lessons independently of the initial course outline.

Lesson content can include explanations, key concepts, examples, code examples, common mistakes, exercises, and quizzes, depending on the generated output and the application's implementation.

### 3. Course and lesson organization

Structure learning material hierarchically:

`Course → Module → Lesson → Learning Activities`

This organization provides a foundation for lesson navigation, resource association, assessments, and progress tracking.

### 4. Exercises and quizzes

Support practical exercises and structured assessments associated with lessons.

Quiz attempts are stored to support assessment history and learning analytics.

### 5. YouTube learning resources

- Search for educational videos.
- Associate videos with lessons.
- Retrieve resources for a lesson.
- Track watched status for individual users.

### 6. Project-based learning

Manage course-related projects and student submissions. Submission-state rules can restrict modifications after submission where implemented.

### 7. Personal study tools

Support the organization of learning material through:

- Notes
- Bookmarks
- Flashcards

### 8. Learning progress

Track learning activity through course, lesson, and exercise progress records, alongside user-specific YouTube viewing progress.

### 9. Dashboard analytics

The dashboard overview can provide:

- Total and completed courses.
- Total, completed, and remaining lessons.
- Overall learning progress.
- Learning time.
- Quiz attempts and average quiz score.
- Course-level progress.
- Next-lesson information.
- Recent quiz attempts.

Exact metric definitions and calculations should be verified against the dashboard implementation.

---

## Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | Server-side JavaScript runtime |
| Express.js | HTTP server and REST API routing |
| TypeScript | Static typing and maintainable application code |
| PostgreSQL | Relational database |
| Prisma ORM | Database queries, schema, and migrations |
| OpenRouter | AI model API integration |
| npm | Package and dependency management |

The application also uses modular controllers, middleware, services, validators, utilities, and Prisma-based data access.

---

## System Architecture

LearnAI uses a layered backend architecture.

```text
                  Client Application
                         |
                         v
                  Express Application
                         |
                         v
                  Route Registration
                         |
                         v
                 Middleware Pipeline
                 /        |         \
        Authentication  Validation  Authorization
                 \        |         /
                         |
                         v
                     Controllers
                         |
                         v
                   Service Layer
                    /          \
                   v            v
            AI Integration   Learning Logic
                   \            /
                    \          /
                         v
                      Prisma
                         |
                         v
                    PostgreSQL
```

### Architectural responsibilities

**Routes**

Define the HTTP methods, URL paths, and middleware used by each endpoint.

**Middleware**

Processes requests before they reach the main handler. This can include authentication, validation, and authorization.

**Controllers**

Handle incoming requests, invoke the required application logic, and produce HTTP responses.

**Services**

Contain reusable business logic and integrations, including AI-powered content generation.

**Prisma**

Provides typed access to PostgreSQL and supports schema-driven database migrations.

**PostgreSQL**

Persists user accounts, courses, lessons, assessments, progress, resources, and other application data.

This separation helps reduce duplicated logic and makes individual features easier to test and maintain.

## Project Structure

```text
server/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── sockets/
│   ├── utils/
│   ├── validators/
│   ├── app.ts
│   └── server.ts
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── prisma.config.ts
└── tsconfig.json
```

### Directory guide

| Path | Responsibility |
|---|---|
| `src/config/` | Application and service configuration |
| `src/controllers/` | HTTP request and response handling |
| `src/middleware/` | Authentication and request-processing middleware |
| `src/models/` | Model-related application code |
| `src/routes/` | API endpoint definitions |
| `src/services/` | Business logic and external integrations |
| `src/sockets/` | Real-time communication code |
| `src/utils/` | Shared helper functions |
| `src/validators/` | Request validation |
| `src/app.ts` | Express application and middleware registration |
| `src/server.ts` | Server startup |
| `prisma/schema.prisma` | Database models, relations, and enums |
| `prisma.config.ts` | Prisma configuration |
| `.env.example` | Example environment configuration |

---

## Database Design

LearnAI uses PostgreSQL for relational data persistence and Prisma ORM for database access.

The schema organizes application data into several functional domains.

| Domain | Models |
|---|---|
| Identity and sessions | `User`, `Session` |
| Course structure | `Course`, `Module`, `Lesson` |
| Exercises and assessment | `Exercise`, `Quiz`, `Question`, `QuizAttempt` |
| Learning progress | `CourseProgress`, `LessonProgress`, `ExerciseProgress` |
| Video learning | `YouTubeResource`, `YouTubeResourceProgress` |
| Personal learning | `Note`, `Bookmark`, `Flashcard` |
| Projects | `Project`, `ProjectSubmission` |
| Additional course content | `CourseResource` |

The schema also defines enums for user roles, difficulty, learning goals, learning styles, question types, resource types, and project submission status.

### Relationship overview

```text
User
 ├── Sessions
 ├── Courses
 │    ├── Modules
 │    │    └── Lessons
 │    │         ├── Exercises
 │    │         ├── Quiz
 │    │         │    └── Questions
 │    │         ├── YouTube Resources
 │    │         ├── Notes
 │    │         ├── Bookmarks
 │    │         └── Flashcards
 │    ├── Projects
 │    ├── Course Resources
 │    └── Course Progress
 ├── Lesson Progress
 ├── Exercise Progress
 └── Quiz Attempts
```

This is a conceptual view of the schema; the actual foreign keys and relation cardinalities are defined in `prisma/schema.prisma`.

### Database design principles

- Use relational constraints to maintain data integrity.
- Associate user-owned records with the appropriate user.
- Use transactions for operations that create related records together.
- Use migrations to track schema changes.
- Review deletion behavior and cascading relationships before changing production data.
- Derive progress statistics from consistent, authoritative data.

---

## Getting Started

Follow these steps to run the backend locally.

### Prerequisites

Install the following:

- Node.js compatible with the project's dependencies.
- npm.
- PostgreSQL or access to a PostgreSQL database.
- Git.
- An OpenRouter API key if using AI generation.

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd learn-ai/server
```

Replace `<YOUR_REPOSITORY_URL>` with your actual repository URL.

### 2. Install dependencies

```bash
npm ci
```

This installs the dependencies recorded in `package-lock.json`.

### 3. Configure environment variables

Create a `.env` file in the `server` directory and populate it using `.env.example`.

Do not commit real credentials or secret values.

### 4. Configure PostgreSQL

Make sure the database exists and is accessible using the connection settings required by your Prisma configuration.

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Inspect migration status

```bash
npx prisma migrate status
```

For local development, use the migration workflow appropriate to the current schema:

```bash
npx prisma migrate dev
```

For deployment environments with committed migrations:

```bash
npx prisma migrate deploy
```

Review migration status before applying changes. Avoid destructive reset commands on a database containing data you need.

### 7. Start the development server

Run the development script defined in `package.json`. For example, if the project has a `dev` script:

```bash
npm run dev
```

The exact startup command and listening port depend on the current project configuration.

---

## Environment Configuration

Environment variables keep credentials and environment-specific settings out of application code.

The following is an illustrative template, not a verified copy of your project's configuration.

```dotenv
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
CLIENT_URL=http://localhost:3000
OPENROUTER_API_KEY=your_openrouter_api_key
```

| Variable | Purpose |
|---|---|
| `NODE_ENV` | Runtime environment |
| `PORT` | HTTP listening port, if configurable |
| `DATABASE_URL` | PostgreSQL connection string, if used by the project configuration |
| `CLIENT_URL` | Frontend origin, if referenced by CORS or provider configuration |
| `OPENROUTER_API_KEY` | AI provider credentials, if referenced by the source code |

Use the actual variable names and values expected by your application. Verify them against `.env.example`, `src/`, `package.json`, and `prisma.config.ts`.

**Never commit the real `.env` file, database passwords, API keys, or authentication secrets.**

---

## Database and Prisma

Prisma provides the database schema, generated client, and migration workflow.

### Common commands

Generate Prisma Client:

```bash
npx prisma generate
```

Check migration status:

```bash
npx prisma migrate status
```

Create and apply a development migration:

```bash
npx prisma migrate dev --name describe_your_change
```

Apply existing migrations:

```bash
npx prisma migrate deploy
```

Open Prisma Studio, if supported by the installed Prisma version and project configuration:

```bash
npx prisma studio
```

### Recommended migration workflow

1. Update `prisma/schema.prisma`.
2. Review relations, constraints, and optional fields.
3. Create a descriptive migration.
4. Inspect the generated migration.
5. Regenerate Prisma Client.
6. Test the affected application workflows.
7. Commit the schema and migration files together.

Do not modify production data manually to work around migration problems without understanding the implications.

---

## API Reference

The backend exposes feature-specific routes for authentication, courses, lessons, exercises, assessments, resources, projects, progress, and dashboard functionality.

The actual URL prefix for each module is determined by its registration in `src/app.ts`.

### API module overview

| Module | Responsibility |
|---|---|
| Authentication | User authentication and protected access |
| Courses | Course generation and course operations |
| Lessons | Lesson retrieval and content generation |
| Exercises | Exercise retrieval and owner-authorized changes |
| YouTube resources | Video search, lesson associations, and watched status |
| Quizzes | Assessment data and quiz attempts |
| Projects | Project and submission management |
| Notes | Personal learning notes |
| Bookmarks | Saved learning material |
| Flashcards | Flashcard management |
| Progress | Course, lesson, and exercise activity |
| Dashboard | Learning statistics and recent activity |

### Confirmed route patterns

These routes have been identified in the project context. Verify the complete registered paths against `src/app.ts` before treating this as a full endpoint inventory.

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/courses/generate` | Generate a course |
| `POST` | `/api/courses/:courseId/lessons/:lessonId/generate-content` | Generate lesson content |
| `GET` | `/api/dashboard/overview` | Retrieve dashboard statistics |

The YouTube resource module includes these route patterns:

| Method | Route pattern | Purpose |
|---|---|---|
| `GET` | `/lesson/:lessonId` | Retrieve lesson-associated resources |
| `POST` | `/lesson/:lessonId` | Associate a resource with a lesson |
| `PATCH` | `/:resourceId/watched` | Update user-specific watched status |
| `DELETE` | `/:resourceId` | Delete a resource where authorized |
| `GET` | `/search` | Search for YouTube resources |

The complete URLs for the YouTube endpoints depend on their registered prefix.

### Example: Generate a course

**Endpoint:** `POST /api/courses/generate`

**Authentication:** Required.

Example request body:

```json
{
  "topic": "Full Stack Web Development",
  "goal": "career",
  "level": "beginner",
  "style": "hands_on",
  "duration": 30
}
```

The example illustrates the request fields used by the course-generation workflow. Accepted values and validation rules should be checked in the route implementation.

Example validation failure:

```json
{
  "success": false,
  "message": "Topic is required"
}
```

This response reflects the topic-validation pattern in the course route. Other response fields and status codes depend on the handler.

### Example: Generate lesson content

**Endpoint:** `POST /api/courses/:courseId/lessons/:lessonId/generate-content`

**Authentication:** Required.

Replace the path parameters with the actual course and lesson identifiers. The handler checks that the course belongs to the authenticated user and that the lesson belongs to the specified course.

### Building a complete API reference

For every endpoint, document:

- HTTP method and full URL.
- Authentication requirements.
- Path and query parameters.
- Request body and validation rules.
- Success status and response schema.
- Error responses.
- Ownership and role requirements.
- Side effects on the database.

An OpenAPI specification and Swagger UI can be added after the complete route inventory has been verified.

---

## AI Content Generation

LearnAI uses an AI provider integration to generate learning content.

### Course-generation flow

1. The client submits a learning topic and supported preferences.
2. The backend validates the request and authenticates the user.
3. The AI service generates a course outline.
4. The backend maps generated content into the application's course structure.
5. The course, modules, and lessons are persisted.
6. The resulting data is returned to the client.

### Lesson-generation flow

1. The client identifies the course and lesson.
2. The backend verifies authentication and course ownership.
3. The backend checks that the lesson belongs to the course.
4. The AI service generates the lesson content.
5. The backend persists the generated material and related learning activities according to the implementation.

### Reliability considerations

AI-generated output is external input and should be treated as untrusted data.

A robust generation pipeline should:

- Validate generated JSON before using it.
- Check required fields and supported enum values.
- Handle malformed or incomplete output.
- Apply timeouts and controlled retries.
- Handle provider errors and rate limits.
- Avoid exposing API keys in logs or responses.
- Prevent duplicate or partially persisted content.
- Keep database operations consistent if generation fails.

These are reliability requirements to verify in the implementation, not a claim that every safeguard is already present.

---

## Authentication and Authorization

Authentication establishes the identity of the user making a request. Authorization determines whether that user may access or modify the requested resource.

LearnAI includes authentication middleware and ownership checks in parts of the API.

### Authorization principles

- Require authentication for protected endpoints.
- Use the authenticated user's identity when creating user-owned resources.
- Check ownership before updates and deletions.
- Validate relationships between nested resources, such as a lesson and its course.
- Keep personal notes, bookmarks, flashcards, and progress isolated by user.
- Avoid relying on a client-supplied user ID as proof of ownership.

### Common HTTP status codes

| Status | Meaning |
|---|---|
| `200 OK` | Request succeeded |
| `201 Created` | Resource created |
| `400 Bad Request` | Request validation failed |
| `401 Unauthorized` | Authentication required or invalid |
| `403 Forbidden` | Authenticated user lacks permission |
| `404 Not Found` | Resource not found or unavailable |
| `500 Internal Server Error` | Unexpected server error |

The exact status codes and response structures should be verified for each route.

---

## Learning Progress and Analytics

Progress tracking connects learning activity to measurable outcomes.

### Course and lesson progress

Course and lesson progress records support completion tracking and dashboard summaries.

### Exercise progress

Exercise-related progress records support the tracking of practical learning activities.

### Quiz performance

Quiz attempts provide assessment history and support performance statistics.

### YouTube viewing progress

Watched status is stored per user, allowing different users to maintain independent viewing progress for the same resource.

### Dashboard calculations

The dashboard combines learning statistics, course progress, lesson counts, learning time, and quiz activity.

Progress calculations should have clearly defined rules for:

- What qualifies as a completed lesson.
- How course completion is determined.
- How overall progress is aggregated.
- How duplicate or repeated quiz attempts affect average scores.
- How learning time is recorded.
- How archived courses affect dashboard totals.

These definitions should remain consistent between the database, API, and client application.

---

## Error Handling

Consistent errors make the API easier to integrate and debug.

An illustrative error response is:

```json
{
  "success": false,
  "message": "A descriptive error message",
  "code": "ERROR_CODE"
}
```

Not every existing handler necessarily returns this exact structure.

### Error-handling principles

- Validate requests before performing mutations.
- Return appropriate HTTP status codes.
- Distinguish authentication failures from authorization failures.
- Handle missing records and database errors.
- Avoid returning stack traces or internal database details.
- Log diagnostic information on the server without logging credentials.
- Ensure failed operations do not leave related records in an inconsistent state.

---

## Testing and Quality Assurance

Test the API with Postman, Bruno, or another HTTP client. Add automated tests where practical.

### Functional tests

Verify that valid requests create and retrieve the expected data.

### Validation tests

Test missing fields, invalid values, malformed identifiers, and unsupported options.

### Authorization tests

Use separate accounts to verify that one user cannot modify another user's private resources.

### Database consistency tests

Verify that course structures, progress records, quiz attempts, and project submissions remain consistent after mutations.

### AI integration tests

Test malformed AI responses, provider errors, timeouts, and rate limits. Where possible, use mocked AI responses for deterministic automated tests.

### Recommended test matrix

| Area | Essential cases |
|---|---|
| Authentication | Valid, invalid, and missing credentials |
| Course generation | Valid topic, invalid input, AI failure |
| Lesson generation | Owner access, unauthorized access, missing lesson |
| Exercises | Read, update, delete, and ownership restrictions |
| YouTube resources | Search, association, watched status, invalid resource |
| Quizzes | Attempt creation, invalid answers, score persistence |
| Projects | Valid submissions, duplicate actions, state restrictions |
| Personal tools | User isolation for notes, bookmarks, flashcards |
| Progress | Completion consistency and dashboard accuracy |

Do not treat a route as fully tested until both successful and failure scenarios have been exercised.

---

## Security Checklist

Before deploying the backend publicly, review the following checklist.

- [ ] Keep `.env` and secrets out of version control.
- [ ] Restrict CORS to approved origins.
- [ ] Protect private endpoints with authentication.
- [ ] Enforce ownership checks for user-owned resources.
- [ ] Validate request bodies, parameters, and query strings.
- [ ] Configure password and session handling securely.
- [ ] Add rate limiting for authentication and expensive AI operations.
- [ ] Avoid logging credentials, tokens, and sensitive user information.
- [ ] Handle AI-provider errors without leaking internal details.
- [ ] Review database migrations before deployment.
- [ ] Keep dependencies updated.
- [ ] Use HTTPS in production.
- [ ] Configure database backups and recovery procedures.

Mark an item complete only after its implementation and behavior have been verified.

---

## Troubleshooting

### PostgreSQL connection failure

Check that the database is running, the connection string is valid, and the configured user has the necessary permissions.

### Prisma Client errors

Regenerate Prisma Client:

```bash
npx prisma generate
```

Confirm that the generated client is compatible with the installed Prisma dependencies.

### Migration failures

Inspect the current migration state:

```bash
npx prisma migrate status
```

Review the schema, migration history, and database state before applying a corrective migration. Avoid resetting databases containing important data.

### AI generation errors

Verify the provider API key, model configuration, request format, quota, and timeout behavior. Inspect sanitized server logs for diagnostic information.

### API returns 404

Verify the route definition, HTTP method, import, and registered prefix in `src/app.ts`.

### CORS errors

Confirm that the configured frontend origin matches the browser application's origin and that credential settings are consistent between the client and server.

### Dashboard statistics appear incorrect

Compare the API response with the underlying course, lesson, progress, and quiz-attempt records. Verify that archived records, incomplete lessons, and repeated attempts are handled according to the intended rules.

---

## Development Workflow

Use the following workflow when introducing a feature or modifying existing behavior.

1. **Plan the change:** identify affected routes, models, and business rules.
2. **Update the schema:** add or modify models and relations when required.
3. **Create a migration:** review the generated SQL and schema changes.
4. **Regenerate Prisma Client:** ensure application types match the schema.
5. **Implement service logic:** keep reusable business rules in the appropriate layer.
6. **Update controllers and routes:** expose the intended API behavior.
7. **Apply validation and authorization:** validate inputs and enforce ownership.
8. **Test the change:** cover successful, invalid, and unauthorized requests.
9. **Verify data consistency:** inspect related records and derived statistics.
10. **Update documentation:** keep API paths, examples, and setup instructions accurate.

---

## Roadmap

Potential improvements to consider as the project evolves:

- [ ] Complete API endpoint inventory and documentation.
- [ ] Expand automated unit and integration tests.
- [ ] Add a verified OpenAPI specification.
- [ ] Complete a systematic authorization audit.
- [ ] Standardize API error responses.
- [ ] Strengthen AI response validation and recovery.
- [ ] Verify progress and dashboard calculation rules.
- [ ] Add structured logging and monitoring.
- [ ] Document production deployment and database backups.
- [ ] Add Docker support when the deployment configuration is ready.
- [ ] Introduce CI checks for linting, type checking, and tests.

This roadmap is a set of suggested improvements, not a declaration that the listed items are all currently missing.

---

## Contributing

Contributions and improvements should preserve the project's architecture, data integrity, and access-control requirements.

Before submitting a change:

1. Follow the existing TypeScript and project conventions.
2. Keep secrets and local environment files out of commits.
3. Include migrations for schema changes.
4. Test new and modified endpoints.
5. Verify authorization behavior.
6. Update the relevant documentation.

## License

Add the selected license and its terms before publishing or distributing the repository.
