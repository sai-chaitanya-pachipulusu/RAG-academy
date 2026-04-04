# RAG Academy API Documentation

Base URL: `https://ragacademy.space/api`

## Authentication

Most API routes require authentication via Supabase. Pass the token in one of:
- `Authorization: Bearer <token>` header
- `sb-access-token` cookie

---

## Endpoints

### Search

**GET** `/api/search?q=<query>`

Search challenges and lessons.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| q | string | No | Search query |

**Response:**
```json
{
  "results": [
    {
      "title": "Dot Product",
      "description": "Compute dot product of two vectors",
      "type": "challenge",
      "slug": "dot-product",
      "phase": "phase-0",
      "url": "/challenges/dot-product"
    }
  ]
}
```

---

### Checkout

**POST** `/api/checkout`

Create a Polar checkout session.

**Auth:** Required

**Body:**
```json
{
  "tier": "pro",
  "billingCycle": "monthly"
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| tier | string | Yes | `pro`, `team`, `lifetime` |
| billingCycle | string | Yes | `monthly`, `annual`, `lifetime` |

**Response:**
```json
{
  "url": "https://polar.sh/checkout/..."
}
```

---

### AI Code Review

**POST** `/api/ai/code-review`

Get AI-powered code review feedback.

**Auth:** Required

**Body:**
```json
{
  "code": "def cosine_similarity(a, b): ...",
  "challengeSlug": "cosine-similarity",
  "language": "python"
}
```

**Response:**
```json
{
  "success": true,
  "feedback": { ... },
  "quota": {
    "used": 1,
    "limit": 10,
    "remaining": 9,
    "resetsAt": 1712000000000
  }
}
```

**GET** `/api/ai/code-review`

Get current quota status.

**Auth:** Required

**Response:**
```json
{
  "success": true,
  "quota": {
    "used": 3,
    "limit": 10,
    "remaining": 7,
    "resetsAt": 1712000000000,
    "hasUnlimited": false
  }
}
```

---

### Progress Sync

**POST** `/api/progress/sync`

Sync challenge progress to the server.

**Auth:** Required

**Body:**
```json
{
  "progress": [
    {
      "challengeSlug": "dot-product",
      "status": "completed",
      "score": 95,
      "timeSpentSeconds": 120
    }
  ]
}
```

---

### Payments Test

**GET** `/api/payments/test`

Check payment environment configuration.

**Response:**
```json
{
  "status": "Payment test API active",
  "provider": "polar",
  "environment": "development"
}
```

**POST** `/api/payments/test`

Test payment actions.

**Body:**
```json
{
  "action": "create-checkout",
  "tier": "pro",
  "billingCycle": "monthly"
}
```

Actions: `create-checkout`, `validate-env`, `simulate-webhook`, `test-cards`, `create-test-subscription`, `simulate-payment-scenario`

---

### Webhooks

**POST** `/api/webhooks/polar`

Polar payment webhook handler.

**Headers:**
- `polar-signature`: HMAC-SHA256 signature

**POST** `/api/webhooks/subscription`

Subscription webhook handler.

**POST** `/api/webhooks/lemonsqueezy`

Legacy LemonSqueezy webhook (stub).

---

### Email

**POST** `/api/email/send`

Send an email.

**Auth:** Required
**Rate Limit:** 5 per minute per IP

**Body:**
```json
{
  "to": "user@example.com",
  "subject": "Welcome",
  "html": "<p>Hello!</p>",
  "emailType": "welcome"
}
```

**POST** `/api/email/preferences`

Update email preferences.

**GET** `/api/email/preferences`

Get email preferences.

**POST** `/api/email/unsubscribe`

Unsubscribe from emails.

**POST** `/api/email/webhook`

Resend webhook handler.

---

### Cron Jobs

All cron routes require `Authorization: Bearer <CRON_SECRET>`.

- **POST** `/api/cron/weekly-digest` — Send weekly digest emails
- **POST** `/api/cron/daily-streak-reminders` — Send daily streak reminders
- **POST** `/api/cron/countdown-emails` — Send countdown emails

---

### Analytics

**GET** `/api/analytics`

Get user analytics summary.

**Auth:** Required

**GET** `/api/analytics/sessions`

Get learning sessions.

**POST** `/api/analytics/sessions`

Start a learning session.

---

### Recommendations

**GET** `/api/recommendations?userId=<id>&type=personalized&limit=5`

Get personalized challenge recommendations.

---

### Performance

**POST** `/api/performance`

Submit performance metrics.

---

## Error Responses

| Status | Description |
|--------|-------------|
| 400 | Bad request — invalid input |
| 401 | Unauthorized — missing or invalid auth |
| 403 | Forbidden — insufficient permissions |
| 429 | Too many requests — rate limited |
| 500 | Internal server error |
