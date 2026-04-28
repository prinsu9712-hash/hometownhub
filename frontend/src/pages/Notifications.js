import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import API, { getApiErrorMessage } from "../api";
import Layout from "../components/Layout";
import HeroBanner from "../components/HeroBanner";
import {
  BellIcon,
  CalendarIcon,
  CheckCircleIcon,
  FlagIcon,
  PulseIcon,
  SparkIcon,
  UserIcon
} from "../components/Icons";

const getNotificationMeta = (item) => {
  const normalized = String(item?.type || "").toUpperCase();

  if (normalized.includes("EVENT")) {
    return { Icon: CalendarIcon, color: "#22c55e", badge: "Events" };
  }

  if (normalized.includes("REPORT")) {
    return { Icon: FlagIcon, color: "#ef4444", badge: "Reports" };
  }

  if (normalized.includes("ONBOARD")) {
    return { Icon: CheckCircleIcon, color: "#c8782a", badge: "Onboarding" };
  }

  if (normalized.includes("MEMBER") || normalized.includes("COMMUNITY")) {
    return { Icon: UserIcon, color: "#ef9f27", badge: "Community" };
  }

  return { Icon: BellIcon, color: "#3b82f6", badge: "System" };
};

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [filter, setFilter] = useState("all");

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);

    try {
      setLoadError("");
      const { data } = await API.get("/notifications");
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      setNotifications([]);
      setLoadError(getApiErrorMessage(error, "Failed to load notifications."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    const intervalId = setInterval(fetchNotifications, 30000);
    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id ? { ...notification, isRead: true } : notification
        )
      );
    } catch (error) {
      setLoadError(getApiErrorMessage(error, "Failed to mark notification as read."));
    }
  };

  const markAllAsRead = async () => {
    setIsMarkingAll(true);

    try {
      await API.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch (error) {
      setLoadError(getApiErrorMessage(error, "Failed to mark all notifications as read."));
    } finally {
      setIsMarkingAll(false);
    }
  };

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );
  const filteredNotifications = useMemo(
    () => (filter === "unread" ? notifications.filter((item) => !item.isRead) : notifications),
    [filter, notifications]
  );

  return (
    <Layout>
      <section className="aurora-shell p-8 sm:p-10">
        <HeroBanner
          tag="Inbox"
          title="Notification Center"
          sub="Track announcements, event alerts, and moderation updates across all your communities."
          chips={["Realtime updates", "Moderation alerts", "Community activity"]}
        />

        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-kicker">Alerts</p>
            <h2 className="section-title">Notifications</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="metric-pill">
              <PulseIcon className="h-4 w-4 text-emerald-600" />
              Unread
              <span className="metric-value">{unreadCount}</span>
            </span>
            <button
              type="button"
              className="primary-btn"
              onClick={markAllAsRead}
              disabled={unreadCount === 0 || isMarkingAll}
            >
              {isMarkingAll ? "Updating..." : "Mark all as read"}
            </button>
          </div>
        </div>

        {loadError && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {loadError}
          </div>
        )}

        {isLoading && (
          <div className="mb-4 rounded-xl border border-stone-200 bg-white/70 px-4 py-3 text-sm text-stone-600">
            Loading notifications...
          </div>
        )}

        <div className="mb-5 flex gap-2">
          {["all", "unread"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`nav-pill ${filter === tab ? "nav-pill-active" : ""}`}
            >
              {tab === "all" ? <SparkIcon className="h-4 w-4" /> : <BellIcon className="h-4 w-4" />}
              {tab === "all" ? "All" : "Unread"}
              {tab === "unread" && unreadCount > 0 && (
                <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {notifications.length === 0 && !isLoading && (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/80 p-8 text-center text-stone-600">
            No notifications yet.
          </div>
        )}

        {notifications.length > 0 && filteredNotifications.length === 0 && !isLoading && (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/80 p-8 text-center text-stone-600">
            No unread notifications right now.
          </div>
        )}

        <div className="glass-panel p-2 sm:p-3">
          {filteredNotifications.map((item, idx) => {
            const { Icon, color, badge } = getNotificationMeta(item);
            return (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.03 }}
              className={`notification-item ${item.isRead ? "" : "notification-item-unread"}`}
            >
              <div
                className="icon-circle"
                style={{
                  width: "42px",
                  height: "42px",
                  background: `${color}20`,
                  color
                }}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">
                    {badge}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500">
                      {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
                    </span>
                    {!item.isRead && <span className="h-1.5 w-1.5 rounded-full bg-brand" />}
                  </div>
                </div>
                <p className="mt-2 text-sm text-stone-700">{item.message}</p>
                {!item.isRead && (
                  <button onClick={() => markAsRead(item._id)} className="muted-btn mt-3" type="button">
                    Mark as Read
                  </button>
                )}
              </div>
            </motion.div>
            );
          })}
        </div>
      </section>
    </Layout>
  );
}

export default Notifications;
