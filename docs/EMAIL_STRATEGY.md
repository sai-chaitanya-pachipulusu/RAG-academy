# Email Sequence - Updated Strategy

## Key Changes

✅ **NO Daily Emails** - Only 3 emails total per phase  
✅ **Email Tracking** - Prevents duplicate sends  
✅ **Phase-Specific** - Different emails for Phase 1 → 2 and Phase 2 → 3

---

## Email Frequency

**Total emails per user per phase: 3**

| Days Remaining | Email Sent               | Subject                                    |
| -------------- | ------------------------ | ------------------------------------------ |
| 7 days         | Phase 1: 7-day countdown | "⏰ 7 days left to lock in $12/month"      |
| 3 days         | Phase 1: 3-day countdown | "🚨 Last chance: $12/month ends in 3 days" |
| 1 day          | Phase 1: 1-day countdown | "🚨 FINAL HOURS: $12/month ends tomorrow"  |

**Cron Schedule**: Daily at 9 AM EST  
**Actual Sends**: Only on days 7, 3, and 1 before price increase

---

## How It Works

### 1. Cron Job Checks Daily

```typescript
// Runs daily but only sends on milestone days
if (daysRemaining === 7) {
  emailType = "7day";
} else if (daysRemaining === 3) {
  emailType = "3day";
} else if (daysRemaining === 1) {
  emailType = "1day";
} else {
  return { message: "Not a milestone day - skip" };
}
```

### 2. Email Tracking Prevents Duplicates

```sql
-- sent_emails table
CREATE TABLE sent_emails (
  user_id UUID,
  email_type TEXT, -- e.g., "phase1_7day"
  sent_at TIMESTAMPTZ,
  UNIQUE(user_id, email_type)
);
```

### 3. Check Before Sending

```typescript
// Check if already sent
const { data: existingEmail } = await supabase
  .from("sent_emails")
  .select("id")
  .eq("user_id", user.id)
  .eq("email_type", "phase1_7day")
  .single();

if (existingEmail) {
  return { skipped: true }; // Don't send again
}
```

---

## Email Timeline Example

### Phase 1 → Phase 2 (Jan 4 - Apr 4, 2026)

| Date   | Days Left | Email Action              |
| ------ | --------- | ------------------------- |
| Mar 29 | 7 days    | ✅ Send 7-day countdown   |
| Mar 30 | 6 days    | ⏭️ Skip (not milestone)   |
| Mar 31 | 5 days    | ⏭️ Skip                   |
| Apr 1  | 4 days    | ⏭️ Skip                   |
| Apr 2  | 3 days    | ✅ Send 3-day countdown   |
| Apr 3  | 2 days    | ⏭️ Skip                   |
| Apr 4  | 1 day     | ✅ Send 1-day countdown   |
| Apr 5  | 0 days    | Price increases to $15/mo |

**Total emails sent: 3 per user**

---

## Database Tracking

### Check Email History

```sql
-- See all emails sent to a user
SELECT * FROM sent_emails
WHERE user_id = 'user-id-here'
ORDER BY sent_at DESC;

-- Count emails sent for Phase 1
SELECT email_type, COUNT(*)
FROM sent_emails
WHERE email_type LIKE 'phase1%'
GROUP BY email_type;
```

### Results Example

```
email_type      | count
----------------|-------
phase1_7day     | 234
phase1_3day     | 189
phase1_1day     | 156
```

---

## Benefits

✅ **User-Friendly** - 3 emails over 7 days, not daily spam  
✅ **Strategic** - Emails sent at key decision points  
✅ **Reliable** - Duplicate prevention via database  
✅ **Scalable** - Works across all phase transitions  
✅ **Automated** - Set it and forget it

---

## Cron Configuration

### Vercel Setup

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/countdown-emails",
      "schedule": "0 14 * * *"
    }
  ]
}
```

**Schedule**: Daily at 9 AM EST (14:00 UTC)  
**Cost**: Free on Vercel Pro ($20/month)

---

## Testing

### Manual Test

```bash
# Trigger the cron endpoint manually
curl -X GET "https://your-domain.com/api/cron/countdown-emails" \
  -H "Authorization: Bearer your-cron-secret"

# Response on non-milestone day:
{
  "message": "Not a milestone day (45 days remaining)",
  "daysRemaining": 45
}

# Response on milestone day (7 days):
{
  "message": "Sent 7day countdown emails",
  "daysRemaining": 7,
  "totalUsers": 500,
  "successful": 495,
  "skipped": 3,
  "failed": 2
}
```

---

## Monitoring

### Key Metrics

```sql
-- Email delivery rate
SELECT
  email_type,
  COUNT(*) as sent,
  COUNT(*) * 100.0 / (SELECT COUNT(DISTINCT user_id) FROM auth.users) as delivery_rate
FROM sent_emails
GROUP BY email_type;

-- Users who received all 3 emails
SELECT COUNT(DISTINCT user_id)
FROM sent_emails
WHERE email_type IN ('phase1_7day', 'phase1_3day', 'phase1_1day');
```

---

## Migration

### Apply Sent Emails Table

```bash
# Run the migration
supabase db push

# Or manually
psql -h your-db.supabase.co -d postgres -f supabase/migrations/004_add_sent_emails.sql
```

---

## Updated Package Dependencies

```bash
# Install required packages
npm install stripe resend @supabase/supabase-js
```

---

## Summary

**Old System**: Daily emails = 91 emails per user (annoying!)  
**New System**: 3 strategic emails per user (respectful!)

Users will only receive emails at critical decision points:

1. **7 days** - "Hey, price is changing soon"
2. **3 days** - "Last chance is approaching"
3. **1 day** - "Final hours to lock in this price"

Much better user experience! 🎉
