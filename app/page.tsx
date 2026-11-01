"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const TRACK_LENGTH = 30;
const HISTORY_LIMIT = 5;

type GameMode = "race" | "dice";
type Player = "you" | "computer";
type Roll = {
  player: Player;
  value: number;
};

const playerNames: Record<Player, string> = {
  you: "You",
  computer: "Computer",
};

function DiceFace({ value, rolling = false }: { value: number; rolling?: boolean }) {
  const positions: Record<number, string[]> = {
    1: ["center"],
    2: ["top-left", "bottom-right"],
    3: ["top-left", "center", "bottom-right"],
    4: ["top-left", "top-right", "bottom-left", "bottom-right"],
    5: ["top-left", "top-right", "center", "bottom-left", "bottom-right"],
    6: ["top-left", "top-right", "middle-left", "middle-right", "bottom-left", "bottom-right"],
  };

  return (
    <span className={`dice-face${rolling ? " is-rolling" : ""}`} aria-hidden="true">
      {positions[value].map((position) => (
        <span className={`pip pip-${position}`} key={position} />
      ))}
    </span>
  );
}

function Token({ player, small = false }: { player: Player; small?: boolean }) {
  return (
    <span
      className={`token token-${player}${small ? " token-small" : ""}`}
      aria-label={`${playerNames[player]} token`}
    >
      <span />
    </span>
  );
}

function Track({ youPosition, computerPosition }: { youPosition: number; computerPosition: number }) {
  return (
    <div className="track">
      <div className="track-start">
        <span className="track-end-label">START</span>
        <div className="start-tokens">
          {youPosition === 0 && <Token player="you" small />}
          {computerPosition === 0 && <Token player="computer" small />}
        </div>
      </div>
      <div className="track-grid" aria-label="30-space race track">
        {Array.from({ length: TRACK_LENGTH }, (_, index) => {
          const step = index + 1;
          const isSafe = [5, 10, 15, 20, 25].includes(step);
          const youHere = youPosition === step;
          const computerHere = computerPosition === step;

          return (
            <div
              className={`track-space${isSafe ? " is-safe" : ""}${youHere || computerHere ? " has-token" : ""}`}
              key={step}
              aria-label={`Space ${step}${youHere ? ", your token" : ""}${computerHere ? ", computer token" : ""}`}
            >
              {isSafe && <span className="safe-star" aria-hidden="true">✦</span>}
              <span className="space-number">{step}</span>
              <span className="space-tokens">
                {youHere && <Token player="you" small />}
                {computerHere && <Token player="computer" small />}
              </span>
            </div>
          );
        })}
      </div>
      <div className={`track-home${youPosition === TRACK_LENGTH || computerPosition === TRACK_LENGTH ? " is-home" : ""}`}>
        <span className="track-end-label">HOME</span>
        <span className="home-house" aria-hidden="true">⌂</span>
      </div>
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 2 1.8 7.2L21 12l-7.2 1.8L12 21l-1.8-7.2L3 12l7.2-2.8L12 2Z" fill="currentColor" />
      <path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" fill="currentColor" />
    </svg>
  );
}

export default function Home() {
  const [mode, setMode] = useState<GameMode>("race");
  const [turn, setTurn] = useState<Player>("you");
  const [youPosition, setYouPosition] = useState(0);
  const [computerPosition, setComputerPosition] = useState(0);
  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [rolls, setRolls] = useState<Roll[]>([]);
  const [totalRolls, setTotalRolls] = useState(0);
  const [message, setMessage] = useState("Your turn! Roll the dice to get started.");
  const rollTimeout = useRef<number | null>(null);

  const rollDice = useCallback(() => {
    if (isRolling || winner) return;

    setIsRolling(true);
    const rollingPlayer = turn;

    rollTimeout.current = window.setTimeout(() => {
      rollTimeout.current = null;
      const value = Math.floor(Math.random() * 6) + 1;
      const currentPosition = rollingPlayer === "you" ? youPosition : computerPosition;
      const nextPosition = currentPosition + value;
      const hasWon = nextPosition === TRACK_LENGTH;
      const staysForBonus = value === 6 && !hasWon;

      setDiceValue(value);
      setIsRolling(false);
      setTotalRolls((count) => count + 1);
      setRolls((history) => [{ player: rollingPlayer, value }, ...history].slice(0, HISTORY_LIMIT));

      if (nextPosition <= TRACK_LENGTH) {
        if (rollingPlayer === "you") setYouPosition(nextPosition);
        else setComputerPosition(nextPosition);
      }

      if (hasWon) {
        setWinner(rollingPlayer);
        setMessage(rollingPlayer === "you" ? "You made it home! What a lovely win!" : "The computer made it home this time!");
      } else if (staysForBonus) {
        setMessage(rollingPlayer === "you" ? "A six! You get another turn." : "The computer rolled a six and goes again!");
      } else if (nextPosition > TRACK_LENGTH) {
        const remaining = TRACK_LENGTH - currentPosition;
        setMessage(`${playerNames[rollingPlayer]} need${rollingPlayer === "you" ? "" : "s"} an exact ${remaining} to get home.`);
        setTurn(rollingPlayer === "you" ? "computer" : "you");
      } else {
        setMessage(`${playerNames[rollingPlayer]} rolled a ${value}.${rollingPlayer === "you" ? " The computer is up next." : " Your turn!"}`);
        setTurn(rollingPlayer === "you" ? "computer" : "you");
      }
    }, 650);
  }, [computerPosition, isRolling, turn, winner, youPosition]);

  useEffect(() => {
    if (mode !== "race" || turn !== "computer" || isRolling || winner) return;

    const timeout = window.setTimeout(rollDice, 900);
    return () => window.clearTimeout(timeout);
  }, [mode, turn, isRolling, winner, rollDice]);

  useEffect(() => {
    return () => {
      if (rollTimeout.current !== null) window.clearTimeout(rollTimeout.current);
    };
  }, []);

  function resetGame() {
    if (rollTimeout.current !== null) {
      window.clearTimeout(rollTimeout.current);
      rollTimeout.current = null;
    }
    setTurn("you");
    setYouPosition(0);
    setComputerPosition(0);
    setDiceValue(1);
    setIsRolling(false);
    setWinner(null);
    setRolls([]);
    setTotalRolls(0);
    setMessage("Your turn! Roll the dice to get started.");
  }

  function changeMode(nextMode: GameMode) {
    setMode(nextMode);
    resetGame();
  }

  const progress = Math.round((youPosition / TRACK_LENGTH) * 100);
  const turnLabel = winner
    ? winner === "you" ? "You won!" : "Computer won"
    : mode === "dice"
      ? "Free roll"
      : turn === "you" ? "Your turn" : "Computer’s turn";
  const rollMessage = mode === "dice" ? "Every roll is a fresh start. Have a little fun!" : message;

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="Ludo home">
          <span className="brand-mark"><span /><span /><span /><span /></span>
          <span className="brand-word">ludo<span>.</span></span>
        </a>

        <div className="sidebar-label">PLAY</div>
        <nav className="side-nav" aria-label="Main navigation">
          <a className="nav-item active" href="#game" aria-label="Play game">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.7" /><path d="m9 8 7 4-7 4V8Z" fill="currentColor" /></svg>
            <span>Play game</span>
          </a>
          <a className="nav-item" href="#how-to-play" aria-label="How to play">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" /><path d="M9.8 9a2.3 2.3 0 1 1 3.9 1.6c-1.1 1-1.7 1.2-1.7 2.9M12 16.8h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
            <span>How to play</span>
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="note-sparkle"><SparkleIcon /></span>
            <p>A little game<br />for a happy break.</p>
            <span className="note-bengali">চলো খেলি!</span>
          </div>
          <div className="profile">
            <div className="profile-avatar">R</div>
            <div className="profile-copy"><strong>Guest player</strong><span>Ready for a game?</span></div>
            <span className="profile-menu" aria-hidden="true">···</span>
          </div>
        </div>
      </aside>

      <section className="main-content" id="game">
        <header className="topbar">
          <div className="breadcrumb"><span>Games</span><span className="breadcrumb-divider">/</span><strong>Ludo</strong></div>
          <div className="topbar-right"><span className="online-dot" /> A cozy little game <span className="topbar-sun" aria-hidden="true">☼</span></div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <div className="eyebrow"><span className="eyebrow-dot" /> YOUR HAPPY PLACE</div>
              <h1>A little roll.<br /><span>A lot of joy.</span></h1>
              <p className="welcome-description">A tiny taste of the game we all grew up with.<br className="desktop-break" /> Roll, race, and make it all the way home.</p>
            </div>
            <div className="welcome-doodle" aria-hidden="true">
              <div className="doodle-spark">✳</div>
              <div className="doodle-dice"><DiceFace value={5} /></div>
              <span className="doodle-dot dot-one" /><span className="doodle-dot dot-two" />
            </div>
          </section>

          <div className="game-layout">
            <section className="game-card" aria-label="Ludo game">
              <div className="game-card-header">
                <div className="mode-tabs" role="tablist" aria-label="Game mode">
                  <button className={`mode-tab${mode === "race" ? " selected" : ""}`} onClick={() => changeMode("race")} role="tab" aria-selected={mode === "race"}>
                    <span className="tab-icon">🏁</span> Token race
                  </button>
                  <button className={`mode-tab${mode === "dice" ? " selected" : ""}`} onClick={() => changeMode("dice")} role="tab" aria-selected={mode === "dice"}>
                    <span className="tab-icon">🎲</span> Dice simulator
                  </button>
                </div>
                <button className="reset-button" onClick={resetGame} aria-label="Start a new game" title="Start a new game">
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M16.2 8A6.4 6.4 0 0 0 5 5.2L3.7 6.5M3.7 6.5V3.7m0 2.8h2.8M3.8 12a6.4 6.4 0 0 0 11.2 2.8l1.3-1.3m0 0v2.8m0-2.8h-2.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <span>New game</span>
                </button>
              </div>

              {mode === "race" ? (
                <div className="race-content">
                  <div className="race-meta">
                    <div className="player-pills">
                      <div className={`player-pill${turn === "you" && !winner ? " is-turn" : ""}`}>
                        <Token player="you" small /><span>You</span><span className="you-tag">YOU</span>
                      </div>
                      <span className="versus">vs</span>
                      <div className={`player-pill${turn === "computer" && !winner ? " is-turn" : ""}`}>
                        <Token player="computer" small /><span>Computer</span><span className="bot-tag">BOT</span>
                      </div>
                    </div>
                    <div className="turn-badge"><span className={`turn-dot${turn === "computer" && !winner ? " bot-dot" : ""}`} />{turnLabel}</div>
                  </div>

                  <Track youPosition={youPosition} computerPosition={computerPosition} />

                  <div className="track-legend">
                    <span><i className="legend-dot you-dot" /> Your token <strong>{youPosition}/{TRACK_LENGTH}</strong></span>
                    <span><i className="legend-dot computer-dot" /> Computer <strong>{computerPosition}/{TRACK_LENGTH}</strong></span>
                    <span className="safe-legend"><span>✦</span> Safe spot</span>
                  </div>

                  <div className="progress-area">
                    <div className="progress-label"><span>Your journey</span><strong>{progress}%</strong></div>
                    <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
                  </div>
                </div>
              ) : (
                <div className="simulator-content">
                  <div className="simulator-intro">
                    <span className="simulator-kicker">JUST FOR FUN</span>
                    <h2>Go on, give it a roll.</h2>
                    <p>No race, no rules. Just a little moment of chance.</p>
                  </div>
                  <div className="simulator-die-wrap">
                    <DiceFace value={diceValue} rolling={isRolling} />
                    <span className="die-shadow" />
                  </div>
                  <p className="simulator-result">{isRolling ? "Rolling..." : totalRolls ? `You rolled a ${diceValue}!` : "Your lucky number is waiting."}</p>
                </div>
              )}

              <div className="roll-area">
                <div className={`roll-message${winner === "you" ? " win-message" : ""}`} aria-live="polite">
                  <span className="message-icon">{mode === "dice" ? "🎲" : winner === "you" ? "🎉" : diceValue === 6 && totalRolls ? "✨" : "💬"}</span>
                  <span>{rollMessage}</span>
                </div>
                <div className="roll-controls">
                  <button
                    className={`roll-button${isRolling ? " rolling" : ""}`}
                    onClick={rollDice}
                    disabled={isRolling || Boolean(winner) || (mode === "race" && turn === "computer")}
                  >
                    <DiceFace value={diceValue} rolling={isRolling} />
                    <span>{isRolling ? "Rolling..." : mode === "race" && turn === "computer" ? "Computer’s turn" : "Roll the dice"}</span>
                    {!isRolling && <span className="roll-arrow" aria-hidden="true">↗</span>}
                  </button>
                  <p className="roll-hint">{mode === "race" ? "Roll a 6 to earn a bonus turn!" : "Go ahead, tap to roll!"}</p>
                </div>
              </div>
            </section>

            <aside className="side-column">
              <section className="score-card">
                <div className="card-heading"><div><span className="card-kicker">THE RACE</span><h2>Little scoreboard</h2></div><span className="trophy-icon">🏆</span></div>
                <div className="score-row">
                  <div className="score-avatar you-avatar"><Token player="you" small /></div>
                  <div className="score-name"><strong>You</strong><span>{youPosition === TRACK_LENGTH ? "Made it home!" : `${TRACK_LENGTH - youPosition} steps to home`}</span></div>
                  <div className="score-value">{youPosition}<small>/{TRACK_LENGTH}</small></div>
                </div>
                <div className="score-row">
                  <div className="score-avatar bot-avatar"><Token player="computer" small /></div>
                  <div className="score-name"><strong>Computer</strong><span>{computerPosition === TRACK_LENGTH ? "Made it home!" : `${TRACK_LENGTH - computerPosition} steps to home`}</span></div>
                  <div className="score-value">{computerPosition}<small>/{TRACK_LENGTH}</small></div>
                </div>
                <div className="score-footer"><span>🎲</span> {totalRolls} {totalRolls === 1 ? "roll" : "rolls"} so far</div>
              </section>

              <section className="activity-card">
                <div className="card-heading activity-heading"><div><span className="card-kicker">THE LITTLE MOMENTS</span><h2>Recent rolls</h2></div><span className="activity-count">{rolls.length}</span></div>
                {rolls.length ? (
                  <ul className="roll-history">
                    {rolls.map((roll, index) => (
                      <li className="history-item" key={`${totalRolls}-${index}`}>
                        <span className={`history-avatar history-${roll.player}`}><Token player={roll.player} small /></span>
                        <span className="history-copy"><strong>{playerNames[roll.player]}</strong><small>{index === 0 ? "Just now" : `${index} ${index === 1 ? "roll" : "rolls"} ago`}</small></span>
                        <span className={`history-die${roll.value === 6 ? " lucky-roll" : ""}`}><DiceFace value={roll.value} /></span>
                        {roll.value === 6 && <span className="lucky-label">LUCKY!</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="empty-history"><span className="empty-dice">⚄</span><p>The fun starts with<br />your very first roll.</p></div>
                )}
              </section>

              <section className="tip-card" id="how-to-play">
                <span className="tip-icon">💡</span>
                <div><strong>A little tip</strong><p>A perfect roll gets you home. If you go over, you&apos;ll need to try again!</p></div>
              </section>
            </aside>
          </div>

          <footer className="page-footer"><span>Made with a little nostalgia</span><span className="footer-heart">♥</span><span>for the games we grew up with</span><span className="footer-bengali">— বাংলাদেশ থেকে, ভালোবাসা দিয়ে</span></footer>
        </div>
      </section>
    </main>
  );
}
