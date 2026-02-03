# AI Nexus API Reference

Complete API documentation for the AI Nexus backend service.

## Base URL

- **Development:** `http://localhost:8000`
- **Production:** Configure via environment

## Authentication

AI Nexus uses JWT-based authentication with httpOnly cookies.

### Cookie Details

| Property    | Value              |
| ----------- | ------------------ |
| Cookie Name | `session_token`    |
| httpOnly    | `true`             |
| Secure      | `true` (prod only) |
| SameSite    | `lax`              |
| Max Age     | 3600 seconds       |

### Authentication Flow

```
1. POST /auth/jwt/login → Sets session_token cookie
2. All subsequent requests include cookie automatically
3. 401 response → Redirect to login
```

---

## Endpoints

### Authentication

#### Login

```http
POST /auth/jwt/login
Content-Type: application/x-www-form-urlencoded
```

**Request Body:**

| Field      | Type   | Required | Description     |
| ---------- | ------ | -------- | --------------- |
| `username` | string | Yes      | User's email    |
| `password` | string | Yes      | User's password |

**Response:** `200 OK`

```json
{
    "access_token": "eyJ...",
    "token_type": "bearer"
}
```

Sets `session_token` httpOnly cookie.

**Errors:**

| Code | Description         |
| ---- | ------------------- |
| 400  | Invalid credentials |
| 422  | Validation error    |

---

#### Register

```http
POST /auth/register
Content-Type: application/json
```

**Request Body:**

```json
{
    "email": "user@example.com",
    "password": "securepassword"
}
```

**Response:** `201 Created`

```json
{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "is_active": true,
    "is_superuser": false,
    "is_verified": false
}
```

**Errors:**

| Code | Description         |
| ---- | ------------------- |
| 400  | User already exists |
| 422  | Validation error    |

---

### Conversations

#### Create Conversation

```http
POST /api/v1/conversations
Cookie: session_token=<jwt>
Content-Type: application/json
```

**Request Body:** Empty `{}`

**Response:** `201 Created`

```json
{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "New Conversation",
    "created_at": "2026-02-03T12:00:00Z",
    "updated_at": "2026-02-03T12:00:00Z"
}
```

**Errors:**

| Code | Description       |
| ---- | ----------------- |
| 401  | Not authenticated |

---

#### List Conversations (TODO)

```http
GET /api/v1/conversations
Cookie: session_token=<jwt>
```

**Response:** `200 OK`

```json
[
    {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "user_id": "660e8400-e29b-41d4-a716-446655440001",
        "title": "My First Chat",
        "created_at": "2026-02-03T12:00:00Z",
        "updated_at": "2026-02-03T14:30:00Z"
    }
]
```

---

#### Get Conversation (TODO)

```http
GET /api/v1/conversations/{conversation_id}
Cookie: session_token=<jwt>
```

**Path Parameters:**

| Parameter         | Type | Description     |
| ----------------- | ---- | --------------- |
| `conversation_id` | UUID | Conversation ID |

**Response:** `200 OK`

```json
{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "My First Chat",
    "created_at": "2026-02-03T12:00:00Z",
    "updated_at": "2026-02-03T14:30:00Z"
}
```

**Errors:**

| Code | Description               |
| ---- | ------------------------- |
| 401  | Not authenticated         |
| 403  | Not owner of conversation |
| 404  | Conversation not found    |

---

#### Update Conversation (TODO)

```http
PUT /api/v1/conversations/{conversation_id}
Cookie: session_token=<jwt>
Content-Type: application/json
```

**Request Body:**

```json
{
    "title": "Updated Title"
}
```

**Response:** `200 OK`

```json
{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "Updated Title",
    "created_at": "2026-02-03T12:00:00Z",
    "updated_at": "2026-02-03T15:00:00Z"
}
```

---

#### Delete Conversation (TODO)

```http
DELETE /api/v1/conversations/{conversation_id}
Cookie: session_token=<jwt>
```

**Response:** `204 No Content`

---

#### Get Messages (TODO)

```http
GET /api/v1/conversations/{conversation_id}/messages
Cookie: session_token=<jwt>
```

**Response:** `200 OK`

```json
[
    {
        "id": "770e8400-e29b-41d4-a716-446655440000",
        "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
        "content": "Hello, how can I help?",
        "sender": "ai",
        "created_at": "2026-02-03T12:01:00Z"
    },
    {
        "id": "880e8400-e29b-41d4-a716-446655440001",
        "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
        "content": "What's the weather today?",
        "sender": "user",
        "created_at": "2026-02-03T12:00:30Z"
    }
]
```

---

### Chat

#### Stream Chat Response

```http
POST /api/chat
Cookie: session_token=<jwt>
Content-Type: application/json
Accept: text/event-stream
```

**Request Body:**

```json
{
    "question": "What is the meaning of life?",
    "conversation_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

| Field             | Type   | Required | Description                    |
| ----------------- | ------ | -------- | ------------------------------ |
| `question`        | string | Yes      | User's message                 |
| `conversation_id` | UUID   | No       | Links to existing conversation |

**Response:** Server-Sent Events (SSE) stream

```
data: {"type": "delta", "content": "The meaning"}

data: {"type": "delta", "content": " of life is"}

data: {"type": "delta", "content": " subjective..."}

data: [DONE]
```

**Event Format:**

| Field     | Type   | Description                  |
| --------- | ------ | ---------------------------- |
| `type`    | string | Always `"delta"` for content |
| `content` | string | Partial response text        |

**Stream End:** `data: [DONE]\n\n`

**Errors:**

| Code | Description       |
| ---- | ----------------- |
| 401  | Not authenticated |
| 422  | Validation error  |

---

## Data Models

### User

```typescript
interface User {
    id: string; // UUID
    email: string;
    is_active: boolean;
    is_superuser: boolean;
    is_verified: boolean;
}
```

### Conversation

```typescript
interface Conversation {
    id: string; // UUID
    user_id: string; // UUID - owner
    title: string; // Max 255 chars
    created_at: string; // ISO 8601
    updated_at: string; // ISO 8601
}
```

### Message

```typescript
interface Message {
    id: string; // UUID
    conversation_id: string; // UUID
    content: string; // Message text
    sender: "ai" | "user"; // Sender type
    created_at: string; // ISO 8601
}
```

### ChatRequest

```typescript
interface ChatRequest {
    question: string;
    conversation_id?: string; // UUID, optional
}
```

### ChatResponse (SSE Event)

```typescript
interface ChatEvent {
    type: "delta";
    content: string;
}
```

---

## Error Responses

All errors follow this format:

```json
{
    "detail": "Error message description"
}
```

### Common Error Codes

| Code | Description                          |
| ---- | ------------------------------------ |
| 400  | Bad Request - Invalid input          |
| 401  | Unauthorized - Missing/invalid auth  |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource doesn't exist   |
| 422  | Validation Error - Invalid format    |
| 500  | Internal Server Error                |

### Validation Error Format

```json
{
    "detail": [
        {
            "type": "string_type",
            "loc": ["body", "email"],
            "msg": "Input should be a valid string",
            "input": null
        }
    ]
}
```

---

## Rate Limiting

Currently not implemented. Planned for future release.

---

## CORS Configuration

**Allowed Origins:** `http://localhost:3001`

**Allowed Methods:** `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`

**Allowed Headers:** `*`

**Credentials:** `true`

---

## Code Examples

### Python (requests)

```python
import requests

BASE_URL = "http://localhost:8000"
session = requests.Session()

# Login
response = session.post(f"{BASE_URL}/auth/jwt/login", data={
    "username": "user@example.com",
    "password": "password123"
})

# Create conversation
response = session.post(f"{BASE_URL}/api/v1/conversations", json={})
conversation_id = response.json()["id"]

# Stream chat
response = session.post(
    f"{BASE_URL}/api/chat",
    json={"question": "Hello!", "conversation_id": conversation_id},
    stream=True
)

for line in response.iter_lines():
    if line:
        print(line.decode())
```

### JavaScript (fetch)

```javascript
const BASE_URL = "http://localhost:8000";

// Login
await fetch(`${BASE_URL}/auth/jwt/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
        username: "user@example.com",
        password: "password123",
    }),
});

// Create conversation
const convResponse = await fetch(`${BASE_URL}/api/v1/conversations`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
});
const { id: conversationId } = await convResponse.json();

// Stream chat
const chatResponse = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        question: "Hello!",
        conversation_id: conversationId,
    }),
});

const reader = chatResponse.body
    .pipeThrough(new TextDecoderStream())
    .getReader();

while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    console.log(value);
}
```

### cURL

```bash
# Login
curl -X POST http://localhost:8000/auth/jwt/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=password123" \
  -c cookies.txt

# Create conversation
curl -X POST http://localhost:8000/api/v1/conversations \
  -H "Content-Type: application/json" \
  -d '{}' \
  -b cookies.txt

# Chat (streaming)
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "Hello!", "conversation_id": "uuid-here"}' \
  -b cookies.txt \
  --no-buffer
```
