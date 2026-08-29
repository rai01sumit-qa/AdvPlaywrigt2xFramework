import { Page, TestInfo } from '@playwright/test';

// Re-import test so visualStep can use test.step even when called from specs
import { test } from '@playwright/test';

/**
 * visualStep — wraps an async block as a named Playwright test step.
 * The step title appears in the HTML report, trace viewer, and stdout.
 *
 * Per-step screenshots are captured only when the environment variable
 * ENABLE_STEP_SCREENSHOTS is set to "true" or "1".
 */
export async function visualStep<T>(
    page: Page,
    title: string,
    action: () => Promise<T>,
): Promise<T> {
    const captureScreenshot =
        process.env.ENABLE_STEP_SCREENSHOTS === 'true' ||
        process.env.ENABLE_STEP_SCREENSHOTS === '1';

    return test.step(title, async () => {
        const result = await action();

        if (captureScreenshot) {
            const testInfo = test.info();
            const safeName = title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().substring(0, 40);
            const screenshotPath = testInfo.outputPath(`step_${safeName}.png`);
            await page.screenshot({ path: screenshotPath, fullPage: false });
            await testInfo.attach(title, { path: screenshotPath });
        }

        return result;
    });
}
