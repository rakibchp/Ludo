# Ludo — A little roll. A lot of joy.

A cozy, responsive Ludo-inspired dice game built with Next.js, React, TypeScript, and Tailwind CSS. Play a quick race against the computer or use the dice simulator for a casual roll.

## Features

- **Token Race:** Move your token along a 30-space track and race the computer to home.
- **Computer opponent:** The computer takes its turn automatically after yours.
- **Bonus turns:** Rolling a six earns another turn.
- **Exact finish:** A token must land exactly on the home space. If a roll would move it past home, it stays put and the turn passes.
- **Safe spaces:** Marked spaces along the track show the familiar safe spots.
- **Dice Simulator:** Switch to a standalone mode for unlimited rolls without moving tokens.
- **Game status:** Follow each player's position, your progress, recent rolls, and turn messages.
- **Responsive interface:** Layouts adapt to desktop, tablet, and mobile screens. Motion effects respect the device's reduced-motion preference.
- **New game:** Reset the track, scores, and roll history at any time.

## Getting Started

### Requirements

- Node.js compatible with the installed Next.js version.
- npm (or another compatible package manager).

### Install dependencies

From the project directory:

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The development server refreshes the page as you edit the source.

## Available Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local Next.js development server. |
| `npm run lint` | Run ESLint across the project. |
| `npm run build` | Create and type-check an optimized production build. |
| `npm run start` | Serve the production build locally. Run `npm run build` first. |

## How to Play

1. Select **Token race** to play against the computer.
2. Select **Roll the dice** on your turn.
3. Your token advances by the number shown on the die. The computer moves automatically on its turn.
4. Roll a six to take another turn.
5. Be the first player to land exactly on **Home** to win. A roll that would pass Home does not move your token.
6. Select **New game** to start over.

Select **Dice simulator** at any time to roll without playing the race. Switch back to **Token race** to begin a fresh game.

## Project Structure

```text
app/
  favicon.ico
  globals.css    Global styles, track layout, responsive rules, and animations
  layout.tsx     Root layout and page metadata
  page.tsx       Game interface and interactive game state
public/          Static assets
```

### Game state

The interactive game is implemented in `app/page.tsx` as a React client component. It keeps track of the selected mode, whose turn it is, both token positions, the current die, the game result, and recent rolls.

The race track has 30 spaces. Each roll generates a number from one to six. A roll that reaches space 30 wins; a roll beyond space 30 leaves the token in place. A six grants a bonus turn unless it ends the game. Otherwise, turns alternate, with the computer taking its turn automatically. The dice simulator uses the same dice but does not change race positions or turns.

The shared visual system and mobile breakpoints are in `app/globals.css`. Page title and description are configured in `app/layout.tsx`.

## Technology

- [Next.js](https://nextjs.org/) App Router
- [React](https://react.dev/) and [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) (with custom CSS for the game interface)

## Build for Production

```bash
npm run build
npm run start
```

The production server serves the optimized application at [http://localhost:3000](http://localhost:3000) by default. The project can also be deployed to [Vercel](https://vercel.com/).
