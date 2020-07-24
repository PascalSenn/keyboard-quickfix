# [keyboard-quickfix](https://marketplace.visualstudio.com/items?itemName=pascalsenn.keyboard-quickfix)

It is currently not possible to navigate through the QuickFix (CodeActions) popup.
For VIM users this really breaks the workflow.
This extension displays quick fixes in a quick open rather than in the menu.

### Before
![Before](/before.png)
### After
![After](/after.png)
## How to use
You can get the extension here:

[Keyboard Quickfix](https://marketplace.visualstudio.com/items?itemName=pascalsenn.keyboard-quickfix)

The command to open the quick fix picker is:

- keyboard-quickfix.openQuickFix

The quick picker can be traversed with the following commands:

- workbench.action.quickOpenSelectNext
- workbench.action.quickOpenSelectPrevious

## Why does this exist?
The quick open popup is a native popup and there for does not support it yet.
It is unclear when the support for it is comming. You can follow this issue:
https://github.com/microsoft/vscode/issues/55111

**Enjoy**

Twitter [@Pascal_Senn](https://twitter.com/Pascal_Senn);
