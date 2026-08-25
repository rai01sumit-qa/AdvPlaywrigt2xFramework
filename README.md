# AdvPlaywright2xFramework

An advanced Playwright 2.x test automation framework built with TypeScript, featuring Page Object Model (POM) design, custom reporting, API testing support, and data-driven testing capabilities.

## Features

- **TypeScript** - Type-safe test development
- **Page Object Model** - Maintainable and scalable test architecture
- **Custom Reporter** - Integrated custom reporting with HTML output
- **API Testing** - Built-in support for API test automation
- **Data Generation** - Faker.js integration for dynamic test data
- **Logging** - Winston logger for comprehensive test logs
- **Video & Trace Recording** - Automatic capture on test execution
- **Screenshot on Failure** - Automatic failure capture for debugging
- **Multi-browser Support** - Configurable for Chromium, Firefox, WebKit

## Project Structure

```
AdvPlaywright2xFramework/
├── src/
│   ├── api/              # API testing utilities and helpers
│   ├── config/           # Configuration files
│   ├── fixtures/         # Test fixtures and setup
│   ├── pages/            # Page Object Models
│   │   ├── BasePage.ts
│   │   ├── LoginPage.ts
│   │   ├── InventoryPage.ts
│   │   ├── CartPage.ts
│   │   ├── CheckoutStepOnePage.ts
│   │   ├── CheckoutStepTwoPage.ts
│   │   ├── CheckoutCompletePage.ts
│   │   └── ItemDetailPage.ts
│   ├── testdata/         # Test data files
│   ├── tests/            # Test specifications
│   │   └── login.spec.ts
│   └── utils/            # Utility functions
│       ├── CustomReporter.ts
│       ├── DataGenerator.ts
│       ├── logger.ts
│       └── UtilElementLocator.ts
├── .github/              # GitHub workflows and templates
├── docs/                 # Documentation
├── rules/                # Coding rules and guidelines
├── playwright.config.ts  # Playwright configuration
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/rai01sumit-qa/AdvPlaywrigt2xFramework.git
   cd AdvPlaywright2xFramework
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

## Configuration

The framework uses `playwright.config.ts` for test configuration. Key settings include:

- **Test Directory**: `./src/tests`
- **Headless Mode**: Disabled (visible browser)
- **Screenshots**: Captured on failure
- **Video Recording**: Enabled for all tests
- **Trace Collection**: Enabled for all tests
- **Reporter**: List, HTML, and Custom Reporter

## Running Tests

Run all tests:
```bash
npx playwright test
```

Run tests in headed mode:
```bash
npx playwright test --headed
```

Run specific test file:
```bash
npx playwright test login.spec.ts
```

Run tests with debug mode:
```bash
npx playwright test --debug
```

## Viewing Reports

HTML Report:
```bash
npx playwright show-report
```

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| @faker-js/faker | ^10.6.0 | Dynamic test data generation |
| allure-playwright | ^3.11.0 | Allure reporting integration |
| winston | ^3.19.0 | Logging utility |
| dotenv | ^17.4.2 | Environment variable management |
| ajv | ^8.20.0 | JSON schema validation |
| csv-parse | ^7.0.2 | CSV data parsing |
| xlsx | ^0.18.5 | Excel data handling |

## Environment Variables

Create a `.env` file in the root directory for environment-specific configurations:

```env
BASE_URL=your_application_url
API_BASE_URL=your_api_url
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
