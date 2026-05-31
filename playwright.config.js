import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './e2e',
	timeout: 5000,
	webServer: {
		command: 'npm run build && npm run preview -- --port 4173',
		port: 4173,
		reuseExistingServer: !process.env.CI
	},
	projects: [
		{
			name: 'Chromium',
			use: { ...devices['Desktop Chrome'] }
		},
		{
			name: 'Mobile Chrome',
			use: { ...devices['Pixel 7'] }
		},
		{
			name: 'Microsoft Edge',
			use: { ...devices['Desktop Edge'], channel: 'msedge' }
		}
	]
});