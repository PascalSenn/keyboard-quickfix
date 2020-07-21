// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "keyboard-quickfix.openQuickFix",
    async () => {
      var commands = (await vscode.commands.executeCommand(
        "vscode.executeCodeActionProvider",
        vscode.window.activeTextEditor?.document.uri,
        vscode.window.activeTextEditor?.selection
      )) as CodeActionCommand[];

      if (commands.length > 0) {
        vscode.window
          .showQuickPick(commands.map((x) => new CodeActionQuickPick(x)))
          .then((x) => x?.execute());
      } else {
        vscode.window.showInformationMessage("No code actions available");
      }
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

interface CodeActionCommand {
  arguments: Object[];
  command: string;
  title: string;
}

class CodeActionQuickPick implements vscode.QuickPickItem {
  constructor(command: CodeActionCommand) {
    this.command = command;
    this.label = command.title;
    if (typeof command.command !== "string") {
      this.command = command.command as CodeActionCommand;
    }
    this.isShowLabel =
      vscode.workspace
        .getConfiguration("keyboard-quickfix")
        .get("showActionLabel") === true;
  }

  public command: CodeActionCommand;
  public label: string;
  public isShowLabel = false;
  public description?: string | undefined;
  public detail?: string | undefined;
  public picked?: boolean | undefined;
  public alwaysShow?: boolean | undefined;

  public execute() {
    if (this.isShowLabel) vscode.window.showInformationMessage(this.label);
    vscode.commands.executeCommand(
      this.command.command,
      ...this.command.arguments
    );
  }
}
