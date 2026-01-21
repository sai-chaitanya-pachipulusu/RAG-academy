# Dodo Payments Deep Dive & Comparison

## 🦤 What is Dodo Payments?

**Dodo Payments** is a Merchant of Record (MoR) payment platform specifically designed for **SaaS, AI tools, and digital products**. Think of it as a **modern competitor to Paddle and Lemon Squeezy**, but with better pricing.

**Founded**: Recent (2023-2024)  
**Target**: Indie hackers, SaaS startups, AI developers  
**Special Focus**: Global payments, tax compliance automation

---

## 💰 Pricing Breakdown

### Dodo Payments Pricing

```
Base Rate: 4% + $0.40 per transaction

Additional Fees:
- International payments: +1.5%
- Subscriptions/Usage billing: +0.5%
- PayPal/BNPL (Klarna): +3%

Real Cost Examples:
- US customer, $12/mo subscription:
  4% + 0.5% + $0.40 = $0.94 (7.8%)

- International customer, $12/mo:
  4% + 1.5% + 0.5% + $0.40 = $1.12 (9.3%)

- US customer, $99 one-time:
  4% + $0.40 = $4.36 (4.4%)
```

**No Monthly Fees** - Pay as you go! ✅

---

## 📊 Complete Comparison Matrix

| Feature                                     | Dodo Payments      | Lemon Squeezy        | Paddle           | Stripe             | Gumroad              |
| ------------------------------------------- | ------------------ | -------------------- | ---------------- | ------------------ | -------------------- |
| **PRICING**                                 |
| Base Fee                                    | 4% + $0.40         | 5% + processing      | 5% + $0.50       | 2.9% + $0.30       | 10%                  |
| Subscriptions                               | +0.5%              | Included             | Included         | Included           | +5%                  |
| International                               | +1.5%              | Included             | Included         | +1%                | Included             |
| **Effective Cost (US, $12 subscription)**   | **$0.94 (7.8%)**   | **$0.60 (5%)**       | **$1.10 (9.2%)** | **$0.65 (5.4%)\*** | **$1.20 (10%)**      |
| **Effective Cost (Intl, $12 subscription)** | **$1.12 (9.3%)**   | **$0.60 (5%)**       | **$1.10 (9.2%)** | **$1.00 (8.3%)\*** | **$1.20 (10%)**      |
| **MERCHANT OF RECORD**                      |
| Tax Compliance                              | ✅ Full            | ✅ Full              | ✅ Full          | ❌ You handle      | ❌ You handle        |
| VAT/GST Handling                            | ✅ Auto            | ✅ Auto              | ✅ Auto          | ❌ Manual          | ✅ Auto              |
| Sales Tax Remittance                        | ✅ Auto            | ✅ Auto              | ✅ Auto          | ❌ Manual          | ❌ Manual            |
| Legal Liability                             | ✅ Dodo            | ✅ Lemon Squeezy     | ✅ Paddle        | ❌ You             | ❌ You               |
| **FEATURES**                                |
| Subscriptions                               | ✅                 | ✅                   | ✅               | ✅                 | ✅                   |
| One-time Payments                           | ✅                 | ✅                   | ✅               | ✅                 | ✅                   |
| Usage-based Billing                         | ✅                 | ❌                   | ✅               | ✅                 | ❌                   |
| Seat-based Billing                          | ✅                 | ✅                   | ✅               | ✅                 | ❌                   |
| Customer Portal                             | ✅                 | ✅                   | ✅               | ❌ Build it        | ❌ No                |
| Webhooks                                    | ✅                 | ✅                   | ✅               | ✅                 | ✅                   |
| Dunning (Failed Payments)                   | ✅                 | ✅                   | ✅               | ❌ Build it        | ❌ No                |
| **PAYMENT METHODS**                         |
| Credit/Debit Cards                          | ✅ 150+ countries  | ✅ Global            | ✅ Global        | ✅ Global          | ✅ Global            |
| PayPal                                      | ✅ (+3%)           | ✅                   | ✅               | ✅                 | ✅                   |
| Apple/Google Pay                            | ✅                 | ✅                   | ✅               | ✅                 | ❌                   |
| Local Methods (UPI, iDEAL)                  | ✅ 30+ methods     | ✅                   | ✅               | ✅                 | ❌                   |
| BNPL (Klarna, AfterPay)                     | ✅ (+3%)           | ✅                   | ✅               | Via plugins        | ❌                   |
| **DEVELOPER EXPERIENCE**                    |
| API Quality                                 | ⭐⭐⭐⭐ Modern    | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Good    | ⭐⭐⭐⭐⭐ Best    | ⭐⭐ Basic           |
| SDKs                                        | ✅ 7+ languages    | ✅ JS/Node           | ✅ Multiple      | ✅ 15+             | ❌ Limited           |
| No-Code Option                              | ✅                 | ✅                   | ✅               | ❌                 | ✅                   |
| Setup Time                                  | **3-4 hours**      | **3 hours**          | **1 day**        | **5-7 days**       | **2 hours**          |
| **BUSINESS**                                |
| Monthly Fee                                 | ❌ None            | ❌ None              | ❌ None          | ❌ None            | $6 for 0% (optional) |
| Payout Schedule                             | Weekly             | Monthly              | Monthly          | Rolling 2-day      | Weekly               |
| Min. Payout                                 | $10                | $10                  | $10              | $1                 | $10                  |
| Analytics                                   | ✅ MRR, ARR, churn | ✅ Good              | ✅ Excellent     | ✅ Good            | ⭐⭐ Basic           |
| **SUPPORT**                                 |
| Documentation                               | ⭐⭐⭐⭐ Good      | ⭐⭐⭐⭐⭐           | ⭐⭐⭐⭐         | ⭐⭐⭐⭐⭐         | ⭐⭐ Weak            |
| Email Support                               | ✅                 | ✅                   | ✅               | ✅                 | ✅                   |
| Live Chat                                   | ✅                 | ❌                   | ✅ Enterprise    | ✅ Paid            | ❌                   |

**Note**: Stripe costs don't include tax compliance, customer portal, or dunning - you build these yourself.

---

## 🎯 Dodo Payments - Detailed Analysis

### ✅ Pros

1. **Lower Base Fee than Lemon Squeezy**

   - 4% vs 5% = 20% cheaper on base transactions
   - Great for high volume

2. **Merchant of Record**

   - Handles all tax compliance (VAT, GST, sales tax)
   - You don't worry about international regulations
   - Legal liability shifts to Dodo

3. **Made for SaaS/AI Products**

   - API-first design
   - Built specifically for your use case
   - Modern tech stack

4. **Pay-as-you-go**

   - No monthly fees
   - Only pay when you make sales

5. **30+ Payment Methods**

   - UPI (India) - huge market!
   - iDEAL (Netherlands)
   - Klarna, AfterPay
   - Better global reach

6. **Usage-based Billing**

   - Lemon Squeezy doesn't have this
   - Great for AI APIs (e.g., charge per embedding)

7. **Weekly Payouts**

   - vs Lemon Squeezy's monthly
   - Better cash flow!

8. **Modern Platform**
   - Built recently with modern tech
   - Clean API design
   - Active development

### ❌ Cons

1. **Higher Fees for Subscriptions**

   - Base 4% + 0.5% subscription fee = 4.5%
   - vs Lemon Squeezy flat 5% (close!)

2. **International Fees Add Up**

   - +1.5% for non-US cards
   - Can reach 9%+ total

3. **Newer Platform**

   - Less proven than Stripe/Paddle
   - Smaller ecosystem
   - Fewer integrations

4. **Transaction Fee ($0.40)**

   - Higher than Stripe ($0.30)
   - Bad for micro-transactions (<$5)

5. **PayPal/BNPL Extra**

   - +3% for these methods
   - Can get expensive

6. **Less Mature**
   - Potential bugs
   - Features still rolling out
   - Smaller support team

---

## 💡 Real-World Cost Comparison

Let's calculate **actual costs** for RAG Academy:

### Scenario: 1,000 Customers

**Assumptions:**

- 500 US customers @ $12/mo
- 500 International customers @ $12/mo
- Monthly revenue: $12,000

---

#### Dodo Payments:

```
US Customers (500):
- Fee: 4% + 0.5% (subscription) + $0.40
- Cost per transaction: $0.94
- Total: 500 × $0.94 = $470

International Customers (500):
- Fee: 4% + 0.5% + 1.5% (intl) + $0.40
- Cost per transaction: $1.12
- Total: 500 × $1.12 = $560

Monthly Fees: $1,030
Annual Fees: $12,360
Effective Rate: 8.6%

Net Revenue: $12,000 - $1,030 = $10,970/mo
```

---

#### Lemon Squeezy:

```
All Customers (1,000):
- Flat 5% of $12,000
- Monthly Fees: $600
- Annual Fees: $7,200
- Effective Rate: 5%

Net Revenue: $12,000 - $600 = $11,400/mo
```

---

#### Stripe (DIY):

```
US Customers (500):
- Fee: 2.9% + $0.30
- Cost: $0.65 per transaction
- Total: 500 × $0.65 = $325

International (500):
- Fee: 3.9% + $0.30
- Cost: $0.77 per transaction
- Total: 500 × $0.77 = $385

Monthly Fees: $710
BUT you need to add:
- Tax compliance service: $99/mo (Quaderno/TaxJar)
- Engineering time: $2,000 (one-time)
- Maintenance: Your time ongoing

Realistic Total Year 1: $710 × 12 + $99 × 12 + $2,000 = $11,708
Effective Rate: 6.5% (+ your time)

Net Revenue: $12,000 - $809 = $11,191/mo
```

---

#### Paddle:

```
All Customers (1,000):
- 5% + $0.50 per transaction
- Cost: $1.10 per transaction
- Monthly Fees: $1,100
- Annual Fees: $13,200
- Effective Rate: 9.2%

Net Revenue: $12,000 - $1,100 = $10,900/mo
```

---

### 📊 Winner Ranking (For RAG Academy)

**By Net Revenue (Monthly):**

1. 🥇 **Lemon Squeezy**: $11,400/mo (95.0% net)
2. 🥈 **Stripe (DIY)**: $11,191/mo (93.3% net) _but requires work_
3. 🥉 **Dodo Payments**: $10,970/mo (91.4% net)
4. **Paddle**: $10,900/mo (90.8% net)

**By Ease + Value:**

1. 🏆 **Lemon Squeezy** - Best mix of price and simplicity
2. **Dodo Payments** - Close second, slightly more complex fees
3. **Stripe** - If you have engineering resources
4. **Paddle** - Most expensive

---

## 🤔 When to Choose Each

### Choose **Dodo Payments** if:

- ✅ You want **weekly payouts** (vs Lemon Squeezy monthly)
- ✅ You need **usage-based billing** (charge per API call)
- ✅ You'll have mostly **US customers** (lower fees)
- ✅ You want to support modern indie platform
- ✅ You need 30+ payment methods (UPI, etc.)

### Choose **Lemon Squeezy** if:

- ✅ You want **simplest pricing** (flat 5%)
- ✅ You have **international customers** (no extra fees)
- ✅ You want **most proven MoR** after Paddle
- ✅ You prioritize **predictable costs**
- ✅ You don't need usage-based billing

### Choose **Stripe** if:

- ✅ You have **engineering resources** (5+ days)
- ✅ You want **lowest transaction fees** (2.9%)
- ✅ You need **maximum flexibility**
- ✅ You're building complex billing logic
- ✅ You don't mind compliance overhead

### Choose **Paddle** if:

- ✅ You're already using it
- ✅ You need battle-tested reliability
- ✅ Money is not an issue

---

## 🚀 My Recommendation for RAG Academy

### **Best Choice: Lemon Squeezy**

**Why:**

1. **Simplest pricing** - No gotchas, flat 5%
2. **$430/mo more revenue** than Dodo Payments
3. **Most proven** MoR platform after Paddle
4. **Better for international** customers (50% of your audience)
5. **Same setup time** as Dodo (3 hours)

**Math:**

```
Extra revenue vs Dodo: $430/mo × 12 = $5,160/year
That's:
- 43 annual Pro subscriptions
- 105 monthly Pro subscriptions
- Worth the tradeoffs!
```

---

### **Second Choice: Dodo Payments**

**When to use it instead:**

- Most customers are **US-based** (fees drop to 4.5%)
- You need **weekly payouts** for cash flow
- You're building **usage-based AI product** later
- You want to support a **cool indie project**

**Calculation if 80% US customers:**

```
US (800): $0.94 × 800 = $752
Intl (200): $1.12 × 200 = $224
Total: $976/mo (vs Lemon Squeezy $600)

Still more expensive, but closer!
```

---

## 🛠️ Implementation Effort

### Dodo Payments Setup:

```bash
# 1. Sign up (10 min)
https://dodopayments.com

# 2. Create products (30 min)
- Pro Monthly: $12/mo
- Pro Annual: $99/yr
- Team Monthly: $39/mo
- Team Annual: $390/yr

# 3. Get API keys (5 min)

# 4. Integrate webhook (2 hours)
npm install @dodopayments/sdk

# 5. Test checkout (1 hour)

Total: ~3-4 hours
```

### Code Example:

```typescript
import { DodoPayments } from "@dodopayments/sdk";

const dodo = new DodoPayments({
  apiKey: process.env.DODO_API_KEY,
});

// Create checkout
const checkout = await dodo.checkout.create({
  productId: "prod_abc123",
  successUrl: "https://rag-academy.com/success",
  cancelUrl: "https://rag-academy.com/pricing",
  metadata: {
    userId: user.id,
    tier: "pro",
  },
});

// Redirect user
window.location.href = checkout.url;
```

### Webhook Handler:

```typescript
// /api/webhooks/dodo
import { DodoPayments } from "@dodopayments/sdk";

export async function POST(req: Request) {
  const signature = req.headers.get("dodo-signature");
  const payload = await req.text();

  const event = DodoPayments.webhooks.verify(
    payload,
    signature,
    process.env.DODO_WEBHOOK_SECRET
  );

  if (event.type === "payment.succeeded") {
    // Grant access
    await supabase.from("subscriptions").insert({
      user_id: event.data.metadata.userId,
      tier: event.data.metadata.tier,
      // ... rest of your logic
    });
  }

  return new Response("OK");
}
```

---

## 📈 Growth Trajectory

### At Different Revenue Levels:

**$1,000/mo MRR:**

- Lemon Squeezy: -$50/mo
- Dodo Payments: -$86/mo
- Difference: $36/mo (not big deal)

**$10,000/mo MRR:**

- Lemon Squeezy: -$500/mo
- Dodo Payments: -$860/mo
- Difference: $360/mo (noticeable)

**$50,000/mo MRR:**

- Lemon Squeezy: -$2,500/mo
- Dodo Payments: -$4,300/mo
- Difference: **$1,800/mo** (significant!)

**$100,000/mo MRR:**

- Lemon Squeezy: -$5,000/mo
- Dodo Payments: -$8,600/mo
- Difference: **$3,600/mo** ($43k/year!)

**At scale, consider migrating to Stripe** to save that 2-3%.

---

## ✅ Final Verdict

| Metric               | Winner                    | Reason                                  |
| -------------------- | ------------------------- | --------------------------------------- |
| **Best Value**       | 🥇 Lemon Squeezy          | Lowest effective fees for your use case |
| **Fastest Setup**    | 🥇 Dodo / Lemon Squeezy   | Both ~3 hours                           |
| **Best Cash Flow**   | 🥇 Dodo Payments          | Weekly payouts                          |
| **Most Features**    | 🥇 Stripe                 | But requires most work                  |
| **Best for Scale**   | 🥇 Stripe                 | Lowest transaction fees                 |
| **Most Trustworthy** | 🥇 Stripe / Lemon Squeezy | Proven platforms                        |

---

## 🎯 Action Plan

### Option 1: Play it Safe (RECOMMENDED)

**Use Lemon Squeezy**

- Saves you $430/mo vs Dodo
- Most predictable costs
- Proven platform
- Same 3-hour setup

### Option 2: Support Indie Tech

**Use Dodo Payments**

- $360/mo more expensive at $10k MRR
- Cool new platform
- Weekly payouts (better cash flow)
- Great for usage-based pricing later

### Option 3: Best Long-term

**Start with Lemon Squeezy, migrate to Stripe at $50k+ MRR**

- Low effort now
- Optimize later when it matters
- Saves $3,600/mo at $100k MRR

---

## 👀 Bottom Line

**Dodo Payments is a solid choice**, but for RAG Academy specifically:

**Lemon Squeezy wins** because:

1. ✅ $5,160/year more net revenue
2. ✅ Simpler fee structure (just 5%)
3. ✅ Better for international customers
4. ✅ More mature platform
5. ✅ Same ease of use

**Consider Dodo if:**

- 80%+ customers will be from US
- You need weekly payouts badly
- You're building usage-based features

**My recommendation**: Start with **Lemon Squeezy**, re-evaluate if your customer base becomes heavily US-focused.

Both are WAY better than dealing with Stripe compliance yourself!
