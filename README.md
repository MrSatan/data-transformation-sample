# Job Offer Aggregator API

![NestJS](https://img.shields.io/badge/NestJS-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white) ![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)

A scalable backend application built with NestJS that fetches job offer data from multiple external APIs, transforms it into a unified structure, stores it in a PostgreSQL database, and exposes a robust, filterable API to retrieve the data.

## Overview

This project serves as a central hub for job offers by integrating with disparate data providers. It periodically fetches data via a configurable cron job, transforms the varied data structures into a clean, unified format, and handles data storage efficiently, preventing duplicates. The core feature is a powerful REST API endpoint that allows clients to retrieve, filter, sort, and paginate through the aggregated job offers.

The application is built with a focus on clean architecture, scalability, and best practices, demonstrating proficiency in modern backend development techniques.

---

## Key Features

- **Scalable Data Transformation**: Easily integrate new data providers with minimal code changes thanks to a modular mapper pattern.
- **Scheduled Data Fetching**: A cron job, with its frequency configurable via environment variables, automatically keeps the job data up-to-date.
- **Developer-Friendly API**: A single, well-documented endpoint (`/api/job-offers`) built for ease of use, featuring a generic and reusable query-building system for powerful filtering, sorting, and pagination.
- **Type-Safe & Clean Code**: Written entirely in TypeScript and SOLID principles.
- **Advanced Error Handling**: Graceful handling of API call failures , database errors, and invalid client requests.
- **Comprehensive Testing**: Includes unit tests for services and data mappers, as well as end-to-end (e2e) tests for the API endpoint.
- **Automated API Documentation**: Interactive API documentation is automatically generated and served with Swagger (OpenAPI).
- **Efficient Duplicate Prevention**: Uses a database `UNIQUE` constraint strategy to efficiently handle duplicate job records during data ingestion.

---

## Architectural Decisions

This project employs several advanced design patterns to ensure scalability and maintainability:

- **Generic Query Builder**: Instead of hardcoding filter logic in the service layer, a reusable `QueryBuilderHelper` is used. This allows new filters to be added declaratively without modifying the core query logic, adhering to the Open/Closed Principle.
- **Factory Provider for Mappers**: To decouple the `JobOffersService` from concrete mapper implementations, a factory provider is used to inject a collection of all available mappers. This makes adding new data providers a plug-and-play process.
- **Dependency Injection Everywhere**: All services, helpers, and mappers are managed by the NestJS DI container. There are no manual `new` instantiations in the business logic, making the application highly testable and modular.

---

---

## Setup and Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
- A running [PostgreSQL](https://www.postgresql.org/download/) instance

### 1. Clone the Repository

```bash
git clone https://github.com/MrSatan/data-transformation-sample.git
cd data-transformation-sample
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

First, ensure you have created a new database in your PostgreSQL instance. Then, create a `.env` file in the project root.

Now, open the `.env` file and fill in your PostgreSQL database credentials.

```env
# .env

# PostgreSQL Database Configuration
APP_NAME=data-transformation-sample
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_DATABASE=job_offers_db

# Scheduler Configuration (Cron format)
CRON_SCHEDULE='*/10 * * * *'
```

---

## Running the Application

To start the application in development mode with hot-reloading:

```bash
npm run start:dev
```

The application will be running on `http://localhost:3000`.

---

## Running Tests

This project includes a comprehensive test suite.

### Run Unit & Integration Tests

This command runs all files ending in `.spec.ts`.

```bash
npm run test
```

### Run End-to-End (E2E) Tests

This command runs all files ending in `.e2e-spec.ts`.

```bash
npm run test:e2e
```

---

## API Documentation

Interactive API documentation is available through Swagger UI. Once the application is running, navigate to:

**[`http://localhost:3000/api/docs`](http://localhost:3000/api/docs)**

This interface allows you to explore the API endpoint, view schemas, and execute requests directly from your browser.

### API Endpoint: `GET /api/job-offers`

Retrieves a paginated, filtered, and sorted list of job offers.

#### Query Parameters

| Parameter   | Type     | Description                                                                                                                              | Example                        |
|-------------|----------|------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------|
| `page`      | `number` | The page number for pagination. Defaults to `1`.                                                                                         | `?page=2`                      |
| `limit`     | `number` | The number of items per page. Defaults to `10`, max `100`.                                                                               | `?limit=20`                    |
| `title`     | `string` | Filters by job title (case-insensitive, partial match).                                                                                  | `?title=Engineer`              |
| `location`  | `string` | Filters by location (case-insensitive, partial match).                                                                                   | `?location=Francisco`          |
| `minSalary` | `number` | Filters for jobs with a minimum salary greater than or equal to the value.                                                                 | `?minSalary=100000`            |
| `skills`    | `string` | Filters for jobs where the skills array contains ALL of the specified skills (comma-separated). Uses PostgreSQL's array containment (`@>`) operator. | `?skills=React,Node.js`        |
| `sortBy`    | `string` | The field to sort by. Allowed values: `postedAt`,`title`, `salaryMin`.                                                                           | `?sortBy=salaryMin`            |
| `sortOrder` | `string` | The sort order. Allowed values: `ASC`, `DESC`. Defaults to `DESC`.                                                                       | `?sortOrder=ASC`               |

#### Example Request (cURL)

```bash
curl -X GET "http://localhost:3000/api/job-offers?title=Backend&minSalary=90000&sortBy=postedAt&sortOrder=DESC"
```

#### Example Success Response (`200 OK`)

```json
{
  "items": [
    {
      "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
      "externalId": "P1-339",
      "title": "Backend Engineer",
      "location": "San Francisco, CA",
      "description": null,
      "companyName": "TechCorp",
      "salaryMin": 95000,
      "salaryMax": 141000,
      "currency": "USD",
      "skills": ["JavaScript", "Node.js"],
      "postedAt": "2025-08-01T02:13:47.585Z",
      "sourceApi": "Provider1",
      "createdAt": "2025-08-12T06:46:00.000Z",
      "updatedAt": "2025-08-12T06:46:00.000Z"
    }
  ],
  "totalItems": 1,
  "currentPage": 1,
  "totalPages": 1
}
```

#### Example Error Response (`400 Bad Request`)

If an invalid query parameter is provided (e.g., `page=-1`):

```json
{
  "message": [
    "page must not be less than 1"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

---

