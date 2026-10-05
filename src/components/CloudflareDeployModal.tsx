/**
 * Cloudflare Pages Deployment Helper Modal
 * Explains how to deploy to Cloudflare Pages (*.pages.dev) with automatic Vite builds,
 * and how removing bun.lock resolves the invalid lockfileVersion error.
 */

import React, { useState } from 'react';
import { Cloud, Copy, Check, ExternalLink, X, ShieldCheck, Zap, Sparkles, AlertCircle } from 'lucide-react';

interface CloudflareDeployModalProps {
  onClose: () => void;
}

export const CloudflareDeployModal: React.FC<CloudflareDeployModalProps> = ({ onClose }) => {
  const [copiedBuildCommand, setCopiedBuildCommand] = useState(false);
  const [copiedOutputDir, setCopiedOutputDir] = useState(false);
  const [copiedFixCommands, setCopiedFixCommands] = useState(false);

  const bunFixCommands = `# Remove bun.lock and push standard npm config:
git rm bun.lock
git add package.json .gitignore
git commit -m "Remove bun.lock and enforce npm for Cloudflare Pages"
git push origin main`;

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
            <Cloud className="w-6 h-6 text-orange-400" />
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Deploy to Cloudflare Pages</h2>
              <span className="text-xs text-orange-300 font-mono">*.pages.dev (Automatic Vite Build)</span>
            </div>
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
          {/* Bun Lockfile Fix Alert */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-300 text-sm mb-1">
                Fixed: &quot;invalid lockfileVersion: 2&quot; in bun.lock
              </h3>
              <p className="text-xs text-amber-200/80 leading-relaxed mb-2">
                Cloudflare Pages auto-detects <code className="text-white font-mono">bun.lock</code> and attempts to run <code className="text-white font-mono">bun install --frozen-lockfile</code>. When bun&apos;s version mismatches, the build crashes.
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                We have deleted <code className="text-white font-mono">bun.lock</code>, added it to <code className="text-white font-mono">.gitignore</code>, and explicitly locked <code className="text-amber-300 font-mono">&quot;packageManager&quot;: &quot;npm@10.8.2&quot;</code> in <code className="text-white font-mono">package.json</code>.
              </p>
            </div>
          </div>

          {/* Quick Terminal Fix */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                Push Fix to GitHub (supboiii552/Surf):
              </h3>
              <button
                onClick={() => copyToClipboard(bunFixCommands, setCopiedFixCommands)}
                className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"
              >
                {copiedFixCommands ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFixCommands ? 'Copied!' : 'Copy Commands'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre">
              {bunFixCommands}
            </pre>
          </div>

          {/* 3 Step Setup Guide */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold">
              Cloudflare Pages Build Settings:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">Framework preset</span>
                  <span className="text-xs font-mono font-bold text-white">Vite</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">Build command</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">npm run build</span>
                </div>
                <button
                  onClick={() => copyToClipboard('npm run build', setCopiedBuildCommand)}
                  className="text-slate-400 hover:text-white"
                >
                  {copiedBuildCommand ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">Output directory</span>
                  <span className="text-xs font-mono font-bold text-cyan-400">dist</span>
                </div>
                <button
                  onClick={() => copyToClipboard('dist', setCopiedOutputDir)}
                  className="text-slate-400 hover:text-white"
                >
                  {copiedOutputDir ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">Environment Variable</span>
                  <span className="text-xs font-mono font-bold text-amber-300">NODE_VERSION = 20</span>
                </div>
              </div>
            </div>
          </div>

          {/* Included files note */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Pre-configured with <code className="text-white font-mono">public/_redirects</code> and <code className="text-white font-mono">public/_headers</code> for instant SPA routing and caching.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 mt-4 flex justify-between items-center">
          <a
            href="https://dash.cloudflare.com/?to=/:account/pages/new"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 transition-colors font-medium"
          >
            <span>Open Cloudflare Pages Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
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
