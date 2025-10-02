'use client';

import Link from 'next/link';

export default function VSCodeExtensionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">
                🔧 VS Code Extension
              </h1>
              <p className="text-xl text-gray-300">
                Get baseline compatibility information directly in your VS Code editor
              </p>
            </div>
            <Link href="/" className="inline-flex items-center text-purple-300 hover:text-purple-100 px-4 py-2 bg-purple-800/30 rounded-lg border border-purple-600/30 hover:bg-purple-700/40 transition-colors">
              ← Back to Baseline Map
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Installation Instructions */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-4">📦 Installation</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-purple-300 mb-2">Method 1: VS Code Marketplace</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                  <li>Open VS Code</li>
                  <li>Go to Extensions (Ctrl+Shift+X)</li>
                  <li>Search for "Baseline Map"</li>
                  <li>Click Install</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-medium text-purple-300 mb-2">Method 2: Command Line</h3>
                <div className="bg-gray-900 rounded p-3 font-mono text-sm text-green-400">
                  code --install-extension ckhadar3.baseline-map-extension
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-purple-300 mb-2">Method 3: Manual Installation</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                  <li>Download the latest .vsix file from our releases</li>
                  <li>Open VS Code</li>
                  <li>Press Ctrl+Shift+P</li>
                  <li>Type &quot;Extensions: Install from VSIX&quot;</li>
                  <li>Select the downloaded .vsix file</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-4">✨ Features</h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="text-green-400 text-xl">🎯</div>
                <div>
                  <h3 className="font-medium text-white">Hover Information</h3>
                  <p className="text-gray-300 text-sm">Get detailed baseline compatibility info when hovering over web features</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="text-blue-400 text-xl">🌐</div>
                <div>
                  <h3 className="font-medium text-white">Browser Support</h3>
                  <p className="text-gray-300 text-sm">See minimum browser versions and support levels for each feature</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="text-yellow-400 text-xl">🔄</div>
                <div>
                  <h3 className="font-medium text-white">Alternatives</h3>
                  <p className="text-gray-300 text-sm">Get specific alternatives for limited availability features</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="text-purple-400 text-xl">📊</div>
                <div>
                  <h3 className="font-medium text-white">Comprehensive Coverage</h3>
                  <p className="text-gray-300 text-sm">Supports 25+ CSS and JavaScript features with detailed information</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Guide */}
        <div className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-semibold text-white mb-4">🚀 How to Use</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-purple-300 mb-3">CSS Features</h3>
              <div className="bg-gray-900 rounded p-4 font-mono text-sm">
                <div className="text-gray-500">{`/* Hover over these properties */`}</div>
                <div className="text-blue-400">.container {`{`}</div>
                <div className="text-white ml-4">display: <span className="text-green-400">grid</span>;</div>
                <div className="text-white ml-4">gap: <span className="text-green-400">1rem</span>;</div>
                <div className="text-white ml-4">aspect-ratio: <span className="text-yellow-400">16/9</span>;</div>
                <div className="text-blue-400">{`}`}</div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-purple-300 mb-3">JavaScript Features</h3>
              <div className="bg-gray-900 rounded p-4 font-mono text-sm">
                <div className="text-gray-500">{`// Hover over these features`}</div>
                <div className="text-purple-400">const</div> <div className="text-white">data = <span className="text-yellow-400">await</span> <span className="text-green-400">fetch</span>(&apos;/api&apos;);</div>
                <div className="text-purple-400">const</div> <div className="text-white">name = user<span className="text-yellow-400">?.</span>profile<span className="text-yellow-400">?.</span>name;</div>
                <div className="text-purple-400">const</div> <div className="text-white">result = value <span className="text-yellow-400">??</span> &apos;default&apos;;</div>
              </div>
            </div>
          </div>
        </div>

        {/* Download Section */}
        <div className="mt-8 text-center">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Ready to Install?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://marketplace.visualstudio.com/items?itemName=ckhadar3.baseline-map-extension"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-purple-800/80 text-white font-semibold rounded-lg hover:bg-purple-700/90 transition-colors border border-purple-400/30 shadow-lg"
              >
                📦 Install from Marketplace
              </a>
              <a
                href="https://github.com/Cmk31311/baseline-map-extension"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-purple-800/80 text-white font-semibold rounded-lg hover:bg-purple-700/90 transition-colors border border-purple-400/30 shadow-lg"
              >
                📂 View on GitHub
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
