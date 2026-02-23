import * as vscode from "vscode";

const FAILURE_MESSAGES: readonly string[] = [
  "Your tests are screaming.",
  "This is fine. (It's not fine.)",
  "FAAHHH! Tests couldn't even.",
  "Tests said: nah.",
  "Skill issue detected.",
  "Tests took one look at your code and gave up.",
  "Your code made the tests cry.",
  "Even the linter is embarrassed.",
  "Tests failed. Mercury must be in retrograde.",
  "Your tests called. They want a refund.",
];

export function showFailureNotification(failedCommand: string): void {
  const message = FAILURE_MESSAGES[Math.floor(Math.random() * FAILURE_MESSAGES.length)];
  const prefix = getFailureEmoji();

  vscode.window.showWarningMessage(`${prefix} ${message}`, "Dismiss", "Mute FAAHHH").then(
    (selection) => {
      if (selection === "Mute FAAHHH") {
        vscode.workspace
          .getConfiguration("faahhh")
          .update("enabled", false, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage("FAAHHH muted. Run 'FAAHHH: Toggle Sound' to re-enable.");
      }
    },
  );
}

function getFailureEmoji(): string {
  const emojis = ["\u{1F480}", "\u{1F525}", "\u{1F62D}", "\u{2620}\u{FE0F}", "\u{1FAE0}", "\u{1F4A9}", "\u{1F921}"];
  return emojis[Math.floor(Math.random() * emojis.length)];
}
