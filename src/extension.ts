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
  arguments?: Object[];
  command?: string;
  title: string;
  edit?: any;
}

interface IUri extends vscode.Uri {}
interface ITextEdit extends vscode.TextEdit {}

class CodeActionQuickPick implements vscode.QuickPickItem {
  constructor(command: CodeActionCommand) {
    this.command = command;
    this.label = command.title;
    this.edits = command.edit
      ? (Object.values(command.edit)[0] as { uri: IUri; edit: ITextEdit }[])
      : undefined;
    if (command.command && typeof command.command !== "string") {
      this.command = command.command as CodeActionCommand;
    }
    this.isLabelShown =
      vscode.workspace
        .getConfiguration("keyboard-quickfix")
        .get("showActionNotification") === true;
  }

  public command: CodeActionCommand;
  public label: string;
  public isLabelShown = false;
  public description?: string | undefined;
  public detail?: string | undefined;
  public picked?: boolean | undefined;
  public alwaysShow?: boolean | undefined;
  public edits: { uri: IUri; edit: ITextEdit }[] | undefined;

  public execute() {
    if (this.isLabelShown) vscode.window.showInformationMessage(this.label);
    if (!this.command.command) return this.commitEdits();
    vscode.commands
      .executeCommand(this.command.command, ...(this.command.arguments || []))
      .then((result) => {
        if (
          this.command.command?.includes(
            "_typescript.applyCodeActionCommand"
          ) &&
          result
        )
          this.commitEdits();
      });
  }

  private async commitEdits() {
    if (!this.edits) return;
    const initialDocument = vscode.window.activeTextEditor?.document;
    const newEdit = this.parseEdit(this.edits);
    await Promise.all(
      newEdit.map(async ({ uri, edits }) => {
        const document = await vscode.workspace.openTextDocument(uri);
        const editor = await vscode.window.showTextDocument(document);
        editor.edit((editBuilder) => {
          edits.forEach((edit) => {
            editBuilder.replace(edit.range, edit.newText);
          });
        });
      })
    );
    // unable to open and edit document in the background
    // due to vscode api constraints, active editor needs to be
    // changed manually
    if (initialDocument) vscode.window.showTextDocument(initialDocument);
  }

  private parseEdit(
    edits: { uri: IUri; edit: ITextEdit }[]
  ): { uri: IUri; edits: ITextEdit[] }[] {
    return edits.reduce<{ uri: IUri; edits: ITextEdit[] }[]>(
      (accumulator, currentValue) => {
        const documentChanges = accumulator.find(
          (edit) => edit.uri.path === currentValue.uri.path
        );
        const textEdit = currentValue.edit;
        if (documentChanges) {
          documentChanges.edits.push(textEdit);
        } else {
          accumulator.push({
            uri: currentValue.uri,
            edits: [currentValue.edit],
          });
        }
        return accumulator;
      },
      []
    );
  }
}
