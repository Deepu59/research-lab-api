# Research Lab API

A backend API for managing research experiments. Researchers can create experiments, log runs (trials) with measured values, import and export data as CSV, and get summary statistics per measurement.

I built this to practice backend development with TypeScript and NestJS, using the kind of workflow a research assistant deals with every day: collecting, organizing and summarizing experiment data.

## Features

- Create, read, update and delete **experiments** (name, hypothesis, free-form parameters)
- Log **runs** for an experiment with any number of named numeric measurements
- **CSV import** (upload a file) and **CSV export** of an experiment's runs
- **Statistics** per measurement: count, mean, median, standard deviation, min, max
- Input validation with clear error messages (400) and proper 404 responses
- Interactive API documentation (Swagger UI) at `/docs`
- Unit tests for the statistics and CSV logic, plus end-to-end API tests

## Tech stack

| Area | Choice |
| --- | --- |
| Language / runtime | TypeScript, Node.js |
| Framework | NestJS 10 |
| Database / ORM | SQLite (better-sqlite3) with TypeORM |
| Validation | class-validator, class-transformer |
| API docs | @nestjs/swagger |
| Testing | Jest, Supertest |

## Getting started

Requirements: Node.js 18 or newer.

```bash
npm install
npm run start:dev
```

The API runs at http://localhost:3000 and the interactive docs are at http://localhost:3000/docs.

The database is a local SQLite file (`research.db`), created automatically. Set `DB_PATH` to change its location and `PORT` to change the port.

### Run the tests

```bash
npm test
```

## API overview

| Method | Path | Description |
| --- | --- | --- |
| POST | `/experiments` | Create an experiment |
| GET | `/experiments` | List experiments |
| GET | `/experiments/:id` | Get one experiment |
| PATCH | `/experiments/:id` | Update an experiment |
| DELETE | `/experiments/:id` | Delete an experiment and its runs |
| POST | `/experiments/:id/runs` | Log a run |
| GET | `/experiments/:id/runs` | List runs |
| DELETE | `/experiments/:id/runs/:runId` | Delete a run |
| POST | `/experiments/:id/runs/import` | Import runs from a CSV file (form field `file`) |
| GET | `/experiments/:id/runs/export` | Download runs as CSV |
| GET | `/experiments/:id/stats` | Summary statistics per measurement |

### Example

Create an experiment:

```bash
curl -X POST http://localhost:3000/experiments \
  -H "Content-Type: application/json" \
  -d '{"name": "Motor speed vs battery voltage", "parameters": {"motor": "BO"}}'
```

Log a run:

```bash
curl -X POST http://localhost:3000/experiments/1/runs \
  -H "Content-Type: application/json" \
  -d '{"measurements": {"speed": 1.2, "voltage": 7.4}, "notes": "fully charged"}'
```

Get statistics:

```bash
curl http://localhost:3000/experiments/1/stats
```

```json
{
  "experimentId": 1,
  "runCount": 3,
  "measurements": {
    "speed": { "count": 3, "mean": 2, "median": 2, "stdDev": 1, "min": 1, "max": 3 }
  }
}
```

### CSV format

The first row is the header. Every column is a numeric measurement, except an optional `notes` column. Empty cells are skipped.

```csv
speed,voltage,notes
1.2,7.4,fully charged
1.0,7.1,
```

## Project structure

```
src/
  experiments/   entity, DTOs, service, controller, module
  runs/          entity, DTOs, service, controller, module
  common/        pure helpers: statistics and CSV parsing (unit tested)
  app.module.ts  database setup and module wiring
  main.ts        bootstrap and Swagger setup
test/            end-to-end API tests
```

## Design decisions

- **Measurements stored as JSON per run**: experiments differ a lot, so each run holds a flexible set of named numbers instead of fixed columns.
- **Statistics and CSV logic are pure functions**: they have no database or framework dependency, so they are easy to test.
- **SQLite for simplicity**: no setup needed to run the project. TypeORM makes switching to PostgreSQL a small change.
- **`synchronize: true`** creates tables automatically, which is fine for a demo. A production system should use migrations.

## Roadmap

- Authentication (JWT) so each researcher only sees their own experiments
- Endpoint to receive live sensor readings from a microcontroller (for example an ESP32)
- Charts and run-to-run comparison
- PostgreSQL and Docker setup

## Author

Dipak Chaudhari · [GitHub](https://github.com/Deepu59)
