import { test, expect } from '@playwright/test';

/**
 * Basic API Ping Test — Restful Booker
 * Verifies the API is alive by hitting the /ping endpoint.
 */

test('should return 201 Created on ping', async ({ request }) => {
    await test.step('Send ping request', async () => {
        const response = await request.get('https://restful-booker.herokuapp.com/ping');
        console.log(`Response status: ${response.status()}`);

        expect(response.status()).toBe(201);

        const body = await response.text();
        console.log(`Response body: ${body}`);
        expect(body).toContain('Created');
    });
});
