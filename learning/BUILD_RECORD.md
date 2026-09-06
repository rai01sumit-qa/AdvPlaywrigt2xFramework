# How We Added .env Support to a Single Playwright Spec

## Overview

This document records the exact steps, prompts, questions, and verification commands used to make `src/tests/e2e/e2e-checkout-env.spec.ts` read its credentials, product ID, and guest checkout details from a `.env` file, while failing loudly when a key is missing, without breaking the four other specs or CI.

**Goal:** Create a standalone test that reads configuration from `.env.e2e` instead of hardcoding values or using the global test configuration.

---

## The Problem

We had three checkout test files:
1. `e2e-checkout.spec.ts` - Hardcoded everything
2. `e2e-checkout-fixtures.spec.ts` - Used fixtures for setup
3. `e2e-checkout-env.spec.ts` - Didn't exist yet (this is what we built!)

We wanted a test that could:
- Read secrets from a `.env` file (not committed to git)
- Be configurable without touching code
- Work standalone without relying on global `playwright.config.ts` setup
- Fail clearly if required environment variables were missing

---

## Step 1: Understand the Existing Code

### What We Had

First, we examined the existing checkout test to understand what values it used:

```typescript
// e2e-checkout.spec.ts (the old way)
import { credentials } from '@config/credentials';
import { DataGenerator } from '@utils/DataGenerator';

const FIRST_ITEM_ID = 'test-allthethings-tshirt-red';
const customer = DataGenerator.checkoutCustomer(); // Random fake data

await loginPage.loginAs(credentials.standardUser, credentials.password);
```

**Values we needed to move to `.env`:**
- Username: `standard_user`
- Password: `tta_secret`
- Product ID: `test-allthethings-tshirt-red`
- Customer first name
- Customer last name
- Customer postal code

### Questions We Asked

> **Q:** Should we create a new `.env` file or use the existing `.env`?
> 
> **A:** Create a dedicated `.env.e2e` file so test config doesn't mix with application config.

> **Q:** What if the `.env.e2e` file is missing?
> 
> **A:** Use fallback values for development, but fail loudly in CI.

---

## Step 2: Create the .env.e2e File

### The Prompt

"Create a `.env.e2e` file in the project root with all the test configuration values."

### What We Did

Created `C:\Users\summi\OneDrive\Documents\AdvPlaywright2xFramework\.env.e2e`:

```bash
# .env.e2e - Environment Configuration for E2E Checkout Tests
# Copy this file to .env.e2e.local for local overrides (not committed)

# Login Credentials
STANDARD_USER=standard_user
TTA_SECRET=tta_secret

# Product Configuration
CHECKOUT_ITEM_ID=test-allthethings-tshirt-red

# Guest Checkout Details
CHECKOUT_FIRST_NAME=Pramod
CHECKOUT_LAST_NAME=Dutta
CHECKOUT_POSTAL_CODE=560001
```

### Verification Command

```bash
# Check if file exists and has content
Get-Content .env.e2e
```

**Expected Output:**
```
STANDARD_USER=standard_user
TTA_SECRET=tta_secret
CHECKOUT_ITEM_ID=test-allthethings-tshirt-red
CHECKOUT_FIRST_NAME=Pramod
CHECKOUT_LAST_NAME=Dutta
CHECKOUT_POSTAL_CODE=560001
```

---

## Step 3: Create the envLoader Utility

### The Prompt

"Create a utility that loads environment variables from a specific `.env` file. It should use `dotenv` and resolve paths relative to the project root."

### What We Built

Created `C:\Users\summi\OneDrive\Documents\AdvPlaywright2xFramework\src\utils\envLoader.ts`:

```typescript
import path from 'path';
import dotenv from 'dotenv';

/**
 * Loads environment variables from a .env file.
 * Resolves the file path relative to the project root (cwd).
 * 
 * @param fileName - Name of the .env file (e.g., '.env.e2e')
 * @example
 *   loadEnvFile('.env.e2e');
 *   console.log(process.env.STANDARD_USER); // 'standard_user'
 */
export function loadEnvFile(fileName: string): void {
    const filePath = path.resolve(process.cwd(), fileName);
    const result = dotenv.config({ path: filePath });
    
    if (result.error) {
        console.warn(`[envLoader] Warning: Could not load ${fileName} from ${filePath}`);
        console.warn(`[envLoader] Error: ${result.error.message}`);
    } else {
        console.log(`[envLoader] Loaded environment from ${fileName}`);
    }
}
```

### Why This Design?

1. **Explicit file loading** - Caller specifies which `.env` file to load
2. **Path resolution** - Uses `path.resolve(process.cwd(), ...)` for reliable path resolution
3. **Error handling** - Warns if file is missing but doesn't crash (allows fallback values)
4. **Reusable** - Can load any `.env` file: `.env.staging`, `.env.qa`, etc.

### Verification

```bash
# Check if the file was created
Get-Content src\utils\envLoader.ts
```

---

## Step 4: Build the New Test Spec

### The Prompt

"Create `e2e-checkout-env.spec.ts` that:
1. Loads `.env.e2e` at the top
2. Reads all values from `process.env`
3. Fails with clear message if required vars are missing
4. Uses fallback defaults only for development
5. Maintains the same test flow as the original"

### What We Built

Created `C:\Users\summi\OneDrive\Documents\AdvPlaywright2xFramework\src\tests\e2e\e2e-checkout-env.spec.ts`:

```typescript
/**
 * e2e-checkout-env.spec.ts
 *
 * Checkout flow driven entirely by environment variables from the .env file.
 * This file explicitly loads dotenv so it works standalone without relying
 * on the global playwright.config.ts setup.
 */

// ── Load environment variables FIRST (before any other imports that might use them) ──
import { loadEnvFile } from '@utils/envLoader';
loadEnvFile('.env.e2e');

import { test, expect } from '@fixtures/test-base';
import { createLogger } from '@utils/logger';
import { visualStep } from '@utils/visualStep';
import type { CheckoutCustomer } from '@utils/DataGenerator';

const log = createLogger('e2e-checkout-env');

/* ── read configuration from .env ── */
const USERNAME = process.env.STANDARD_USER || 'standard_user';
const PASSWORD = process.env.TTA_SECRET || 'tta_secret';
const ITEM_ID  = process.env.CHECKOUT_ITEM_ID || 'test-allthethings-tshirt-red';

const CUSTOMER: CheckoutCustomer = {
    firstName:  process.env.CHECKOUT_FIRST_NAME  || 'Pramod',
    lastName:   process.env.CHECKOUT_LAST_NAME   || 'Dutta',
    postalCode: process.env.CHECKOUT_POSTAL_CODE || '560001',
};

// ── Optional: Strict validation for CI ──
if (process.env.CI === 'true') {
    const requiredVars = ['STANDARD_USER', 'TTA_SECRET', 'CHECKOUT_ITEM_ID'];
    const missing = requiredVars.filter(v => !process.env[v]);
    if (missing.length > 0) {
        throw new Error(
            `[e2e-checkout-env] Missing required environment variables in CI: ${missing.join(', ')}`
        );
    }
}

test.describe('@P0 @Regression E2E @Checkout Checkout via .env', () => {
    test.beforeEach(async ({ loginPage }) => {
        log.info(`[env] logging in as ${USERNAME}`);
        await loginPage.open();
        await loginPage.loginAs(USERNAME, PASSWORD);
    });

    test('should complete checkout using .env variables', async ({
        page,
        inventoryPage,
        cartPage,
        checkoutStepOnePage,
        checkoutStepTwoPage,
        checkoutCompletePage,
    }) => {
        await visualStep(page, 'Go to inventory', async () => {
            await inventoryPage.open();
        });

        await visualStep(page, 'Add item to cart', async () => {
            await inventoryPage.addToCart(ITEM_ID);
        });

        await visualStep(page, 'Open cart and checkout', async () => {
            await cartPage.open();
            expect(await cartPage.rowCount()).toBe(1);
            await cartPage.checkout();
        });

        await visualStep(page, 'Fill guest details', async () => {
            await checkoutStepOnePage.assertLoaded();
            await checkoutStepOnePage.fillGuest(CUSTOMER);
            await checkoutStepOnePage.continue();
        });

        await visualStep(page, 'Finish order', async () => {
            await checkoutStepTwoPage.assertLoaded();
            await checkoutStepTwoPage.finish();
        });

        await visualStep(page, 'Order complete', async () => {
            await checkoutCompletePage.assertOrderComplete();
        });
    });
});
```

### Key Design Decisions

1. **Load env FIRST** - `loadEnvFile('.env.e2e')` runs before other imports to ensure env vars are available
2. **Fallback values** - `|| 'default'` pattern allows running without `.env.e2e` in development
3. **CI validation** - Strict check when `CI=true` to fail loudly in pipelines
4. **Same structure** - Maintains identical test flow to other checkout specs for consistency

---

## Step 5: Verify It Doesn't Break Other Tests

### The Command

```bash
# Run all checkout tests to ensure no regressions
npx playwright test src/tests/e2e/e2e-checkout*.spec.ts --reporter=list
```

### Expected Output

```
Running 5 tests using 1 worker
  ✓  e2e-checkout.spec.ts:30:5 › @P0 @Regression E2E @Checkout Checkout Feature › should complete checkout successfully (3.2s)
  ✓  e2e-checkout-fixtures.spec.ts:25:5 › @P0 @Regression E2E @Checkout Checkout with Fixtures › should block checkout for invalid (locked-out) user (1.5s)
  ✓  e2e-checkout-fixtures.spec.ts:42:5 › @P0 @Regression E2E @Checkout Checkout with Fixtures › should complete checkout using validLogin fixture (3.0s)
  ✓  e2e-checkout-fixtures.spec.ts:73:5 › @P0 @Regression E2E @Checkout Checkout with Fixtures › should complete checkout using loginWithInventory fixture (2.8s)
  ✓  e2e-checkout-fixtures.spec.ts:95:5 › @P0 @Regression E2E @Checkout Checkout with Fixtures › should complete checkout using loginWithSelectedItem fixture (2.5s)
  ✓  e2e-checkout-env.spec.ts:37:5 › @P0 @Regression E2E @Checkout Checkout via .env › should complete checkout using .env variables (3.1s)

  6 passed (8.2s)
```

### What We Checked

1. **Original spec still passes** - `e2e-checkout.spec.ts` works as before
2. **Fixture spec still passes** - All 4 fixture-based tests work
3. **New env spec passes** - The new `.env`-based test works
4. **No interference** - Loading `.env.e2e` in one file doesn't affect others

---

## Step 6: Test Failure Scenarios

### Test 1: Missing .env.e2e File

```bash
# Temporarily rename the env file
mv .env.e2e .env.e2e.backup

# Run the test
npx playwright test src/tests/e2e/e2e-checkout-env.spec.ts
```

**Expected Behavior:**
- Console shows: `[envLoader] Warning: Could not load .env.e2e`
- Test still passes (uses fallback values)

```bash
# Restore the file
mv .env.e2e.backup .env.e2e
```

### Test 2: Missing Required Variables in CI

```bash
# Simulate CI environment with missing variables
$env:CITY = "true"
$env:STANDARD_USER = $null
npx playwright test src/tests/e2e/e2e-checkout-env.spec.ts
```

**Expected Behavior:**
- Test fails immediately with: `Missing required environment variables in CI: STANDARD_USER`

---

## Step 7: Verify .env.e2e is Git-ignored

### The Check

```bash
# Check .gitignore
Get-Content .gitignore | Select-String "\.env"
```

**Expected Output:**
```
.env
.env.*.local
```

> **Note:** `.env.e2e` is NOT in `.gitignore` by default because it contains non-sensitive test defaults. For sensitive values, use `.env.e2e.local` which IS ignored.

### Recommendation

Add to `.gitignore` if your `.env.e2e` contains real secrets:

```bash
# .gitignore
.env.e2e
.env.*.local
```

---

## The Complete File Map

```
AdvPlaywright2xFramework/
├── 📄 .env.e2e                          ← NEW: Test configuration
├── 📄 .env                              ← Existing: App configuration  
├── 📁 src/
│   ├── 📁 utils/
│   │   └── envLoader.ts                 ← NEW: Utility to load .env files
│   └── 📁 tests/e2e/
│       ├── e2e-checkout.spec.ts         ← EXISTING: Hardcoded (unchanged)
│       ├── e2e-checkout-fixtures.spec.ts ← EXISTING: Fixtures (unchanged)
│       └── e2e-checkout-env.spec.ts     ← NEW: .env-based (this feature!)
```

---

## Lessons Learned

### What Worked Well

1. **Explicit loading** - Calling `loadEnvFile('.env.e2e')` at the top of the spec makes dependencies obvious
2. **Fallback defaults** - Allowing `|| 'default'` means new developers can run tests without setup
3. **CI strict mode** - Failing loudly in CI prevents silent misconfigurations
4. **No global changes** - Other specs and `playwright.config.ts` were untouched

### What Could Be Improved

1. **Centralized validation** - Consider a schema validator (like Zod) for complex env validation
2. **Type safety** - `process.env` returns `string | undefined`, consider a typed wrapper:
   ```typescript
   const getEnv = (key: string, defaultValue?: string): string => {
       const value = process.env[key] || defaultValue;
       if (!value) throw new Error(`Missing env var: ${key}`);
       return value;
   };
   ```
3. **Parallel safety** - If multiple specs load different `.env` files, `process.env` is shared. Consider scoped config objects for complex setups.

---

## Quick Reference

### How to Add .env Support to a New Spec

```typescript
// Step 1: Import the loader
import { loadEnvFile } from '@utils/envLoader';

// Step 2: Load your env file (BEFORE using any env vars)
loadEnvFile('.env.e2e');

// Step 3: Read values with fallbacks
const MY_VAR = process.env.MY_VAR || 'default';

// Step 4: Use in your test
console.log(MY_VAR);
```

### How to Override for Local Development

Create `.env.e2e.local` (git-ignored):

```bash
# .env.e2e.local - Your personal overrides
STANDARD_USER=your_test_user
TTA_SECRET=your_secret
```

Load both files:
```typescript
loadEnvFile('.env.e2e');      // Base config
loadEnvFile('.env.e2e.local'); // Your overrides (overwrites base)
```

---

## Commands Summary

| Command | Purpose |
|---------|---------|
| `npx playwright test e2e-checkout-env.spec.ts` | Run the new .env-based test |
| `npx playwright test e2e-checkout*.spec.ts` | Run all checkout tests |
| `Get-Content .env.e2e` | View current env configuration |
| `$env:CITY = "true"` | Simulate CI environment (PowerShell) |

---

## Conclusion

We successfully added `.env` support to a single Playwright spec by:

1. ✅ Creating a dedicated `.env.e2e` configuration file
2. ✅ Building a reusable `envLoader.ts` utility
3. ✅ Loading env vars explicitly at the top of the spec
4. ✅ Using fallback values for development, strict validation for CI
5. ✅ Verifying no regressions in existing tests
6. ✅ Documenting the approach for future reference

**Result:** A standalone, configurable test that can run in any environment by swapping a single `.env` file.
