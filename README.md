# FAAHHH on Fail

A VS Code extension that plays the viral **"FAAHHH"** sound effect when your tests fail.

Works with every language. No configuration needed. Just install and code.

## What It Does

- Detects test failures from **any test runner** (Jest, pytest, cargo test, go test, flutter test, and 20+ more)
- Plays the FAAHHH sound clip on failure
- Shows a random roast notification (e.g. *"Skill issue detected."*)
- Displays a **vibe check** in the status bar:
  - `Vibes: unknown` — no tests run yet
  - `Vibes: immaculate` — tests passing
  - `Vibes: FAAHHH` — tests failing (red background, auto-resets after 30s)

## Supported Test Runners

| Language | Runners |
|---|---|
| JavaScript / TypeScript | jest, vitest, mocha, ava, jasmine, karma, npm test, yarn test, pnpm test, bun test |
| Python | pytest, unittest, nose2 |
| Rust | cargo test |
| Go | go test |
| Dart / Flutter | dart test, flutter test |
| .NET | dotnet test |
| Java / JVM | mvn test, gradle test, ./gradlew test |
| Ruby | rspec, rake test, rails test, minitest |
| PHP | phpunit, composer test |
| Elixir | mix test |
| Swift | swift test |
| C / C++ | ctest |
| Generic | make test |

If your test runner exits with a non-zero code, FAAHHH will catch it.

## How It Works

The extension listens for two things using stable VS Code APIs:

1. **Terminal commands** — When you run a test command in the integrated terminal, it pattern-matches the command against known test runners and checks the exit code.
2. **VS Code tasks** — When a task in the "Test" group finishes, it checks the exit code.

No terminal output parsing. No fragile string matching on results. Just command name + exit code.

## Installation

### From Source

```bash
git clone <repo-url>
cd faahhh-on-fail
npm install
npm run compile
```

Then press **F5** in VS Code to launch with the extension loaded.

### As .vsix Package

```bash
npm run package
```

Then install the `.vsix` file: **Extensions panel > ... menu > Install from VSIX...**

## Settings

| Setting | Type | Default | Description |
|---|---|---|---|
| `faahhh.enabled` | boolean | `true` | Master on/off switch |
| `faahhh.soundPath` | string | `""` | Path to a custom WAV file (overrides built-in sound) |
| `faahhh.cooldownMs` | number | `3000` | Minimum ms between sounds (prevents spam on mass failures) |
| `faahhh.volume` | number | `1.0` | Playback volume 0.0–1.0 (macOS only) |
| `faahhh.showNotifications` | boolean | `true` | Toggle roast notifications |
| `faahhh.showStatusBar` | boolean | `true` | Toggle the vibe check status bar item |

## Commands

| Command | What It Does |
|---|---|
| `FAAHHH: Toggle Sound` | Mute / unmute the sound. Also accessible by clicking the status bar item. |
| `FAAHHH: Preview Sound` | Play the sound right now to test your speakers. |

## Cross-Platform Audio

Zero dependencies — uses tools already on your OS:

| OS | Player | Notes |
|---|---|---|
| macOS | `afplay` | Ships with macOS. Supports volume control. |
| Windows | PowerShell `SoundPlayer` | Ships with Windows. WAV only. |
| Linux | `paplay` / `aplay` / `ffplay` | Auto-detects whichever is installed. |

## FAQ

**Q: 50 tests failed at once. Did it play 50 sounds?**
No. There's a cooldown (default 3 seconds). It plays once, then ignores subsequent failures within that window.

**Q: I'm in a meeting. How do I shut it up?**
Three ways: (1) Click the status bar item, (2) Click "Mute FAAHHH" on any notification, or (3) Run the `FAAHHH: Toggle Sound` command.

**Q: Does it work over SSH / WSL / Remote?**
Yes. The extension prefers running on the UI (local) side where your speakers are.

**Q: Can I use my own sound?**
Yes. Set `faahhh.soundPath` to the absolute path of any `.wav` file.

**Q: Why WAV and not MP3?**
WAV plays natively on all three OSes without needing codec libraries or extra dependencies.

## License

MIT
