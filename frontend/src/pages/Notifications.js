import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import API, { getApiErrorMessage } from "../api";
import Layout from "../components/Layout";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

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

  return (
    <Layout>
      <section className="hero-glass p-8 sm:p-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-kicker">Alerts</p>
            <h2 className="section-title">Notifications</h2>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-stone-600">{unreadCount} unread</p>
            <button
              type="button"
              className="muted-btn"
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

        {notifications.length === 0 && !isLoading && (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/80 p-8 text-center text-stone-600">
            No notifications yet.
          </div>
        )}

        <div className="space-y-4">
          {notifications.map((item, idx) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.03 }}
              className={`rounded-2xl border p-5 ${
                item.isRead ? "border-stone-200 bg-white/70" : "border-brand/30 bg-brand/5"
              }`}
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                  {item.type || "SYSTEM"}
                </span>
                <span className="text-xs text-stone-500">
                  {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
                </span>
              </div>
              <p className="text-stone-800">{item.message}</p>
              {!item.isRead && (
                <button onClick={() => markAsRead(item._id)} className="muted-btn mt-4" type="button">
                  Mark as Read
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </section>
    </Layout>
  );
}

export default Notifications;
