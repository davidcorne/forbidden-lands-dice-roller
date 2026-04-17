export const DiceType = {
	BASE: 'base',
	SKILL: 'skill',
	GEAR: 'gear',
	ARTIFACT_D8: 'artifact_d8',
	ARTIFACT_D10: 'artifact_d10',
	ARTIFACT_D12: 'artifact_d12'
};

export const DiceConfig = {
	[DiceType.BASE]: { size: 6, name: 'Base', color: '#eeeeee', pushEffect: 'damage' },
	[DiceType.SKILL]: { size: 6, name: 'Skill', color: '#e74c3c', pushEffect: 'none' },
	[DiceType.GEAR]: { size: 6, name: 'Gear/Weapon', color: '#2c3e50', pushEffect: 'degrade' },
	[DiceType.ARTIFACT_D8]: { size: 8, name: 'Artifact D8', color: '#27ae60', pushEffect: 'none' },
	[DiceType.ARTIFACT_D10]: { size: 10, name: 'Artifact D10', color: '#3498db', pushEffect: 'none' },
	[DiceType.ARTIFACT_D12]: { size: 12, name: 'Artifact D12', color: '#9b59b6', pushEffect: 'none' }
};

function rollDie(size) {
	return Math.floor(Math.random() * size) + 1;
}

function getSuccesses(value, size) {
	if (size === 6) return value === 6 ? 1 : 0;
	return value >= 6 ? value - 5 : 0;
}

function shouldPush(type, value, size) {
	if (size === 6) {
		return value !== 6 && value !== 1;
	}
	return value < 6;
}

function isSuccess(value, size) {
	if (size === 6) return value === 6;
	return value >= 6;
}

function isBane(value, size) {
	return value === 1;
}

export function rollDice(counts) {
	const results = [];

	for (const [type, count] of Object.entries(counts)) {
		if (count <= 0) continue;
		const config = DiceConfig[type];
		for (let i = 0; i < count; i++) {
			const value = rollDie(config.size);
			results.push({
				type,
				value,
				successes: getSuccesses(value, config.size),
				isOne: isBane(value, config.size),
				isSuccess: isSuccess(value, config.size),
				original: true,
				pushed: false
			});
		}
	}

	return results;
}

export function getDiceToPush(results) {
	const indices = [];
	results.forEach((r, i) => {
		if (r.original === false) return;
		const config = DiceConfig[r.type];
		if (r.type === DiceType.SKILL) {
			if (r.value < config.size) indices.push(i);
		} else if (r.type === DiceType.BASE || r.type === DiceType.GEAR) {
			if (r.value !== 1 && r.value !== 6) indices.push(i);
		} else if (r.type.startsWith('artifact')) {
			if (r.value < 6) indices.push(i);
		}
	});
	return indices;
}

export function pushRoll(initialResults) {
	const indicesToPush = getDiceToPush(initialResults);
	const indicesSet = new Set(indicesToPush);
	
	const kept = initialResults.filter((_, i) => !indicesSet.has(i)).map(r => ({ ...r, kept: true }));
	const rerolled = [];

	for (const i of indicesToPush) {
		const die = initialResults[i];
		const config = DiceConfig[die.type];
		const value = rollDie(config.size);
		rerolled.push({
			type: die.type,
			value,
			successes: getSuccesses(value, config.size),
			isOne: isBane(value, config.size),
			isSuccess: isSuccess(value, config.size),
			rerolled: true
		});
	}

	return [...kept, ...rerolled];
}

export function calculateFinalResults(results) {
	let successes = 0;
	let baseOnes = 0;
	let gearOnes = 0;
	let willpower = 0;

	for (const r of results) {
		successes += r.successes;
		if (r.type === DiceType.BASE && r.isOne) baseOnes++;
		if (r.type === DiceType.GEAR && r.isOne) gearOnes++;
		if (r.type === DiceType.BASE && r.isOne) willpower++;
	}

	return { successes, baseDamage: baseOnes, gearDamage: gearOnes, willpower };
}

export function countInitialSuccesses(results) {
	return results.reduce((sum, r) => sum + r.successes, 0);
}