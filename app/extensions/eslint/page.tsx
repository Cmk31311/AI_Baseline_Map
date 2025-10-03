'use client';

import Link from 'next/link';

export default function ESLintPluginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">
                📋 ESLint Plugin
              </h1>
              <p className="text-xl text-gray-300">
                Lint your code for baseline web compatibility issues
              </p>
            </div>
            <Link href="/" className="inline-flex items-center text-green-300 hover:text-green-100 px-4 py-2 bg-green-800/30 rounded-lg border border-green-600/30 hover:bg-green-700/40 transition-colors">
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
                <h3 className="text-lg font-medium text-green-300 mb-2">Step 1: Install the Plugin</h3>
                <div className="bg-gray-900 rounded p-3 font-mono text-sm text-green-400">
                  npm install --save-dev eslint-plugin-baseline-compatibility
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-green-300 mb-2">Step 2: Configure ESLint</h3>
                <p className="text-gray-300 mb-2">Add to your <code className="bg-gray-700 px-2 py-1 rounded">.eslintrc.js</code>:</p>
                <div className="bg-gray-900 rounded p-3 font-mono text-sm">
                  <div className="text-blue-400">module.exports = {`{`}</div>
                  <div className="text-white ml-4">plugins: [<span className="text-green-400">&apos;baseline-compatibility&apos;</span>],</div>
                  <div className="text-white ml-4">rules: {`{`}</div>
                  <div className="text-white ml-8"><span className="text-green-400">&apos;baseline-compatibility/no-unsupported-features&apos;</span>: <span className="text-yellow-400">&apos;warn&apos;</span>,</div>
                  <div className="text-white ml-8"><span className="text-green-400">&apos;baseline-compatibility/prefer-baseline-features&apos;</span>: <span className="text-yellow-400">&apos;error&apos;</span></div>
                  <div className="text-white ml-4">{`}`}</div>
                  <div className="text-blue-400">{`}`};</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-green-300 mb-2">Step 3: Configure Options</h3>
                <div className="bg-gray-900 rounded p-3 font-mono text-sm">
                  <div className="text-white">rules: {`{`}</div>
                  <div className="text-white ml-4"><span className="text-green-400">&apos;baseline-compatibility/no-unsupported-features&apos;</span>: [</div>
                  <div className="text-white ml-8"><span className="text-yellow-400">&apos;warn&apos;</span>, {`{`}</div>
                  <div className="text-white ml-12">baselineLevel: <span className="text-yellow-400">&apos;high&apos;</span>, <span className="text-gray-500">{`// 'high' | 'low'`}</span></div>
                  <div className="text-white ml-12">includePolyfills: <span className="text-blue-400">true</span></div>
                  <div className="text-white ml-8">{`}`}</div>
                  <div className="text-white ml-4">]</div>
                  <div className="text-white">{`}`}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-4">✨ Features</h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="text-red-400 text-xl">⚠️</div>
                <div>
                  <h3 className="font-medium text-white">Unsupported Feature Detection</h3>
                  <p className="text-gray-300 text-sm">Warns about CSS and JS features not in Baseline</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="text-blue-400 text-xl">🔧</div>
                <div>
                  <h3 className="font-medium text-white">Auto-Fix Suggestions</h3>
                  <p className="text-gray-300 text-sm">Provides polyfill suggestions and alternative syntax</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="text-green-400 text-xl">⚙️</div>
                <div>
                  <h3 className="font-medium text-white">Configurable Baseline Level</h3>
                  <p className="text-gray-300 text-sm">Choose between 'high' (widely available) or 'low' (newly available)</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="text-purple-400 text-xl">📊</div>
                <div>
                  <h3 className="font-medium text-white">Comprehensive Coverage</h3>
                  <p className="text-gray-300 text-sm">Scans CSS properties, selectors, and JavaScript features</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rules Documentation */}
        <div className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-semibold text-white mb-4">📋 Available Rules</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-green-300 mb-2">baseline-compatibility/no-unsupported-features</h3>
              <p className="text-gray-300 mb-3">
                Warns when using CSS or JavaScript features that are not part of the specified baseline level.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-red-300 mb-2">❌ Incorrect</h4>
                  <div className="bg-gray-900 rounded p-3 font-mono text-sm">
                    <div className="text-gray-500">/* CSS */</div>
                    <div className="text-white">.container {`{`}</div>
                    <div className="text-white ml-4">container-type: <span className="text-red-400">inline-size</span>; <span className="text-gray-500">/* Not baseline */</span></div>
                    <div className="text-white">{`}`}</div>
                    <br />
                    <div className="text-gray-500">// JavaScript</div>
                    <div className="text-white">const name = user<span className="text-red-400">?.</span>profile<span className="text-red-400">?.</span>name; <span className="text-gray-500">// Not baseline</span></div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-green-300 mb-2">✅ Correct</h4>
                  <div className="bg-gray-900 rounded p-3 font-mono text-sm">
                    <div className="text-gray-500">/* CSS */</div>
                    <div className="text-white">.container {`{`}</div>
                    <div className="text-white ml-4">display: <span className="text-green-400">grid</span>; <span className="text-gray-500">/* Baseline */</span></div>
                    <div className="text-white">{`}`}</div>
                    <br />
                    <div className="text-gray-500">// JavaScript</div>
                    <div className="text-white">const name = user && user.profile && user.profile.name;</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-green-300 mb-2">baseline-compatibility/prefer-baseline-features</h3>
              <p className="text-gray-300 mb-3">
                Suggests using baseline-compatible alternatives when available.
              </p>
              
              <div className="bg-gray-900 rounded p-3 font-mono text-sm">
                <div className="text-gray-500">// Suggests using fetch() instead of XMLHttpRequest</div>
                <div className="text-red-400">const xhr = new XMLHttpRequest(); // ❌</div>
                <div className="text-green-400">const response = await fetch(url); // ✅</div>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Options */}
        <div className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-semibold text-white mb-4">⚙️ Configuration Options</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="py-2 px-4 text-green-300">Option</th>
                  <th className="py-2 px-4 text-green-300">Type</th>
                  <th className="py-2 px-4 text-green-300">Default</th>
                  <th className="py-2 px-4 text-green-300">Description</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-4 font-mono">baselineLevel</td>
                  <td className="py-2 px-4">'high' | 'low'</td>
                  <td className="py-2 px-4">'high'</td>
                  <td className="py-2 px-4">Minimum baseline level to enforce</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-4 font-mono">includePolyfills</td>
                  <td className="py-2 px-4">boolean</td>
                  <td className="py-2 px-4">true</td>
                  <td className="py-2 px-4">Include polyfill suggestions in error messages</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-mono">ignoreFeatures</td>
                  <td className="py-2 px-4">string[]</td>
                  <td className="py-2 px-4">[]</td>
                  <td className="py-2 px-4">List of features to ignore</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Download Section */}
        <div className="mt-8 text-center">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Ready to Install?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://www.npmjs.com/package/eslint-plugin-baseline-compatibility"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-green-800/80 text-white font-semibold rounded-lg hover:bg-green-700/90 transition-colors border border-green-400/30 shadow-lg"
              >
                📦 Install from npm
              </a>
              <a
                href="https://github.com/Cmk31311/AI_Baseline_Map/tree/main/eslint-plugin-baseline"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-green-800/80 text-white font-semibold rounded-lg hover:bg-green-700/90 transition-colors border border-green-400/30 shadow-lg"
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
