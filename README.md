# Forbidden Lands Dice Roller

A mobile-friendly dice roller for the Forbidden Lands RPG system.

## Features

- **4 Dice Types**: Base (Attribute), Skill, Gear/Weapon, and Artifact (D8/D10/D12)
- **Push Mechanics**: Re-roll all dice that aren't a 6 or 1, with proper damage/effect tracking
- **Damage Tracking**: Attribute damage from Base 1s, gear degradation from Gear 1s, Willpower gain
- **Roll History**: Saved locally, persists across sessions

## How to Use

1. **Configure Roll**: Select number of each dice type
   - Base Dice = Attribute rating
   - Skill Dice = Skill rating
   - Gear/Weapon Dice = Gear bonus
2. **Roll**: Tap "Roll Dice" button
3. **View Results**: See successes (6s), count total
4. **Push (Optional)**: Tap "Push Roll" to re-risk failures
   - Base dice 1s = attribute damage
   - Gear dice 1s = gear degradation
   - Base dice 1s also grant Willpower
5. **New Roll**: Start fresh or view history

## Installation

### Option 1: Run Locally
```bash
npm install
npm run dev
```
Open http://localhost:5173

### Option 2: Build & Host
```bash
npm run build
```
Upload contents of `build/` folder to any web host.

### Option 3: Mobile PWA
1. Run locally or host the built app
2. Open in mobile browser
3. Add to Home Screen (browser menu → Add to Home Screen)
4. Works offline after first load

## Tech Stack

- SvelteKit + Vite
- Static adapter (no backend needed)
- localStorage for history persistence
- PWA-capable

## Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## License

For personal use.