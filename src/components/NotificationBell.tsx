"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatDateTime } from "@/lib/orders";
import type { NotificationKind } from "@/lib/notifications";

type CustomerNotification = {
  id: string;
  orderId: string;
  kind: NotificationKind;
  text: string;
  read: boolean;
  createdAt: string;
};

export function NotificationBell({ unreadNotifications }: { unreadNotifications: number }) {
  const [unreadCount, setUnreadCount] = useState(unreadNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUnreadCount(unreadNotifications);
  }, [unreadNotifications]);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    setIsLoading(true);
    fetch("/api/notifications")
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load notifications");
        return (await response.json()) as {
          notifications: CustomerNotification[];
        };
      })
      .then(async ({ notifications: latestNotifications }) => {
        if (!active) return;
        setNotifications(latestNotifications);
        const response = await fetch("/api/notifications/read", { method: "POST" });
        if (!response.ok) throw new Error("Could not mark notifications as read");
        if (active) {
          setNotifications(
            latestNotifications.map((notification) => ({ ...notification, read: true })),
          );
          setUnreadCount(0);
        }
      })
      .catch((error: unknown) => {
        console.error("Could not load notifications", error);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen]);

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="relative rounded-full border-2 border-ink bg-white p-1.5 text-ink shadow-pop-sm transition hover:bg-butter"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-4 rounded-full border border-ink bg-berry px-1 text-center text-[10px] font-bold leading-4 text-ink">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="card absolute right-0 top-full z-30 mt-3 w-80 max-w-[calc(100vw-2rem)] overflow-hidden">
          <h2 className="border-b-2 border-ink/15 bg-lavender/30 px-4 py-3 font-display text-sm font-bold text-ink">
            Notifications
          </h2>
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <p className="p-4 text-sm text-muted">Loading…</p>
            ) : notifications.length === 0 ? (
              <p className="p-4 text-sm text-muted">No notifications yet</p>
            ) : (
              notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={`/orders/${notification.orderId}`}
                  onClick={() => setIsOpen(false)}
                  className={`block border-b border-ink/10 px-4 py-3 transition hover:bg-butter/60 ${
                    notification.read ? "" : "bg-butter/40"
                  }`}
                >
                  <p className="text-sm text-ink">{notification.text}</p>
                  <time
                    dateTime={notification.createdAt}
                    className="mt-1 block text-xs text-muted"
                  >
                    {formatDateTime(new Date(notification.createdAt))}
                  </time>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
