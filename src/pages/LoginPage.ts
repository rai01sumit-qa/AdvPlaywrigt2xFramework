import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * TTACart login screen.
 */
export class LoginPage extends BasePage {
    static readonly PATH = '/playwright/ttacart/index.html';

    private readonly usernameInput: Locator;
    private readonly passwordInput: Locator;
    private readonly loginButton: Locator;
    private readonly errorBox: Locator;

    constructor(page: Page) {
        super(page);
        this.usernameInput = page.locator('[data-test="username"]');
        this.passwordInput = page.locator('[data-test="password"]');
        this.loginButton = page.locator('[data-test="login-button"]');
        this.errorBox = page.locator('[data-test="error"]');
    }

    async open(): Promise<void> {
        await this.goto(LoginPage.PATH);
    }

    async login(username: string, password: string): Promise<void> {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }

    async loginAs(username: string, password: string): Promise<void> {
        await this.login(username, password);
    }

    async waitForLoginButtonHidden(): Promise<void> {
        await expect(this.loginButton).toBeHidden();
    }

    async getErrorMessage(): Promise<string> {
        return this.errorBox.innerText();
    }
}
