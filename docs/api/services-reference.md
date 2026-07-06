# API Reference — All Services

All endpoints below are accessed through the API Gateway at `http://localhost:8080`. Authenticated endpoints require `Authorization: Bearer <jwt>`. See [`auth-service.md`](auth-service.md) for how to obtain a token.

---

## User Service — `/api/users`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/internal/create` | Internal only | Create profile after registration (called by auth flow) |
| GET | `/me` | ✅ | Get my full profile |
| GET | `/search?keyword=` | Public | Search users by name/headline/location |
| GET | `/{userId}` | ✅ | Get another user's profile (increments view count) |
| PUT | `/me` | ✅ | Update profile (headline, bio, location, skills[], experiences[]) |
| POST | `/me/picture` | ✅ | Upload profile picture (multipart `file`) |
| POST | `/me/resume` | ✅ | Upload resume (multipart `file`) |

**Update profile body**
```json
{
  "fullName": "Rahul Sharma",
  "headline": "Senior Backend Developer",
  "bio": "...",
  "location": "Pune, Maharashtra",
  "skills": ["Java", "Spring Boot"],
  "experiences": [
    { "company": "TechCorp", "role": "Backend Dev", "startDate": "2021-06", "endDate": "", "description": "..." }
  ]
}
```

---

## Post Service — `/api/posts`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | ✅ | Create post (multipart: `content`, `type`, optional `image`) |
| GET | `/feed?page=` | ✅ | Paginated feed, newest first |
| GET | `/user/{userId}` | ✅ | Posts by a specific user |
| GET | `/{postId}` | ✅ | Single post detail |
| DELETE | `/{postId}` | ✅ | Delete own post |
| POST | `/{postId}/like` | ✅ | Toggle like |
| POST | `/{postId}/comments` | ✅ | Add comment `{ "content": "..." }` |
| GET | `/{postId}/comments` | ✅ | List comments |

Publishes to Kafka topic `post-events` on create/like/comment for notification-service to consume.

---

## Connection Service — `/api/connections`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/request/{receiverId}?receiverName=` | ✅ | Send connection request |
| PUT | `/{connectionId}/accept` | ✅ | Accept a pending request |
| PUT | `/{connectionId}/reject` | ✅ | Reject a pending request |
| DELETE | `/{connectionId}` | ✅ | Remove an existing connection |
| GET | `/me` | ✅ | My accepted connections |
| GET | `/pending` | ✅ | Requests received, awaiting my response |
| GET | `/sent` | ✅ | Requests I've sent, awaiting response |
| GET | `/status/{otherUserId}` | ✅ | Relationship status: `NOT_CONNECTED` / `PENDING` / `ACCEPTED` |
| GET | `/count/{userId}` | ✅ | Connection count for a user |

Publishes to Kafka topic `connection-events` on request/accept.

---

## Messaging Service — `/api/messages`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/send` | ✅ | Send a message `{ "receiverId", "receiverName", "content" }` |
| GET | `/conversations` | ✅ | List my conversations, most recent first |
| GET | `/conversation/{conversationId}?page=` | ✅ | Paginated message history |

**WebSocket:** connect to `ws://localhost:8085/ws` (SockJS/STOMP) for real-time delivery; REST endpoints above are the fallback/history API.

---

## Job Service — `/api/jobs`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | ✅ (Recruiter) | Create job posting |
| GET | `/` | ✅ | All open jobs, paginated |
| GET | `/search?keyword=` | ✅ | Search jobs |
| GET | `/{jobId}` | ✅ | Job detail |
| PUT | `/{jobId}/close` | ✅ (Owner) | Close a job posting |
| DELETE | `/{jobId}` | ✅ (Owner) | Delete a job posting |
| GET | `/my-posted` | ✅ (Recruiter) | Jobs I've posted |
| POST | `/{jobId}/apply` | ✅ | Apply `{ "coverLetter", "resumeUrl" }` |
| GET | `/my-applications` | ✅ | My submitted applications |
| GET | `/{jobId}/applicants` | ✅ (Owner) | All applicants for a job |
| PUT | `/applications/{applicationId}/status?status=` | ✅ (Owner) | Update status: `REVIEWING` / `SHORTLISTED` / `REJECTED` / `HIRED` |

Publishes to Kafka topic `job-events` on application submit/status change.

---

## Notification Service — `/api/notifications`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | ✅ | My notifications, most recent first |
| GET | `/unread-count` | ✅ | Count of unread notifications |
| PUT | `/{id}/read` | ✅ | Mark one as read |
| PUT | `/read-all` | ✅ | Mark all as read |

Consumes `post-events`, `connection-events`, `job-events` from Kafka; also sends email via Gmail SMTP for select notification types.

---

## Common Response Shapes

**Paginated response**
```json
{
  "content": [ /* items */ ],
  "totalElements": 42,
  "totalPages": 5,
  "number": 0,
  "size": 10
}
```

**Error response**
```json
{
  "message": "Human-readable error description",
  "status": 400,
  "timestamp": "2026-07-05T10:00:00Z"
}
```