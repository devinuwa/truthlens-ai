import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";
import { checkUnreachable } from "@/lib/pwa/offline-copy";

describe("installable app", () => {
  it("publishes a standalone manifest with separate any and maskable icons", () => {
    const web = manifest();
    expect(web.display).toBe("standalone");
    expect(web.start_url).toBe("/");
    expect(web.icons?.some((icon) => icon.purpose === "any" && icon.sizes === "192x192")).toBe(true);
    expect(web.icons?.some((icon) => icon.purpose === "maskable" && icon.sizes === "512x512")).toBe(true);
    expect(web.icons?.find((icon) => icon.purpose === "maskable")?.src).not.toBe(
      web.icons?.find((icon) => icon.purpose === "any")?.src,
    );
  });

  it("keeps checks and sign-in off the offline cache and falls back to the offline page", () => {
    const worker = readFileSync(join(process.cwd(), "public/sw.js"), "utf8");
    expect(worker).toContain('pathname.startsWith("/api/")');
    expect(worker).toContain('pathname.startsWith("/auth/")');
    expect(worker).toContain('request.method !== "GET"');
    expect(worker).toContain('shell.match("/offline")');
    expect(worker).toContain('"/academy"');
    expect(worker).toContain('"/academy/what-cybersecurity-means"');
    expect(worker).toContain("caches.delete");
    expect(worker).not.toContain("location.reload");
  });

  it("says a failed check needs a connection when the device is offline", () => {
    const previous = globalThis.navigator;
    Object.defineProperty(globalThis, "navigator", { value: { onLine: false }, configurable: true });
    expect(checkUnreachable("Your message is still in the box.")).toContain("You are offline");
    Object.defineProperty(globalThis, "navigator", { value: { onLine: true }, configurable: true });
    expect(checkUnreachable("Your message is still in the box.")).toContain("could not reach the server");
    Object.defineProperty(globalThis, "navigator", { value: previous, configurable: true });
  });
});
