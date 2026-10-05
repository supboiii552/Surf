/**
 * PWA Install & Offline Guide Modal
 * Handles beforeinstallprompt for Chromium and Add-to-Home-Screen instructions for iPad Safari.
 */

import React, { useState, useEffect } from 'react';
import { Download, Share2, PlusSquare, WifiOff, X, CheckCircle2 } from 'lucide-react';

interface PWAInstallModalProps {
  onClose: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalledSuccess, setIsInstalledSuccess] = useState(false);

  useEffect(() => {
    // Check if already running standalone
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const handlePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalledSuccess(true);
        setDeferredPrompt(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 pointer-events-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Offline PWA Installation</h2>
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
          {/* Offline benefit callout */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <WifiOff className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-300 text-sm mb-1">Play Anywhere, Even Offline</h3>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                Installing this app caches the entire 3D surf simulator on your device. Once installed, it runs locally with zero internet requests, completely bypassing school Wi-Fi firewall blocks!
              </p>
            </div>
          </div>

          {/* Already standalone */}
          {isStandalone && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>You are already running in standalone offline mode!</span>
            </div>
          )}

          {/* iOS Safari Guide (iPad / iPhone) */}
          {isIOS && !isStandalone && (
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                How to Install on iPad Safari:
              </h3>
              <ol className="text-xs text-slate-300 space-y-2.5 list-none">
                <li className="flex items-center gap-3 p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </span>
                  <span>Tap the <strong className="text-blue-400">Share</strong> button <Share2 className="w-3.5 h-3.5 inline mx-1 text-blue-400" /> in the top right of Safari.</span>
                </li>
                <li className="flex items-center gap-3 p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </span>
                  <span>Scroll down and select <strong className="text-white">Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-white" />.</span>
                </li>
                <li className="flex items-center gap-3 p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </span>
                  <span>Tap <strong className="text-white">Add</strong>. Open the app from your iPad home screen to play in fullscreen with offline speed.</span>
                </li>
              </ol>
            </div>
          )}

          {/* Chromium 1-Click Install */}
          {!isIOS && !isStandalone && (
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-center space-y-3">
              <p className="text-xs text-slate-400">
                Install as a standalone desktop or Android application.
              </p>
              {deferredPrompt ? (
                <button
                  onClick={handleInstallClick}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Install to Device</span>
                </button>
              ) : (
                <p className="text-xs text-slate-500">
                  Tip: Look for the install icon <Download className="w-3.5 h-3.5 inline text-amber-400" /> in your browser address bar.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
