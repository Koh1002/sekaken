const NOTIFICATION_KEY = "sekaken-notifications-enabled";

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator;
}

export function getNotificationEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(NOTIFICATION_KEY) === "true";
}

export function setNotificationEnabled(enabled: boolean): void {
  localStorage.setItem(NOTIFICATION_KEY, enabled ? "true" : "false");
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  const permission = await Notification.requestPermission();
  return permission === "granted";
}

export async function registerServiceWorker(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    // Tell SW to start checking reminders
    if (registration.active) {
      registration.active.postMessage({ type: "START_REMINDERS" });
    }
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "activated") {
            newWorker.postMessage({ type: "START_REMINDERS" });
          }
        });
      }
    });
  } catch (err) {
    console.error("SW registration failed:", err);
  }
}

export async function enableNotifications(): Promise<boolean> {
  const granted = await requestNotificationPermission();
  if (granted) {
    setNotificationEnabled(true);
    await registerServiceWorker();
    return true;
  }
  return false;
}

export async function disableNotifications(): Promise<void> {
  setNotificationEnabled(false);
  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.getRegistration("/sw.js");
    if (registration) {
      await registration.unregister();
    }
  }
}
