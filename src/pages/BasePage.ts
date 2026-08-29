import { Page } from '@playwright/test';
import { UtilElementLocator } from '@utils/UtilElementLocator';

export class BasePage {
    protected readonly page: Page;
    protected readonly el: UtilElementLocator;

    constructor(page: Page, _name?: string) {
        this.page = page;
        this.el = new UtilElementLocator(page);
    }

    async goto(url: string): Promise<void> {
        await this.page.goto(url);
    }

    async navigate(url: string): Promise<void> {
        await this.page.goto(url);
    }
}
