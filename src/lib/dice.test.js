import { describe, it, expect, beforeEach } from 'vitest';
import {
	DiceType,
	rollDice,
	getDiceToPush,
	pushRoll,
	calculateFinalResults,
	countInitialSuccesses
} from './dice.js';

describe('rollDice', () => {
	it('should roll no dice when all counts are 0', () => {
		const results = rollDice({
			[DiceType.BASE]: 0,
			[DiceType.SKILL]: 0,
			[DiceType.GEAR]: 0
		});
		expect(results).toHaveLength(0);
	});

	it('should roll correct number of base dice', () => {
		const results = rollDice({ [DiceType.BASE]: 3, [DiceType.SKILL]: 0, [DiceType.GEAR]: 0 });
		const baseDice = results.filter(r => r.type === DiceType.BASE);
		expect(baseDice).toHaveLength(3);
	});

	it('should roll correct number of skill dice', () => {
		const results = rollDice({ [DiceType.BASE]: 0, [DiceType.SKILL]: 2, [DiceType.GEAR]: 0 });
		const skillDice = results.filter(r => r.type === DiceType.SKILL);
		expect(skillDice).toHaveLength(2);
	});

	it('should roll correct number of gear dice', () => {
		const results = rollDice({ [DiceType.BASE]: 0, [DiceType.SKILL]: 0, [DiceType.GEAR]: 1 });
		const gearDice = results.filter(r => r.type === DiceType.GEAR);
		expect(gearDice).toHaveLength(1);
	});

	it('should roll values between 1 and 6 for d6', () => {
		const results = rollDice({ [DiceType.BASE]: 100, [DiceType.SKILL]: 0, [DiceType.GEAR]: 0 });
		for (const die of results) {
			expect(die.value).toBeGreaterThanOrEqual(1);
			expect(die.value).toBeLessThanOrEqual(6);
		}
	});

	it('should mark correct successes (6 is success)', () => {
		const results = rollDice({ [DiceType.BASE]: 6, [DiceType.SKILL]: 0, [DiceType.GEAR]: 0 });
		const sixes = results.filter(r => r.value === 6);
		const nonSixes = results.filter(r => r.value !== 6);
		sixes.forEach(d => expect(d.isSuccess).toBe(true));
		nonSixes.forEach(d => expect(d.isSuccess).toBe(false));
	});

	it('should mark 1 as bane', () => {
		const results = rollDice({ [DiceType.BASE]: 6, [DiceType.SKILL]: 0, [DiceType.GEAR]: 0 });
		const ones = results.filter(r => r.value === 1);
		const nonOnes = results.filter(r => r.value !== 1);
		ones.forEach(d => expect(d.isOne).toBe(true));
		nonOnes.forEach(d => expect(d.isOne).toBe(false));
	});

	it('should roll artifact d8 values between 1 and 8', () => {
		const results = rollDice({ [DiceType.ARTIFACT_D8]: 50, [DiceType.SKILL]: 0, [DiceType.GEAR]: 0 });
		for (const die of results) {
			expect(die.value).toBeGreaterThanOrEqual(1);
			expect(die.value).toBeLessThanOrEqual(8);
		}
	});

	it('should roll artifact d10 values between 1 and 10', () => {
		const results = rollDice({ [DiceType.ARTIFACT_D10]: 50, [DiceType.SKILL]: 0, [DiceType.GEAR]: 0 });
		for (const die of results) {
			expect(die.value).toBeGreaterThanOrEqual(1);
			expect(die.value).toBeLessThanOrEqual(10);
		}
	});

	it('should roll artifact d12 values between 1 and 12', () => {
		const results = rollDice({ [DiceType.ARTIFACT_D12]: 50, [DiceType.SKILL]: 0, [DiceType.GEAR]: 0 });
		for (const die of results) {
			expect(die.value).toBeGreaterThanOrEqual(1);
			expect(die.value).toBeLessThanOrEqual(12);
		}
	});
});

describe('countInitialSuccesses', () => {
	it('should count only 6s as successes', () => {
		const results = [
			{ type: DiceType.BASE, value: 1, successes: 0 },
			{ type: DiceType.BASE, value: 3, successes: 0 },
			{ type: DiceType.BASE, value: 5, successes: 0 },
			{ type: DiceType.BASE, value: 6, successes: 1 },
			{ type: DiceType.SKILL, value: 6, successes: 1 }
		];
		expect(countInitialSuccesses(results)).toBe(2);
	});

	it('should count multiple successes on artifact dice', () => {
		expect(countInitialSuccesses([{ type: DiceType.ARTIFACT_D8, value: 8, successes: 3 }])).toBe(3);
		expect(countInitialSuccesses([{ type: DiceType.ARTIFACT_D10, value: 10, successes: 5 }])).toBe(5);
		expect(countInitialSuccesses([{ type: DiceType.ARTIFACT_D12, value: 12, successes: 7 }])).toBe(7);
	});

	it('should count 6 as 1 success on artifact dice', () => {
		expect(countInitialSuccesses([{ type: DiceType.ARTIFACT_D8, value: 6, successes: 1 }])).toBe(1);
		expect(countInitialSuccesses([{ type: DiceType.ARTIFACT_D10, value: 6, successes: 1 }])).toBe(1);
		expect(countInitialSuccesses([{ type: DiceType.ARTIFACT_D12, value: 6, successes: 1 }])).toBe(1);
	});

	it('should count 0 successes for values below 6', () => {
		expect(countInitialSuccesses([{ type: DiceType.ARTIFACT_D8, value: 5, successes: 0 }])).toBe(0);
		expect(countInitialSuccesses([{ type: DiceType.ARTIFACT_D10, value: 5, successes: 0 }])).toBe(0);
		expect(countInitialSuccesses([{ type: DiceType.ARTIFACT_D12, value: 5, successes: 0 }])).toBe(0);
	});
});

describe('getDiceToPush', () => {
	it('should not suggest rerolling successes (6)', () => {
		const results = [{ type: DiceType.BASE, value: 6, original: true }];
		const toPush = getDiceToPush(results);
		expect(toPush).toHaveLength(0);
	});

	it('should not suggest rerolling banes (1) on base dice', () => {
		const results = [{ type: DiceType.BASE, value: 1, original: true }];
		const toPush = getDiceToPush(results);
		expect(toPush).toHaveLength(0);
	});

	it('should suggest rerolling values 2-5 on base dice', () => {
		for (const value of [2, 3, 4, 5]) {
			const results = [{ type: DiceType.BASE, value, original: true }];
			const toPush = getDiceToPush(results);
			expect(toPush).toHaveLength(1);
		}
	});

	it('should suggest rerolling values 2-5 on gear dice', () => {
		for (const value of [2, 3, 4, 5]) {
			const results = [{ type: DiceType.GEAR, value, original: true }];
			const toPush = getDiceToPush(results);
			expect(toPush).toHaveLength(1);
		}
	});

	it('should NOT suggest rerolling 1 on gear dice (should be kept)', () => {
		const results = [{ type: DiceType.GEAR, value: 1, original: true }];
		const toPush = getDiceToPush(results);
		expect(toPush).toHaveLength(0);
	});

	it('should suggest rerolling 1 on skill dice', () => {
		const results = [{ type: DiceType.SKILL, value: 1, original: true }];
		const toPush = getDiceToPush(results);
		expect(toPush).toHaveLength(1);
	});

	it('should suggest rerolling any non-6 on skill dice', () => {
		for (const value of [1, 2, 3, 4, 5]) {
			const results = [{ type: DiceType.SKILL, value, original: true }];
			const toPush = getDiceToPush(results);
			expect(toPush).toHaveLength(1);
		}
	});

	it('should not suggest rerolling 6 on skill dice', () => {
		const results = [{ type: DiceType.SKILL, value: 6, original: true }];
		const toPush = getDiceToPush(results);
		expect(toPush).toHaveLength(0);
	});

	it('should not suggest rerolling 6+ on artifact dice', () => {
		const d8 = [{ type: DiceType.ARTIFACT_D8, value: 6, original: true }];
		const d10 = [{ type: DiceType.ARTIFACT_D10, value: 8, original: true }];
		const d12 = [{ type: DiceType.ARTIFACT_D12, value: 10, original: true }];
		expect(getDiceToPush(d8)).toHaveLength(0);
		expect(getDiceToPush(d10)).toHaveLength(0);
		expect(getDiceToPush(d12)).toHaveLength(0);
	});

	it('should suggest rerolling values below 6 on artifact dice', () => {
		const d8 = [{ type: DiceType.ARTIFACT_D8, value: 5, original: true }];
		const d10 = [{ type: DiceType.ARTIFACT_D10, value: 5, original: true }];
		const d12 = [{ type: DiceType.ARTIFACT_D12, value: 5, original: true }];
		expect(getDiceToPush(d8)).toHaveLength(1);
		expect(getDiceToPush(d10)).toHaveLength(1);
		expect(getDiceToPush(d12)).toHaveLength(1);
	});
});

describe('pushRoll', () => {
	it('should keep successes (6s)', () => {
		const results = rollDice({ [DiceType.BASE]: 1, [DiceType.SKILL]: 0, [DiceType.GEAR]: 0 });
		results[0].value = 6;
		results[0].original = true;
		
		const pushed = pushRoll(results);
		const kept = pushed.filter(d => d.kept);
		const rerolled = pushed.filter(d => d.rerolled);
		
		expect(kept).toHaveLength(1);
		expect(rerolled).toHaveLength(0);
	});

	it('should keep banes (1s) on base dice', () => {
		const results = [{ type: DiceType.BASE, value: 1, original: true, isOne: true }];
		const pushed = pushRoll(results);
		const kept = pushed.filter(d => d.kept);
		const rerolled = pushed.filter(d => d.rerolled);
		
		expect(kept).toHaveLength(1);
		expect(rerolled).toHaveLength(0);
	});

	it('should reroll skill dice showing 1', () => {
		const results = [{ type: DiceType.SKILL, value: 1, original: true, isOne: true }];
		const pushed = pushRoll(results);
		const kept = pushed.filter(d => d.kept);
		const rerolled = pushed.filter(d => d.rerolled);
		
		expect(kept).toHaveLength(0);
		expect(rerolled).toHaveLength(1);
	});

	it('should keep banes (1s) on gear dice', () => {
		const results = [{ type: DiceType.GEAR, value: 1, original: true, isOne: true }];
		const pushed = pushRoll(results);
		const kept = pushed.filter(d => d.kept);
		const rerolled = pushed.filter(d => d.rerolled);
		
		expect(kept).toHaveLength(1);
		expect(rerolled).toHaveLength(0);
	});
});

describe('calculateFinalResults', () => {
	it('should count all successes after push', () => {
		const results = [
			{ type: DiceType.BASE, value: 6, successes: 1, isOne: false, kept: true },
			{ type: DiceType.BASE, value: 3, successes: 0, isOne: false, rerolled: true },
			{ type: DiceType.SKILL, value: 6, successes: 1, isOne: false, rerolled: true }
		];
		const final = calculateFinalResults(results);
		expect(final.successes).toBe(2);
	});

	it('should count base dice 1s as attribute damage', () => {
		const results = [
			{ type: DiceType.BASE, value: 1, successes: 0, isOne: true, kept: true },
			{ type: DiceType.BASE, value: 5, successes: 0, isOne: false, rerolled: true }
		];
		const final = calculateFinalResults(results);
		expect(final.baseDamage).toBe(1);
	});

	it('should count gear dice 1s as gear damage', () => {
		const results = [
			{ type: DiceType.GEAR, value: 1, successes: 0, isOne: true, kept: true },
			{ type: DiceType.GEAR, value: 5, successes: 0, isOne: false, rerolled: true }
		];
		const final = calculateFinalResults(results);
		expect(final.gearDamage).toBe(1);
	});

	it('should grant willpower for base dice 1s', () => {
		const results = [
			{ type: DiceType.BASE, value: 1, successes: 0, isOne: true, kept: true }
		];
		const final = calculateFinalResults(results);
		expect(final.willpower).toBe(1);
	});
});