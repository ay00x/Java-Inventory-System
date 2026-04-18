# Spring Boot Auth API

Simple Spring Boot REST API for authentication and user management.

## Features

- username/password login
- BCrypt password hashing
- JWT token authentication
- PostgreSQL database
- admin-only user management endpoints

## Endpoints

- `POST /api/login`
- `POST /api/users`
- `GET /api/users`

## Roles

- `ADMIN`
- `INVENTORY_MANAGER`
- `PRODUCT_MANAGER`

## Database

Default local config in `src/main/resources/application.properties`:

- database: `java_login`
- username: `postgres`
- password: `postgres`

## Run

```bash
bash gradlew bootRun
```
