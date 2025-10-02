import * as vscode from 'vscode';
import { BaselineHoverProvider } from './hoverProvider';
import { BaselineDataProvider } from './baselineData';

export function activate(context: vscode.ExtensionContext) {
    console.log('Baseline Map extension is now active!');

    // Initialize baseline data provider
    const baselineData = new BaselineDataProvider();

    // Register hover provider for multiple languages
    const languages = ['html', 'css', 'javascript', 'typescript', 'jsx', 'tsx'];
    
    languages.forEach(language => {
        const hoverProvider = new BaselineHoverProvider(baselineData);
        const disposable = vscode.languages.registerHoverProvider(
            { scheme: 'file', language },
            hoverProvider
        );
        context.subscriptions.push(disposable);
    });

    // Register command to show compatibility info
    const showCompatibilityCommand = vscode.commands.registerCommand(
        'baselineMap.showCompatibility',
        () => {
            vscode.window.showInformationMessage('Baseline Map: Hover over web features to see compatibility information!');
        }
    );
    context.subscriptions.push(showCompatibilityCommand);

    // Show welcome message
    vscode.window.showInformationMessage(
        'Baseline Map extension activated! Hover over web features to see baseline compatibility.',
        'Got it!'
    );
}

export function deactivate() {
    console.log('Baseline Map extension deactivated');
}
