import { test, expect } from '@playwright/test';

test.describe('Dice Roller', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('http://localhost:4173');
	});

	test('should display dice selectors', async ({ page }) => {
		await expect(page.locator('label[for="base"]')).toContainText('Base Dice');
		await expect(page.locator('label[for="skill"]')).toContainText('Skill Dice');
		await expect(page.locator('label[for="gear"]')).toContainText('Gear/Weapon');
	});

	test('should roll dice and show results', async ({ page }) => {
		await page.selectOption('#base', '2');
		await page.selectOption('#skill', '1');
		await page.click('button:has-text("Roll Dice")');

		await expect(page.locator('.result-item:has-text("Successes") .value')).toBeVisible();
		await expect(page.locator('.die').count()).resolves.toBe(3);
	});

	test('should calculate successes correctly', async ({ page }) => {
		await page.selectOption('#base', '6');
		await page.click('button:has-text("Roll Dice")');

		const dice = page.locator('.die');
		const sixCount = await dice.filter({ hasText: '6' }).count();
		const successEl = page.locator('.result-item:has-text("Successes") .value');
		await expect(successEl).toHaveText(String(sixCount));
	});

	test('should show push button after rolling', async ({ page }) => {
		await page.selectOption('#base', '3');
		await page.click('button:has-text("Roll Dice")');

		await expect(page.locator('button:has-text("Push Roll")')).toBeVisible();
	});

	test('should push roll and show kept vs rerolled dice', async ({ page }) => {
		await page.selectOption('#base', '3');
		await page.click('button:has-text("Roll Dice")');
		await page.click('button:has-text("Push Roll")');

		await expect(page.locator('text=Kept (not pushed):').first()).toBeVisible();
		await expect(page.locator('text=Rerolled:').first()).toBeVisible();
	});

	test('should show damage from base dice 1s', async ({ page }) => {
		await page.selectOption('#base', '2');
		await page.click('button:has-text("Roll Dice")');

		const baseDice = page.locator('.die.base');
		const firstDie = baseDice.first();
		const dieText = await firstDie.textContent();

		if (dieText === '1') {
			await page.click('button:has-text("Push Roll")');
			await expect(page.locator('text=damage from Base dice')).toBeVisible();
		}
	});

test('should show final results after push', async ({ page }) => {
		await page.selectOption('#base', '1');
		await page.click('button:has-text("Roll Dice")');
		await page.click('button:has-text("Push Roll")');

		await expect(page.locator('.result-item:has-text("Final")')).toBeVisible();
	});

	test('should show final result after gear push', async ({ page }) => {
		await page.selectOption('#base', '1');
		await page.selectOption('#gear', '1');
		await page.click('button:has-text("Roll Dice")');
		await page.click('button:has-text("Push Roll")');

		await expect(page.locator('.result-item:has-text("Final")')).toBeVisible();
	});

	test('should display roll history section', async ({ page }) => {
		await expect(page.locator('h2:has-text("Roll History")')).toBeVisible();
	});

	test('should have new roll button after pushing', async ({ page }) => {
		await page.selectOption('#base', '1');
		await page.click('button:has-text("Roll Dice")');
		await page.click('button:has-text("Push Roll")');

		await expect(page.locator('button:has-text("New Roll")')).toBeVisible();
	});

	test('should reset to configure screen on new roll', async ({ page }) => {
		await page.selectOption('#base', '2');
		await page.click('button:has-text("Roll Dice")');
		await page.click('button:has-text("Push Roll")');
		await page.click('button:has-text("New Roll")');

		await expect(page.locator('select#base')).toBeVisible();
		await expect(page.locator('button:has-text("Roll Dice")')).toBeVisible();
	});

	test('should show dice config summary', async ({ page }) => {
		await page.selectOption('#base', '2');
		await page.selectOption('#skill', '3');
		await page.selectOption('#gear', '1');
		await page.click('button:has-text("Roll Dice")');

		await expect(page.locator('text=Base: 2, Skill: 3, Gear: 1')).toBeVisible();
	});

	test('should show roll history section', async ({ page }) => {
		await expect(page.locator('h2:has-text("Roll History")')).toBeVisible();
	});

	test('should save roll to history after pushing', async ({ page }) => {
		await page.selectOption('#base', '1');
		await page.click('button:has-text("Roll Dice")');
		await page.click('button:has-text("Push Roll")');

		await expect(page.locator('.history-item')).toHaveCount(1);
	});

	test('should expand history item on click', async ({ page }) => {
		await page.selectOption('#base', '1');
		await page.click('button:has-text("Roll Dice")');
		await page.click('button:has-text("Push Roll")');

		await page.locator('.history-item').first().click();
		await expect(page.locator('.history-item')).toHaveClass(/expanded/);
	});

	test('should add artifact dice', async ({ page }) => {
		await page.selectOption('#base', '1');
		await page.selectOption('#artifactD12', '1');
		await page.click('button:has-text("Roll Dice")');

		const dice = page.locator('.die.artifact-d12');
		await expect(await dice.count()).toBe(1);
	});

	test('should show artifact in config summary', async ({ page }) => {
		await page.selectOption('#base', '1');
		await page.selectOption('#artifactD8', '1');
		await page.selectOption('#artifactD10', '1');
		await page.selectOption('#artifactD12', '1');
		await page.click('button:has-text("Roll Dice")');

		await expect(page.locator('text=Artifact: 3')).toBeVisible();
	});
});