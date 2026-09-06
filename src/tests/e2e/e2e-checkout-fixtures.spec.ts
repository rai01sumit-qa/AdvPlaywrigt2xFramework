/**
 * e2e-checkout-fixtures.spec.ts
 *
 * Demonstrates the four login / state fixtures available in test-base.ts:
 *   1. invalidLogin       – locked-out user stays on the login page
 *   2. validLogin         – standard_user is already authenticated
 *   3. loginWithInventory – authenticated + inventory page is loaded
 *   4. loginWithSelectedItem – authenticated + one item already in cart
 */

import { test, expect } from '@fixtures/test-base';
import { DataGenerator } from '@utils/DataGenerator';
import { visualStep } from '@utils/visualStep';
import { createLogger } from '@utils/logger';


const log = createLogger('e2e-checkout-fixtures');
const FIRST_ITEM_ID = 'test-allthethings-tshirt-red';

test.describe('@P0 @Regression E2E @Checkout Checkout with Fixtures', () => {

    /* ------------------------------------------------------------------ */
    /*  1. INVALID LOGIN — locked-out user cannot reach checkout          */
    /* ------------------------------------------------------------------ */
    test('should block checkout for invalid (locked-out) user', async ({
        invalidLogin,
        page,
    }) => {
        log.info(`Verifying ${invalidLogin.username} is blocked`);

        // Fixture already attempted login; we assert the error is visible.
        await expect(page.locator('[data-test="error"]')).toBeVisible();
        await expect(page).toHaveURL(/.*login/);

        // Because we are still on the login page, checkout is unreachable.
        log.info(`User ${invalidLogin.username} is blocked as expected.`);
    });

    /* ------------------------------------------------------------------ */
    /*  2. VALID LOGIN — start from authenticated state                    */
    /* ------------------------------------------------------------------ */
    test('should complete checkout using validLogin fixture', async ({
        validLogin,
        page,
        inventoryPage,
        cartPage,
        checkoutStepOnePage,
        checkoutStepTwoPage,
        checkoutCompletePage,
    }) => {
        void validLogin; // fixture performed login; we just consume the state
        const customer = DataGenerator.checkoutCustomer();

        await visualStep(page, 'Add item to cart', async () => {
            await inventoryPage.open();
            await inventoryPage.addToCart(FIRST_ITEM_ID);
        });

        await visualStep(page, 'Proceed through checkout', async () => {
            await cartPage.open();
            await cartPage.checkout();
            await checkoutStepOnePage.fillGuest(customer);
            await checkoutStepOnePage.continue();
            await checkoutStepTwoPage.finish();
        });

        await checkoutCompletePage.assertOrderComplete();
    });

    /* ------------------------------------------------------------------ */
    /*  3. LOGIN + INVENTORY — authenticated and on inventory page         */
    /* ------------------------------------------------------------------ */
    test('should complete checkout using loginWithInventory fixture', async ({
        loginWithInventory,
        cartPage,
        checkoutStepOnePage,
        checkoutStepTwoPage,
        checkoutCompletePage,
    }) => {
        const customer = DataGenerator.checkoutCustomer();

        // Already on inventory page; just add the item
        await loginWithInventory.addToCart(FIRST_ITEM_ID);
        await cartPage.open();
        await cartPage.checkout();
        await checkoutStepOnePage.fillGuest(customer);
        await checkoutStepOnePage.continue();
        await checkoutStepTwoPage.finish();
        await checkoutCompletePage.assertOrderComplete();
    });

    /* ------------------------------------------------------------------ */
    /*  4. LOGIN + SELECTED ITEM — item already in the cart               */
    /* ------------------------------------------------------------------ */
    test('should complete checkout using loginWithSelectedItem fixture', async ({
        loginWithSelectedItem,
        cartPage,
        checkoutStepOnePage,
        checkoutStepTwoPage,
        checkoutCompletePage,
    }) => {
        const customer = DataGenerator.checkoutCustomer();

        // Item is already in the cart thanks to the fixture
        await cartPage.open();
        await cartPage.checkout();
        await checkoutStepOnePage.fillGuest(customer);
        await checkoutStepOnePage.continue();
        await checkoutStepTwoPage.finish();
        await checkoutCompletePage.assertOrderComplete();
    });
});
