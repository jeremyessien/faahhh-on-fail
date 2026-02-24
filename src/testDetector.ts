import * as vscode from "vscode";

/**
 * Patterns that identify test commands across languages.
 * Each regex is tested against the terminal command line.
 */
const TEST_COMMAND_PATTERNS: readonly RegExp[] = [
  // JavaScript / TypeScript
  /\b(jest|vitest|mocha|ava|jasmine|karma)\b/,
  /\bnpx?\s+(test|jest|vitest|mocha)\b/,
  /\byarn\s+test\b/,
  /\bpnpm\s+test\b/,
  /\bbun\s+test\b/,

  // Python
  /\b(pytest|unittest|nose2)\b/,
  /\bpython\S*\s+-m\s+(pytest|unittest)\b/,

  // Rust
  /\bcargo\s+test\b/,

  // Go
  /\bgo\s+test\b/,

  // Dart / Flutter
  /\b(dart|flutter)\s+test\b/,

  // .NET
  /\bdotnet\s+test\b/,

  // Java / JVM
  /\b(mvn|maven)\s+(test|verify)\b/,
  /\bgradle\s+(test|check)\b/,
  /\b\.\/gradlew\s+(test|check)\b/,

  // Ruby
  /\b(rspec|rake\s+test|rails\s+test|minitest)\b/,

  // PHP
  /\bphpunit\b/,
  /\bcomposer\s+test\b/,

  // Elixir
  /\bmix\s+test\b/,

  // Swift
  /\bswift\s+test\b/,

  // C / C++
  /\bctest\b/,

  // Generic
  /\bmake\s+test\b/,
  /\bnpm\s+test\b/,
];

function isTestCommand(commandLine: string): boolean {
  const normalized = commandLine.toLowerCase().trim();
  return TEST_COMMAND_PATTERNS.some((pattern) => pattern.test(normalized));
}

export type OnTestFailure = (source: string) => void;
export type OnTestPass = (source: string) => void;

export class TestDetector implements vscode.Disposable {
  private readonly disposables: vscode.Disposable[] = [];

  constructor(
    private readonly onFailure: OnTestFailure,
    private readonly onPass: OnTestPass,
  ) {
    this.disposables.push(
      vscode.window.onDidEndTerminalShellExecution((event) =>
        this.handleTerminalExecution(event),
      ),
      vscode.tasks.onDidEndTaskProcess((event) =>
        this.handleTaskProcess(event),
      ),
    );
  }

  private handleTerminalExecution(
    event: vscode.TerminalShellExecutionEndEvent,
  ): void {
    const { exitCode } = event;
    const commandLine = event.execution.commandLine.value;

    if (!isTestCommand(commandLine)) return;

    if (exitCode !== undefined && exitCode !== 0) {
      this.onFailure(commandLine);
    } else if (exitCode === 0) {
      this.onPass(commandLine);
    }
  }

  private handleTaskProcess(event: vscode.TaskProcessEndEvent): void {
    const { exitCode } = event;
    const task = event.execution.task;
    const isTestTask = task.group === vscode.TaskGroup.Test;

    if (!isTestTask) return;

    if (exitCode !== undefined && exitCode !== 0) {
      this.onFailure(task.name);
    } else if (exitCode === 0) {
      this.onPass(task.name);
    }
  }

  dispose(): void {
    this.disposables.forEach((d) => d.dispose());
  }
}
