# FAAHHH on Fail — VS Code Extension

## What This Project Is

A VS Code extension that plays the viral "FAAHHH" sound effect when tests fail. It detects test failures across all languages and provides humorous notifications and a status bar indicator.

## Project Goal

Build a fun, lightweight VS Code extension that:
- Detects test failures regardless of programming language
- Plays an audio clip (the "FAAHHH" meme sound) on failure
- Shows humorous notifications and a status bar "vibe check"
- Works on macOS, Windows, and Linux
- Follows best practices: simple, minimal, no over-engineering

## Architecture

Five source files in `src/`, each with a single responsibility:

### `extension.ts` — Entry Point
- Wires up all components in `activate()`
- Registers commands (`faahhh.toggle`, `faahhh.playPreview`)
- Owns the cooldown/debounce logic (default 3s between sounds)
- Listens for config changes to toggle status bar visibility

### `testDetector.ts` — Failure Detection
- Two detection channels, both using stable VS Code APIs:
  1. `window.onDidEndTerminalShellExecution` — catches test commands run in any terminal (e.g., `npm test`, `pytest`, `cargo test`). Pattern-matches the command line against 25+ known test runner patterns, then checks exit code.
  2. `tasks.onDidEndTaskProcess` — catches tests run as VS Code tasks when `task.group === TaskGroup.Test`, checks exit code.
- Non-zero exit code + recognized test command = failure.
- No terminal output parsing. No fragile string matching on results.

### `audioPlayer.ts` — Cross-Platform Sound Playback
- macOS: `afplay` (ships with OS, supports volume via `-v` flag)
- Windows: PowerShell `System.Media.SoundPlayer` (ships with OS, WAV only)
- Linux: fallback chain `paplay` → `aplay` → `ffplay` (detects available player at construction time)
- Kills any in-progress playback before starting a new sound
- Sound file: `sounds/faahhh.wav` (converted from user-provided `fah.mp3`)

### `statusBar.ts` — Visual Feedback
- Shows a status bar item with three states:
  - `$(beaker) Vibes: unknown` — no tests run yet
  - `$(check) Vibes: immaculate` — tests passing (not yet wired, future)
  - `$(error) Vibes: FAAHHH` — tests failed (red background, auto-resets after 30s)
- Clicking the status bar item toggles the sound on/off

### `notifications.ts` — Humorous Failure Messages
- Randomly picks from a pool of roast messages on each failure
- Notification includes a "Mute FAAHHH" action button for quick access
- Uses warning-level notifications (yellow, not red — it's funny, not critical)

## Configuration (in VS Code settings)

| Setting | Type | Default | Description |
|---|---|---|---|
| `faahhh.enabled` | boolean | `true` | Master on/off switch |
| `faahhh.soundPath` | string | `""` | Custom WAV file path (overrides built-in sound) |
| `faahhh.cooldownMs` | number | `3000` | Debounce window between sounds |
| `faahhh.volume` | number | `1.0` | Volume 0.0-1.0 (macOS only) |
| `faahhh.showNotifications` | boolean | `true` | Toggle failure notifications |
| `faahhh.showStatusBar` | boolean | `true` | Toggle status bar item |

## Edge Cases Handled

- **Mass failures (50 tests fail at once)**: Cooldown debounce — plays once, ignores subsequent failures within the window
- **Overlapping audio**: Kills previous `ChildProcess` before spawning new playback
- **Remote/WSL/SSH**: `extensionKind: ["ui", "workspace"]` in `package.json` — VS Code prefers running the extension on the local (UI) side where speakers exist
- **Linux no audio player**: Detects available player at startup, throws helpful error message if none found
- **Missing/corrupted sound file**: `existsSync` check before playback, error shown as notification
- **User in a meeting**: Toggle command + mute button in notifications for quick silencing

## Commands

| Command | Title |
|---|---|
| `faahhh.toggle` | FAAHHH: Toggle Sound |
| `faahhh.playPreview` | FAAHHH: Preview Sound |

## Tech Stack

- TypeScript 5.5+, targeting ES2022
- VS Code Extension API ^1.90.0
- Zero runtime dependencies (only `@types/vscode`, `@types/node`, `typescript` as dev deps)
- Sound format: WAV (universal OS support, no codec dependencies)

## Build & Test

```bash
npm install          # install dev dependencies
npm run compile      # compile TypeScript to out/
F5 in VS Code        # launch Extension Development Host
npm run package      # bundle as .vsix for distribution
```

## File Structure

```
faahhh-on-fail/
├── .vscode/
│   └── launch.json        # F5 launch config for extension dev
├── src/
│   ├── extension.ts        # Entry point + wiring
│   ├── testDetector.ts     # Terminal & task failure detection
│   ├── audioPlayer.ts      # Cross-platform audio playback
│   ├── statusBar.ts        # Status bar vibe indicator
│   └── notifications.ts    # Humorous failure messages
├── sounds/
│   └── faahhh.wav          # The sound (converted from fah.mp3)
├── out/                    # Compiled JS (git-ignored)
├── package.json            # Extension manifest + config schema
├── tsconfig.json           # TypeScript config
└── .vscodeignore           # Files excluded from .vsix package
```

## What's NOT Done Yet (Potential Future Work)

- `statusBar.setPassing()` is implemented but not wired — need a passing test detection path
- No automated tests for the extension itself
- No marketplace publishing setup (publisher ID is placeholder)
- The `onDidChangeTestResults` API (would give us Test Explorer integration) is not yet stable in VS Code — when it stabilizes, it should be added as a third detection channel
- No icon/logo for the extension
