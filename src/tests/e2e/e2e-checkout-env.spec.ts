/**
 * e2e-checkout-env.spec.ts
 *
 * Checkout flow driven entirely by environment variables from the .env file.
 * This file explicitly loads dotenv so it works standalone without relying
 * on the global playwright.config.ts setup.
 */

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
