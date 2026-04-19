<script>
	import { onMount } from 'svelte';
	import { rollDice, pushRoll, calculateFinalResults, countInitialSuccesses, DiceConfig, DiceType } from '$lib/dice.js';
	import { saveRoll, getRolls, clearRolls } from '$lib/storage.js';

	let base = 0;
	let skill = 0;
	let gear = 0;
	let artifactD8 = 0;
	let artifactD10 = 0;
	let artifactD12 = 0;

	let currentStep = 'configure';
	let initialResults = [];
	let pushedResults = [];
	let hasPushed = false;
	let initialSuccesses = 0;
	let savedRolls = [];
	let expandedRoll = null;

	onMount(() => {
		savedRolls = getRolls();
	});

	function roll() {
		const counts = {
			[DiceType.BASE]: base,
			[DiceType.SKILL]: skill,
			[DiceType.GEAR]: gear,
			[DiceType.ARTIFACT_D8]: artifactD8,
			[DiceType.ARTIFACT_D10]: artifactD10,
			[DiceType.ARTIFACT_D12]: artifactD12
		};

		initialResults = rollDice(counts);
		initialSuccesses = countInitialSuccesses(initialResults);
		currentStep = 'result';
		hasPushed = false;
	}

	function push() {
		pushedResults = pushRoll(initialResults);
		hasPushed = true;
		currentStep = 'pushed';

		const final = calculateFinalResults(pushedResults);
		const rollRecord = {
			date: new Date().toISOString(),
			config: { base, skill, gear, artifactD8, artifactD10, artifactD12 },
			initialResults: [...initialResults],
			pushedResults: [...pushedResults],
			initialSuccesses,
			finalSuccesses: final.successes,
			baseDamage: final.baseDamage,
			gearDamage: final.gearDamage,
			willpower: final.willpower
		};
		saveRoll(rollRecord);
		savedRolls = getRolls();
	}

	function newRoll() {
		currentStep = 'configure';
		initialResults = [];
		pushedResults = [];
		hasPushed = false;
	}

	function canPush() {
		return hasPushed === false && currentStep === 'result';
	}

	function getConfig(type) {
		return DiceConfig[type] || {};
	}

	function toggleExpand(index) {
		expandedRoll = expandedRoll === index ? null : index;
	}

	function formatDate(iso) {
		const d = new Date(iso);
		return d.toLocaleString();
	}

	function getDiceClass(type) {
		return type.replace('artifact_', 'artifact-');
	}

	function handleClear() {
		if (confirm('Clear all roll history?')) {
			clearRolls();
			savedRolls = [];
		}
	}
</script>

<div class="container">
	<h1>Forbidden Lands Dice Roller</h1>

	{#if currentStep === 'configure'}
		<div class="card">
			<div class="dice-selector">
				<div class="dice-input">
					<label for="base">Base Dice (Attribute)</label>
					<select id="base" bind:value={base}>
						<option value={0}>0</option>
						<option value={1}>1</option>
						<option value={2}>2</option>
						<option value={3}>3</option>
						<option value={4}>4</option>
						<option value={5}>5</option>
						<option value={6}>6</option>
					</select>
				</div>

				<div class="dice-input">
					<label for="skill">Skill Dice</label>
					<select id="skill" bind:value={skill}>
						<option value={0}>0</option>
						<option value={1}>1</option>
						<option value={2}>2</option>
						<option value={3}>3</option>
						<option value={4}>4</option>
						<option value={5}>5</option>
						<option value={6}>6</option>
					</select>
				</div>

				<div class="dice-input">
					<label for="gear">Gear/Weapon Dice</label>
					<select id="gear" bind:value={gear}>
						<option value={0}>0</option>
						<option value={1}>1</option>
						<option value={2}>2</option>
						<option value={3}>3</option>
						<option value={4}>4</option>
						<option value={5}>5</option>
						<option value={6}>6</option>
					</select>
				</div>

				<div class="dice-input full-width">
					<label for="artifact">Artifact Dice</label>
					<div style="display: flex; gap: 0.5rem;">
						<select id="artifactD8" bind:value={artifactD8} style="flex: 1;">
							<option value={0}>D8: 0</option>
							<option value={1}>D8: 1</option>
						</select>
						<select id="artifactD10" bind:value={artifactD10} style="flex: 1;">
							<option value={0}>D10: 0</option>
							<option value={1}>D10: 1</option>
						</select>
						<select id="artifactD12" bind:value={artifactD12} style="flex: 1;">
							<option value={0}>D12: 0</option>
							<option value={1}>D12: 1</option>
						</select>
					</div>
				</div>
			</div>

			<button class="btn btn-primary" style="margin-top: 1rem;" on:click={roll} disabled={base === 0 && skill === 0 && gear === 0}>
				Roll Dice
			</button>
		</div>

	{:else if currentStep === 'result' || currentStep === 'pushed'}
		<div class="card">
			<div class="results-grid">
				<div class="result-item">
					<div class="value" style="color: var(--success);">{initialSuccesses}</div>
					<div class="label">Successes</div>
				</div>

				{#if hasPushed}
					{@const final = calculateFinalResults(pushedResults)}
					<div class="result-item">
						<div class="value">{final.successes}</div>
						<div class="label">Final</div>
					</div>

					{#if final.baseDamage > 0}
						<div class="result-item">
							<div class="value damage-info">-{final.baseDamage}</div>
							<div class="label">Attribute Dmg</div>
						</div>
					{/if}

					{#if final.gearDamage > 0}
						<div class="result-item">
							<div class="value gear-damage-info">-{final.gearDamage}</div>
							<div class="label">Gear Dmg</div>
						</div>
					{/if}

					{#if final.willpower > 0}
						<div class="result-item">
							<div class="value" style="color: #3498db;">+{final.willpower}</div>
							<div class="label">Willpower</div>
						</div>
					{/if}
				{/if}
			</div>

			<div class="dice-display">
				{#if hasPushed}
					<div class="label" style="width: 100%; text-align: center;">Kept (not pushed):</div>
					{#each pushedResults.filter(d => d.kept) as die}
						<div
							class="die {getDiceClass(die.type)} kept"
							class:success={die.isSuccess}
							class:bane={die.isOne}
							style="background: {getConfig(die.type).color}; color: {die.type === 'base' ? '#222' : 'white'}; opacity: 0.6;"
						>
							{die.value}
						</div>
					{/each}
					<div class="label" style="width: 100%; text-align: center; margin-top: 0.5rem;">Rerolled:</div>
					{#each pushedResults.filter(d => d.rerolled) as die}
						<div
							class="die {getDiceClass(die.type)} rerolled"
							class:success={die.isSuccess}
							class:bane={die.isOne}
							style="background: {getConfig(die.type).color}; color: {die.type === 'base' ? '#222' : 'white'};"
						>
							{die.value}
						</div>
					{/each}
				{:else}
					{#each initialResults as die}
						<div
							class="die {getDiceClass(die.type)}"
							class:success={die.isSuccess}
							class:bane={die.isOne}
							style="background: {getConfig(die.type).color}; color: {die.type === 'base' ? '#222' : 'white'};"
						>
							{die.value}
						</div>
					{/each}
				{/if}
			</div>

			{#if hasPushed && calculateFinalResults(pushedResults).baseDamage > 0}
				<div class="warning">
					You took {calculateFinalResults(pushedResults).baseDamage} damage from Base dice 1s!
				</div>
			{/if}

			{#if hasPushed && calculateFinalResults(pushedResults).gearDamage > 0}
				<div class="warning">
					Your gear took {calculateFinalResults(pushedResults).gearDamage} damage from Gear dice 1s!
				</div>
			{/if}

			<div class="actions">
				{#if !hasPushed}
					<button class="btn btn-warning" on:click={push}>Push Roll</button>
				{/if}
				<button class="btn btn-secondary" on:click={newRoll}>New Roll</button>
			</div>
			<div style="margin-top: 0.75rem; font-size: 0.85rem; color: var(--text-secondary); text-align: center;">
				Base: {base}, Skill: {skill}, Gear: {gear}
				{#if artifactD8 + artifactD10 + artifactD12 > 0}
					, Artifact: {artifactD8 + artifactD10 + artifactD12}
				{/if}
			</div>
		</div>
	{/if}

	<div class="roll-history">
		<h2>Roll History</h2>

		{#if savedRolls.length === 0}
			<p style="color: var(--text-secondary); text-align: center;">No rolls yet</p>
		{:else}
			{#each savedRolls as roll, i}
				<div 
					class="history-item" 
					class:expanded={expandedRoll === i} 
					on:click={() => toggleExpand(i)}
					on:keydown={(e) => e.key === 'Enter' && toggleExpand(i)}
					role="button"
					tabindex="0"
				>
					<div class="header">
						<span class="summary">
							<span class="successes">{roll.finalSuccesses} Successes</span>
							{#if roll.baseDamage > 0}
								<span class="damage-info">-{roll.baseDamage} HP</span>
							{/if}
						</span>
						<span class="date">{formatDate(roll.date)}</span>
					</div>

					<div class="details">
						<div class="dice-display">
							{#if roll.pushedResults?.length > 0}
								{#each roll.pushedResults.filter(d => d.kept) as die}
									<div
										class="die {getDiceClass(die.type)}"
										class:success={die.isSuccess}
										class:bane={die.isOne}
										style="background: {getConfig(die.type).color}; color: {die.type === 'base' ? '#222' : 'white'}; opacity: 0.6;"
									>
										{die.value}
									</div>
								{/each}
								<div class="label" style="width: 100%; text-align: center;">Rerolled:</div>
								{#each roll.pushedResults.filter(d => d.rerolled) as die}
									<div
										class="die {getDiceClass(die.type)}"
										class:success={die.isSuccess}
										class:bane={die.isOne}
										style="background: {getConfig(die.type).color}; color: {die.type === 'base' ? '#222' : 'white'};"
									>
										{die.value}
									</div>
								{/each}
							{:else}
								{#each roll.initialResults as die}
									<div
										class="die {getDiceClass(die.type)}"
										class:success={die.isSuccess}
										class:bane={die.isOne}
										style="background: {getConfig(die.type).color}; color: {die.type === 'base' ? '#222' : 'white'};"
									>
										{die.value}
									</div>
								{/each}
							{/if}
						</div>
						<div style="font-size: 0.85rem; color: var(--text-secondary);">
							Base: {roll.config.base}, Skill: {roll.config.skill}, Gear: {roll.config.gear}
						</div>
					</div>
				</div>
			{/each}

			<button class="btn clear-history-btn" on:click={handleClear}>Clear History</button>
		{/if}
	</div>
</div>