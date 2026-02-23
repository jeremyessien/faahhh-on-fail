import * as vscode from "vscode";
import { AudioPlayer } from "./audioPlayer";
import { showFailureNotification } from "./notifications";
import { StatusBarManager } from "./statusBar";
import { TestDetector } from "./testDetector";

let audioPlayer: AudioPlayer;
let statusBar: StatusBarManager;
let testDetector: TestDetector;
let lastPlayedAt = 0;

export function activate(context: vscode.ExtensionContext): void {
  audioPlayer = new AudioPlayer(context.extensionPath);
  statusBar = new StatusBarManager();
  testDetector = new TestDetector(handleTestFailure);

  const config = vscode.workspace.getConfiguration("faahhh");

  if (config.get<boolean>("showStatusBar")) {
    statusBar.show();
  }

  context.subscriptions.push(
    testDetector,
    statusBar,
    { dispose: () => audioPlayer.dispose() },

    vscode.commands.registerCommand("faahhh.toggle", toggleEnabled),
    vscode.commands.registerCommand("faahhh.playPreview", previewSound),

    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("faahhh.showStatusBar")) {
        const show = vscode.workspace
          .getConfiguration("faahhh")
          .get<boolean>("showStatusBar");
        show ? statusBar.show() : statusBar.hide();
      }
    }),
  );
}

export function deactivate(): void {
  audioPlayer?.dispose();
}

function handleTestFailure(source: string): void {
  const config = vscode.workspace.getConfiguration("faahhh");
  if (!config.get<boolean>("enabled")) return;

  const cooldownMs = config.get<number>("cooldownMs", 3000);
  const now = Date.now();

  if (now - lastPlayedAt < cooldownMs) return;
  lastPlayedAt = now;

  statusBar.setFailing();
  playSound(config);

  if (config.get<boolean>("showNotifications")) {
    showFailureNotification(source);
  }
}

function playSound(config: vscode.WorkspaceConfiguration): void {
  const customPath = config.get<string>("soundPath");
  const volume = config.get<number>("volume", 1.0);

  try {
    audioPlayer.play(customPath || undefined, volume);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    vscode.window.showErrorMessage(`FAAHHH: ${message}`);
  }
}

function toggleEnabled(): void {
  const config = vscode.workspace.getConfiguration("faahhh");
  const current = config.get<boolean>("enabled", true);
  config.update("enabled", !current, vscode.ConfigurationTarget.Global);

  vscode.window.showInformationMessage(
    current ? "FAAHHH muted. Your tests can fail in peace." : "FAAHHH re-enabled. No mercy.",
  );
}

function previewSound(): void {
  const config = vscode.workspace.getConfiguration("faahhh");
  playSound(config);
}
