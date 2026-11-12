"use client";

import { useEffect, useState } from "react";

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const IOS_HINT_KEY = "truthlens-ios-install-hint";

function openCachedPage(event: MouseEvent) {
  if (navigator.onLine) return;
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const anchor = (event.target as HTMLElement | null)?.closest("a");
  if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#")) return;
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return;
  event.preventDefault();
  window.location.assign(url.href);
}

export function PwaRuntime() {
  const [installEvent, setInstallEvent] = useState<InstallPrompt | null>(null);
  const [offline, setOffline] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);
  const [iosHint, setIosHint] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const onOffline = () => setOffline(true);
    const onOnline = () => setOffline(false);
    setOffline(navigator.onLine === false);
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    document.addEventListener("click", openCachedPage);

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPrompt);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    const browser = navigator as Navigator & { standalone?: boolean };
    const standalone = window.matchMedia("(display-mode: standalone)").matches || browser.standalone === true;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (ios && !standalone && sessionStorage.getItem(IOS_HINT_KEY) !== "hidden") setIosHint(true);

    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((next) => {
          setRegistration(next);
          if (next.waiting && navigator.serviceWorker.controller) setUpdateReady(true);
          next.addEventListener("updatefound", () => {
            const worker = next.installing;
            worker?.addEventListener("statechange", () => {
              if (worker.state === "installed" && navigator.serviceWorker.controller) setUpdateReady(true);
            });
          });
        })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
      document.removeEventListener("click", openCachedPage);
      window.removeEventListener("beforeinstallprompt", onPrompt);
    };
  }, []);

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  }

  function reload() {
    const waiting = registration?.waiting;
    if (!waiting) {
      window.location.reload();
      return;
    }
    const onChange = () => window.location.reload();
    navigator.serviceWorker.addEventListener("controllerchange", onChange, { once: true });
    waiting.postMessage({ type: "SKIP_WAITING" });
  }

  if (!offline && !installEvent && !updateReady && !iosHint) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4">
      <div className="flex w-full max-w-xl flex-col gap-3 rounded-[28px] bg-white p-4 shadow-[0_18px_50px_-32px_rgba(80,40,120,0.55)]">
        {offline ? (
          <p className="text-sm leading-6">You are offline. Pages you already opened can still be read. A new check needs a connection.</p>
        ) : null}
        {updateReady ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm leading-6">A new version is ready.</p>
            <button type="button" onClick={reload} className="min-h-11 rounded-full bg-ink px-4 text-sm font-bold text-white">
              Reload
            </button>
          </div>
        ) : null}
        {installEvent ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm leading-6">Install TruthLens on this device. Pages you open can be read again without a connection.</p>
            <button type="button" onClick={() => void install()} className="min-h-11 rounded-full bg-ink px-4 text-sm font-bold text-white">
              Install
            </button>
          </div>
        ) : null}
        {iosHint ? (
          <div className="flex flex-wrap items-start justify-between gap-3">
            <p className="text-sm leading-6">On iPhone, use Share, then Add to Home Screen. Pages you open can be read again without a connection.</p>
            <button
              type="button"
              className="min-h-11 rounded-full bg-lilac px-4 text-sm font-bold text-primary"
              onClick={() => {
                sessionStorage.setItem(IOS_HINT_KEY, "hidden");
                setIosHint(false);
              }}
            >
              Hide
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
