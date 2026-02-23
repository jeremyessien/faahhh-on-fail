import { ChildProcess, execFile, execFileSync } from "child_process";
import { existsSync } from "fs";
import { platform } from "os";
import { join } from "path";

type SupportedPlatform = "darwin" | "win32" | "linux";

const LINUX_PLAYERS: readonly [string, (path: string) => string[]][] = [
  ["paplay", (p) => [p]],
  ["aplay", (p) => [p]],
  ["ffplay", (p) => ["-nodisp", "-autoexit", p]],
];

export class AudioPlayer {
  private process: ChildProcess | null = null;
  private readonly soundPath: string;
  private linuxPlayer: { cmd: string; args: (path: string) => string[] } | null =
    null;

  constructor(private readonly extensionPath: string) {
    this.soundPath = join(extensionPath, "sounds", "faahhh.wav");

    if (platform() === "linux") {
      this.linuxPlayer = this.detectLinuxPlayer();
    }
  }

  play(customPath?: string, volume = 1.0): void {
    const filePath = customPath || this.soundPath;

    if (!existsSync(filePath)) {
      throw new Error(`Sound file not found: ${filePath}`);
    }

    this.stop();

    const os = platform() as SupportedPlatform;

    switch (os) {
      case "darwin":
        this.process = execFile("afplay", ["-v", String(volume), filePath]);
        break;

      case "win32":
        this.process = execFile("powershell", [
          "-NonInteractive",
          "-Command",
          `(New-Object System.Media.SoundPlayer '${filePath}').PlaySync()`,
        ]);
        break;

      case "linux":
        if (!this.linuxPlayer) {
          throw new Error(
            "No audio player found. Install pulseaudio-utils, alsa-utils, or ffmpeg.",
          );
        }
        this.process = execFile(
          this.linuxPlayer.cmd,
          this.linuxPlayer.args(filePath),
        );
        break;

      default:
        throw new Error(`Unsupported platform: ${os}`);
    }

    this.process.on("close", () => (this.process = null));
    this.process.on("error", () => (this.process = null));
  }

  stop(): void {
    this.process?.kill();
    this.process = null;
  }

  dispose(): void {
    this.stop();
  }

  private detectLinuxPlayer() {
    for (const [cmd, args] of LINUX_PLAYERS) {
      try {
        execFileSync("which", [cmd], { stdio: "ignore" });
        return { cmd, args };
      } catch {
        continue;
      }
    }
    return null;
  }
}
