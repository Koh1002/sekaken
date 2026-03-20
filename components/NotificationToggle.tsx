"use client";

import { useState, useEffect } from "react";
import {
  isNotificationSupported,
  getNotificationEnabled,
  enableNotifications,
  disableNotifications,
  registerServiceWorker,
} from "@/lib/notifications";

export function NotificationToggle() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSupported(isNotificationSupported());
    const isEnabled = getNotificationEnabled();
    setEnabled(isEnabled);
    // Auto-register SW if notifications were previously enabled
    if (isEnabled) {
      registerServiceWorker();
    }
  }, []);

  if (!supported) return null;

  const toggle = async () => {
    setLoading(true);
    if (enabled) {
      await disableNotifications();
      setEnabled(false);
    } else {
      const success = await enableNotifications();
      setEnabled(success);
      if (!success) {
        alert("通知の許可が必要です。ブラウザの設定から通知を許可してください。");
      }
    }
    setLoading(false);
  };

  return (
    <div className="card p-4 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h3 className="font-semibold text-sm">学習リマインダー</h3>
        <p className="text-xs text-[var(--muted)] mt-0.5">
          毎朝8:30と夕方18:00に通知
        </p>
      </div>
      <button
        onClick={toggle}
        disabled={loading}
        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 ${
          enabled
            ? "bg-[var(--success)] text-white"
            : "btn-secondary"
        }`}
      >
        {loading ? "..." : enabled ? "ON" : "OFF"}
      </button>
    </div>
  );
}
