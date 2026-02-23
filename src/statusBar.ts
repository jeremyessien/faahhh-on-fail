import * as vscode from "vscode";

const enum Vibe {
  Unknown = "unknown",
  Passing = "passing",
  Failing = "failing",
}

const VIBE_LABELS: Record<Vibe, string> = {
  [Vibe.Unknown]: "$(beaker) Vibes: unknown",
  [Vibe.Passing]: "$(check) Vibes: immaculate",
  [Vibe.Failing]: "$(error) Vibes: FAAHHH",
};

const VIBE_COLORS: Record<Vibe, string | undefined> = {
  [Vibe.Unknown]: undefined,
  [Vibe.Passing]: undefined,
  [Vibe.Failing]: "statusBarItem.errorBackground",
};

export class StatusBarManager implements vscode.Disposable {
  private readonly item: vscode.StatusBarItem;
  private resetTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.item = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      0,
    );
    this.setVibe(Vibe.Unknown);
    this.item.command = "faahhh.toggle";
    this.item.tooltip = "Click to toggle FAAHHH sound";
  }

  show(): void {
    this.item.show();
  }

  hide(): void {
    this.item.hide();
  }

  setFailing(): void {
    this.clearResetTimer();
    this.setVibe(Vibe.Failing);

    // Auto-reset to "unknown" after 30 seconds so it doesn't stay red forever
    this.resetTimer = setTimeout(() => this.setVibe(Vibe.Unknown), 30_000);
  }

  setPassing(): void {
    this.clearResetTimer();
    this.setVibe(Vibe.Passing);
  }

  dispose(): void {
    this.clearResetTimer();
    this.item.dispose();
  }

  private setVibe(vibe: Vibe): void {
    this.item.text = VIBE_LABELS[vibe];
    this.item.backgroundColor = VIBE_COLORS[vibe]
      ? new vscode.ThemeColor(VIBE_COLORS[vibe]!)
      : undefined;
  }

  private clearResetTimer(): void {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = null;
    }
  }
}
