/**
 * GitHub Pages Deployment Helper Modal
 * Explains how to deploy to your personal github.io address to bypass school filters permanently,
 * and how the base: './' fix solves the white screen issue.
 */

import React, { useState } from 'react';
import { Github, Copy, Check, ExternalLink, X, ShieldCheck, AlertCircle } from 'lucide-react';

interface GitHubDeployModalProps {
  onClose: () => void;
}

export const GitHubDeployModal: React.FC<GitHubDeployModalProps> = ({ onClose }) => {
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);
  const [copiedCommands, setCopiedCommands] = useState(false);
  const [copiedFixCommands, setCopiedFixCommands] = useState(false);

  const whiteScreenFixCommands = `# Push the relative base path fix to GitHub:
git add vite.config.ts public/.nojekyll
git commit -m "Fix GitHub Pages white screen via relative base: './'"
git push origin main`;

  const workflowYaml = `name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`;

  const terminalCommands = `# 1. Create a new repository on github.com (e.g. named "surf")
# 2. In your terminal, initialize and push:
git init
git add .
git commit -m "Deploy CS2 Surf to GitHub Pages"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/surf.git
git push -u origin main

# 3. On GitHub: Repo Settings -> Pages -> Source: select "GitHub Actions"
# In ~1 minute, your unblocked game is live at:
# https://YOUR_USERNAME.github.io/surf/`;

  const copyToClipboard = (text: string, setCopied: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 pointer-events-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Github className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Host on GitHub.io (Unblocked)</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto text-sm text-slate-300">
          {/* White screen alert banner */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-300 text-sm mb-1">Fix for White Screen on GitHub Pages</h3>
              <p className="text-xs text-amber-200/80 leading-relaxed mb-2">
                A white screen occurs when Vite uses absolute paths (<code className="text-white">/assets/...</code>) on a sub-path repo (<code className="text-white">username.github.io/repo-name/</code>).
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                We have added <code className="text-amber-300 font-bold">base: &apos;./&apos;</code> in <code className="text-white">vite.config.ts</code> and created <code className="text-white">public/.nojekyll</code>. Simply push these changes to GitHub and the white screen will be resolved!
              </p>
            </div>
          </div>

          {/* Quick Push Fix commands */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                Quick Push Fix Commands:
              </h3>
              <button
                onClick={() => copyToClipboard(whiteScreenFixCommands, setCopiedFixCommands)}
                className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"
              >
                {copiedFixCommands ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFixCommands ? 'Copied!' : 'Copy Fix Commands'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre">
              {whiteScreenFixCommands}
            </pre>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-emerald-300 text-sm mb-1">Why GitHub Pages Works on School Wi-Fi</h3>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                School firewalls block generic platforms (Vercel, Netlify, Glitch, Koyeb). Because schools rely on GitHub for education, <strong className="text-white">github.io is almost always whitelisted</strong>!
              </p>
            </div>
          </div>

          {/* Step 1: Initial push */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                First-time Setup Commands
              </h3>
              <button
                onClick={() => copyToClipboard(terminalCommands, setCopiedCommands)}
                className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"
              >
                {copiedCommands ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCommands ? 'Copied!' : 'Copy Setup Commands'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre">
              {terminalCommands}
            </pre>
          </div>

          {/* Step 2: GitHub Action workflow */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                GitHub Action Workflow (`.github/workflows/deploy.yml`)
              </h3>
              <button
                onClick={() => copyToClipboard(workflowYaml, setCopiedWorkflow)}
                className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"
              >
                {copiedWorkflow ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedWorkflow ? 'Copied YAML!' : 'Copy Workflow YAML'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-slate-400 max-h-40 overflow-y-auto whitespace-pre">
              {workflowYaml}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 mt-4 flex justify-between items-center">
          <a
            href="https://github.com/new"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>Create new repo on GitHub</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
