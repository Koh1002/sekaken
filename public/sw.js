// Service Worker for セカケン - 学習リマインダー通知

const REMINDER_TIMES = [
  { hour: 8, minute: 30, message: "おはようございます！世界遺産の学習を始めましょう" },
  { hour: 18, minute: 0, message: "お疲れさまです！今日の復習をしませんか？" },
];

let reminderInterval = null;

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
  startReminderCheck();
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "START_REMINDERS") {
    startReminderCheck();
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      if (clients.length > 0) {
        clients[0].focus();
      } else {
        self.clients.openWindow("/quiz");
      }
    })
  );
});

function startReminderCheck() {
  if (reminderInterval) clearInterval(reminderInterval);
  // Check every minute
  reminderInterval = setInterval(checkReminders, 60 * 1000);
  checkReminders();
}

const notifiedToday = {};

function checkReminders() {
  const now = new Date();
  const todayKey = now.toDateString();

  for (const reminder of REMINDER_TIMES) {
    const key = `${todayKey}-${reminder.hour}:${reminder.minute}`;
    if (notifiedToday[key]) continue;

    if (now.getHours() === reminder.hour && now.getMinutes() === reminder.minute) {
      notifiedToday[key] = true;
      self.registration.showNotification("セカケン - 学習リマインダー", {
        body: reminder.message,
        icon: "/icon-192.png",
        badge: "/favicon-32.png",
        tag: `reminder-${reminder.hour}`,
        renotify: true,
      });
    }
  }
}
