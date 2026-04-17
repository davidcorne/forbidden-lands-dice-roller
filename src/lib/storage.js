const STORAGE_KEY = 'forbidden-lands-rolls';

export function saveRoll(roll) {
	const rolls = getRolls();
	rolls.unshift(roll);
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(rolls.slice(0, 50)));
	} catch (e) {
		console.warn('Could not save roll to storage', e);
	}
}

export function getRolls() {
	try {
		const data = localStorage.getItem(STORAGE_KEY);
		return data ? JSON.parse(data) : [];
	} catch (e) {
		return [];
	}
}

export function clearRolls() {
	localStorage.removeItem(STORAGE_KEY);
}