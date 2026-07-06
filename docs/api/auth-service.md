# Auth Service API

Base path (via gateway): `/api/auth`

All endpoints are public (no JWT required) — this service issues the tokens other services validate.

---

## POST `/api/auth/register`

Register a new user.

**Request body**
```json
{
  "fullName": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "password123",
  "role": "USER"
}
```
`role` — `USER` or `RECRUITER` (defaults to `USER` if omitted).

**Response `200`**
```json
{
  "token": "eyJhbGciOi...",
  "userId": "a1b2c3d4",
  "email": "rahul@example.com",
  "fullName": "Rahul Sharma",
  "role": "USER"
}
```

**Response `400`** — email already registered, or validation failure (blank name, invalid email, password < 8 chars).

---

## POST `/api/auth/login`

**Request body**
```json
{
  "email": "rahul@example.com",
  "password": "password123"
}
```

**Response `200`** — same shape as register.

**Response `400`** — invalid credentials.

---

## GET `/api/auth/health`

Liveness check. Returns `200 OK` with no body required for auth.

---

## JWT Claims

Issued tokens contain:
```json
{
  "sub": "rahul@example.com",
  "userId": "a1b2c3d4",
  "role": "USER",
  "fullName": "Rahul Sharma",
  "iat": 1234567890,
  "exp": 1234654290
}
```
Expiry: 24 hours (`jwt.expiration=86400000`).

The API Gateway validates this signature/expiry and forwards `X-User-Id`, `X-User-Email`, `X-User-Role`, `X-User-Name` headers to downstream services — they do not need to re-verify the token themselves.