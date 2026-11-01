# Ludo — A little roll. A lot of joy.

A small, responsive Ludo-inspired game that brings a little of the family-game-night feeling to the browser. Play a single-token race against the computer, or switch to a standalone dice simulator when you just want to roll.

This is a deliberately simplified adaptation rather than the full four-player Ludo board: each player moves one token along a straight 30-space track. It is designed to be easy to pick up on a laptop, tablet, or phone.

## At a glance

- **Two ways to play:** a turn-based race against the computer, or unlimited free dice rolls.
- **Simple race rules:** roll 1–6, move along the 30 spaces, and land exactly on Home.
- **Bonus turns:** a six grants another turn, unless that roll wins the race.
- **Automatic computer turns:** the computer rolls for itself after a short pause.
- **Live game information:** see the current player, both positions, your progress, and up to five recent rolls.
- **Fresh starts:** start a new game or switch modes to reset the board.
- **Responsive and motion-aware:** the layout adapts to narrow screens, and decorative animations respect reduced-motion preferences.
- **No account or backend required:** game state lives in the current page and resets when you start a new game or reload.

## Contents

- [Getting started](#getting-started)
- [How to play](#how-to-play)
- [Rules and simplified-game details](#rules-and-simplified-game-details)
- [Project structure](#project-structure)
- [How the game works](#how-the-game-works)
- [Technology](#technology)
- [Development and validation](#development-and-validation)
- [Production build](#production-build)
- [Limitations and ideas for extension](#limitations-and-ideas-for-extension)

## Getting started

### Requirements

- A supported, currently maintained Node.js release.
- npm, which is included with Node.js. The project also has an npm lockfile.

### Install dependencies

Run these commands from the `ludu/` project directory:

```bash
npm ci
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). If port 3000 is already in use, choose another port:

```bash
npm run dev -- --port 3001
```

Then open [http://localhost:3001](http://localhost:3001).

## How to play

### Token race

1. Choose **Token race**. A new game starts with both tokens at Start and your turn first.
2. Select **Roll the dice**. The die animates and settles on a random value from 1 to 6.
3. Your token moves by that number of spaces. The computer takes its turn automatically when yours ends.
4. Roll a **6** to get another turn.
5. Be the first to land **exactly on space 30** to win. A roll that would move past space 30 leaves the token in place and passes the turn.
6. Select **New game** whenever you want to reset the race and roll history.

### Dice simulator

Select **Dice simulator** to roll without playing the race. Each roll updates the die and recent-roll list; tokens and turn order do not advance. Switching between modes starts a fresh game.

## Rules and simplified-game details

| Situation | What happens |
| --- | --- |
| Normal roll | The active token moves forward by the die value. |
| Roll a six | The same player takes another turn, unless the roll also wins. |
| Land exactly on space 30 | The player wins and the game stops accepting rolls. |
| Roll past space 30 | The token stays in place and the turn passes to the other player. |
| Computer's turn | The computer rolls automatically after a short delay. |
| Switch mode or start a new game | Positions, winner, die, and roll history reset. |

This compact race borrows the feel of Ludo but is not a full implementation of its standard board and rules:

- Each side has one token; there are no four-color home yards or multiple tokens to bring out.
- There is no requirement to roll a six before leaving Start.
- Starred safe spaces are visual markers only. They do not change movement, protect tokens, or trigger special actions.
- Players do not capture or send each other's tokens back to Start.
- Overshooting Home is not allowed; the token must reach the finish with an exact roll.

## Project structure

```text
ludu/
├── app/
│   ├── favicon.ico
│   ├── globals.css    Global styles, track design, responsive layout, and animations
│   ├── layout.tsx     Root HTML layout, fonts, and page metadata
│   └── page.tsx       Game interface, dice, track, and game state
├── public/            Static assets
├── eslint.config.mjs  ESLint configuration
├── next.config.ts     Next.js and Tailwind/Turbopack configuration
├── package.json       Dependencies and npm scripts
├── package-lock.json  Reproducible npm dependency versions
└── tsconfig.json      TypeScript configuration
```

### Main files

- [`app/page.tsx`](./app/page.tsx) contains the client-rendered game. It defines the dice and token UI, builds the numbered track, maintains race state, handles rolls and resets, and schedules the computer's turns.
- [`app/globals.css`](./app/globals.css) defines the visual system, responsive breakpoints, token and die appearance, animations, and reduced-motion behavior.
- [`app/layout.tsx`](./app/layout.tsx) defines the root document, Geist fonts, and the browser title and description.
- [`package.json`](./package.json) defines the application scripts and direct dependencies.
- [`next.config.ts`](./next.config.ts) configures Next.js, including the Tailwind CSS Turbopack loader.

## How the game works

### State

The page uses React state for:

- The selected `race` or `dice` mode.
- The active player (`you` or `computer`).
- Both token positions, starting at `0` and ending at `30`.
- The current die value, whether the die is rolling, and the winner (if any).
- The five most recent race or simulator rolls and the total number of rolls.
- The status message shown to the player.

### A race turn

When a roll starts, the interface locks the roll button while a short timeout animates the die. The completed roll is chosen with `Math.floor(Math.random() * 6) + 1`. The game calculates the next position and then resolves the outcome in this order:

1. If the new position is exactly `30`, record a winner and stop the race.
2. Otherwise, if the die shows `6`, keep the same player active for the bonus turn.
3. Otherwise, if the new position is past `30`, leave the token where it was and pass the turn.
4. Otherwise, move the token and pass the turn.

The computer uses the same movement, overshoot, and bonus-turn rules as the human player. A scheduled effect starts its roll automatically when the computer is active. Pending roll timeouts are cleared on reset and when the page unmounts so a previous roll does not update a newly reset game.

### Recent rolls and progress

The activity list keeps the latest **five** rolls, newest first; the scoreboard's roll count tracks the total for the current game. Your progress indicator is the rounded percentage of the track completed (`position / 30`). In the simulator, rolling updates the die and activity list without changing either token position.

## Technology

- **Next.js 16** — App Router and page/layout structure.
- **React 19** — UI components, state, and lifecycle effects.
- **TypeScript** — typed players, game modes, and roll records.
- **Tailwind CSS 4** — stylesheet integration through the Tailwind import and the configured Turbopack loader. The game interface uses custom CSS for its detailed styling.
- **ESLint** — lint checks using the Next.js Core Web Vitals and TypeScript configurations.

## Development and validation

Available commands:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server. |
| `npm run lint` | Run ESLint. |
| `npm run build` | Create the optimized production build and run the project's TypeScript checks. |
| `npm run start` | Serve the built production app locally. Run `npm run build` first. |

Before submitting a change, a useful baseline check is:

```bash
npm run lint
npm run build
```

There is currently no separate automated test script in `package.json`.

### Accessibility and small screens

- Game mode selectors and actions are native buttons, and the main navigation uses links.
- The roll status is announced through a polite live region.
- Important actions have accessible labels; decorative dice pips and icons are hidden from assistive technology where appropriate.
- The layout has desktop, tablet, and phone breakpoints, including a compact track treatment for narrow displays.
- The dice and token animations are shortened or disabled when `prefers-reduced-motion: reduce` is enabled.

## Production build

Build and run the application locally:

```bash
npm ci
npm run build
npm run start
```

The production server listens on port 3000 by default. To use a different port, for example:

```bash
npm run start -- --port 3001
```

The project can be deployed to [Vercel](https://vercel.com/) or another platform that supports Next.js. Follow the hosting provider's current instructions for deploying a Next.js App Router project.

## Limitations and ideas for extension

The game is currently a self-contained, in-memory experience: it has no login, online multiplayer, server-side game state, saved scores, sound effects, configurable rules, or automated test suite. These could be added independently if the project grows. Natural next steps include extracting the game rules into a tested module, adding unit tests for turn resolution and overshoots, or extending the track into a full Ludo board.
