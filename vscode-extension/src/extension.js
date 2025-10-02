"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const hoverProvider_1 = require("./hoverProvider");
const baselineData_1 = require("./baselineData");
function activate(context) {
    console.log('Baseline Map extension is now active!');
    // Initialize baseline data provider
    const baselineData = new baselineData_1.BaselineDataProvider();
    // Register hover provider for multiple languages
    const languages = ['html', 'css', 'javascript', 'typescript', 'jsx', 'tsx'];
    languages.forEach(language => {
        const hoverProvider = new hoverProvider_1.BaselineHoverProvider(baselineData);
        const disposable = vscode.languages.registerHoverProvider({ scheme: 'file', language }, hoverProvider);
        context.subscriptions.push(disposable);
    });
    // Register command to show compatibility info
    const showCompatibilityCommand = vscode.commands.registerCommand('baselineMap.showCompatibility', () => {
        vscode.window.showInformationMessage('Baseline Map: Hover over web features to see compatibility information!');
    });
    context.subscriptions.push(showCompatibilityCommand);
    // Show welcome message
    vscode.window.showInformationMessage('Baseline Map extension activated! Hover over web features to see baseline compatibility.', 'Got it!');
}
exports.activate = activate;
function deactivate() {
    console.log('Baseline Map extension deactivated');
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map