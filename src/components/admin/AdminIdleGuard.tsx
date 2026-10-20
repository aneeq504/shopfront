"use client";

import { useEffect } from "react";

const ACTIVITY_KEY = "shopfront:adminLastActivity";
const HEARTBEAT_KEY = "shopfront:adminLastHeartbeat";
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const ACTIVITY_WRITE_INTERVAL_MS = 5 * 1000;
const HEARTBEAT_INTERVAL_MS = 30 * 1000;

export function AdminIdleGuard() {
  useEffect(() => {
    let memoryLastActivity = Date.now();
    let memoryLastHeartbeat = 0;
    let lastActivityWrite = Number.NEGATIVE_INFINITY;
    let expiring = false;

    const readTimestamp = (key: string, fallback: number) => {
      try {
        const value = window.localStorage.getItem(key);
        if (value === null || value.trim() === "") return fallback;
        const timestamp = Number(value);
        return Number.isFinite(timestamp) ? timestamp : fallback;
      } catch {
        return fallback;
      }
    };

    const writeTimestamp = (key: string, timestamp: number) => {
      try {
        window.localStorage.setItem(key, String(timestamp));
      } catch {
        return;
      }
    };

    const expire = async () => {
      if (expiring) return;
      expiring = true;
      await fetch("/api/admin/session", { method: "DELETE" }).catch(() => {});
      if (window.location.pathname.startsWith("/admin")) {
        window.location.replace("/admin/login");
      } else {
        window.location.reload();
      }
    };

    const checkIdle = () => {
      const lastActivity = readTimestamp(ACTIVITY_KEY, memoryLastActivity);
      if (Date.now() - lastActivity >= IDLE_TIMEOUT_MS) void expire();
    };

    const sendHeartbeatIfDue = async (now: number) => {
      const lastHeartbeat = readTimestamp(HEARTBEAT_KEY, memoryLastHeartbeat);
      if (now >= lastHeartbeat && now - lastHeartbeat < HEARTBEAT_INTERVAL_MS) return;

      memoryLastHeartbeat = now;
      writeTimestamp(HEARTBEAT_KEY, now);
      try {
        const response = await fetch("/api/admin/session", { method: "PUT" });
        if (response.status === 401) await expire();
      } catch {
        return;
      }
    };

    const recordActivity = () => {
      const now = Date.now();
      memoryLastActivity = now;
      if (now - lastActivityWrite >= ACTIVITY_WRITE_INTERVAL_MS) {
        lastActivityWrite = now;
        writeTimestamp(ACTIVITY_KEY, now);
      }
      void sendHeartbeatIfDue(now);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") checkIdle();
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== ACTIVITY_KEY || !event.newValue) return;
      const timestamp = Number(event.newValue);
      if (Number.isFinite(timestamp) && Date.now() - timestamp < IDLE_TIMEOUT_MS) {
        checkIdle();
      }
    };

    const scrollOptions: AddEventListenerOptions = { passive: true, capture: true };
    const passiveOptions: AddEventListenerOptions = { passive: true };
    window.addEventListener("mousemove", recordActivity);
    window.addEventListener("mousedown", recordActivity);
    window.addEventListener("keydown", recordActivity);
    window.addEventListener("scroll", recordActivity, scrollOptions);
    window.addEventListener("touchstart", recordActivity, passiveOptions);
    window.addEventListener("wheel", recordActivity, passiveOptions);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("storage", onStorage);

    recordActivity();
    const idleInterval = window.setInterval(checkIdle, 15 * 1000);

    return () => {
      window.clearInterval(idleInterval);
      window.removeEventListener("mousemove", recordActivity);
      window.removeEventListener("mousedown", recordActivity);
      window.removeEventListener("keydown", recordActivity);
      window.removeEventListener("scroll", recordActivity, scrollOptions);
      window.removeEventListener("touchstart", recordActivity, passiveOptions);
      window.removeEventListener("wheel", recordActivity, passiveOptions);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return null;
}
