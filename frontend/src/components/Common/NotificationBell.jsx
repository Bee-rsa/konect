import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { FaBell } from "react-icons/fa";
import {
  HiOutlineXMark,
  HiOutlineChevronLeft,
  HiOutlineChatBubbleLeftRight,
} from "react-icons/hi2";

const CATEGORY_ORDER = [
  "Cargo Konect Updates",
  "Vessel Berthing Updates",
  "Latest Case Study Updates",
  "Notifications",
];

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  const API_BASE_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const token = localStorage.getItem("userToken") || "";

  const safeNotifications = useMemo(
    () => (Array.isArray(notifications) ? notifications : []),
    [notifications]
  );

  const groupedNotifications = useMemo(() => {
    const groups = {};

    safeNotifications.forEach((item) => {
      const category = item?.category || "Notifications";
      if (!groups[category]) groups[category] = [];
      groups[category].push(item);
    });

    const orderedEntries = CATEGORY_ORDER.map((category) => ({
      category,
      items: groups[category] || [],
    })).filter((group) => group.items.length > 0);

    const extraEntries = Object.keys(groups)
      .filter((category) => !CATEGORY_ORDER.includes(category))
      .map((category) => ({
        category,
        items: groups[category],
      }));

    return [...orderedEntries, ...extraEntries];
  }, [safeNotifications]);

  const newMessageCategories = useMemo(() => {
    return groupedNotifications.filter(({ items }) =>
      items.some((item) => !item?.isRead)
    );
  }, [groupedNotifications]);

  const allMessageCategories = useMemo(() => {
    return groupedNotifications.filter(({ items }) =>
      items.every((item) => item?.isRead)
    );
  }, [groupedNotifications]);

  const newMessagesTotal = useMemo(() => {
    return safeNotifications.filter((item) => !item?.isRead).length;
  }, [safeNotifications]);

  const activeCategoryItems = useMemo(() => {
    if (!activeCategory) return [];

    return safeNotifications
      .filter((item) => (item?.category || "Notifications") === activeCategory)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [safeNotifications, activeCategory]);

  const fetchNotifications = useCallback(async () => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.get(`${API_BASE_URL}/api/notifications`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const nextNotifications = Array.isArray(data) ? data : [];
      setNotifications(nextNotifications);
      setUnreadCount(nextNotifications.filter((item) => !item?.isRead).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  const markCategoryAsRead = async (category) => {
    const unreadItems = safeNotifications.filter(
      (item) =>
        (item?.category || "Notifications") === category &&
        !item?.isRead &&
        item?._id
    );

    if (!unreadItems.length) return;

    try {
      await Promise.all(
        unreadItems.map((item) =>
          axios.put(
            `${API_BASE_URL}/api/notifications/${item._id}/read`,
            {},
            {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
        )
      );

      setNotifications((prev) =>
        prev.map((item) =>
          (item?.category || "Notifications") === category
            ? { ...item, isRead: true }
            : item
        )
      );

      setUnreadCount((prev) => Math.max(prev - unreadItems.length, 0));
    } catch (error) {
      console.error("Failed to mark category notifications as read:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (activeCategory) {
          setActiveCategory(null);
        } else {
          setOpen(false);
        }
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, activeCategory]);

  useEffect(() => {
    if (!open) {
      setActiveCategory(null);
    }
  }, [open]);

  const handleOpenCategory = async (category) => {
    setActiveCategory(category);

    const hasUnreadInCategory = safeNotifications.some(
      (item) =>
        (item?.category || "Notifications") === category && !item?.isRead
    );

    if (hasUnreadInCategory) {
      await markCategoryAsRead(category);
    }
  };

  const formatDateLabel = (dateValue) => {
    if (!dateValue) return "";

    const inputDate = new Date(dateValue);
    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(
      inputDate.getFullYear(),
      inputDate.getMonth(),
      inputDate.getDate()
    );

    const diffMs = today - target;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays === 2) return "The day before";

    return inputDate.toLocaleDateString(undefined, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTimeLabel = (dateValue) => {
    if (!dateValue) return "";
    return new Date(dateValue).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getLastMessagePreview = (items) => {
    const lastItem = [...items].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )[0];

    return lastItem?.message || "No messages yet.";
  };

  const renderCategorySection = (title, categories, totalBadge = null) => {
    if (!categories.length) return null;

    return (
      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            {title}
          </h4>

          {typeof totalBadge === "number" && totalBadge > 0 ? (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
              {totalBadge}
            </span>
          ) : null}
        </div>

        <div className="space-y-3">
          {categories.map(({ category, items }) => (
            <button
              key={category}
              type="button"
              onClick={() => handleOpenCategory(category)}
              className="flex w-full items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
            >
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <HiOutlineChatBubbleLeftRight className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="truncate text-sm font-semibold text-slate-900">
                  {category}
                </h4>

                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                  {getLastMessagePreview(items)}
                </p>

                <p className="mt-2 text-[11px] text-slate-400">
                  {items.length} message{items.length === 1 ? "" : "s"}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderInboxList = () => {
    if (loading) {
      return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          Loading notifications...
        </div>
      );
    }

    if (!groupedNotifications.length) {
      return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
          <p className="text-sm font-medium text-slate-700">
            No notifications yet
          </p>
          <p className="mt-1 text-xs text-slate-500">
            New updates will appear here when available.
          </p>
        </div>
      );
    }

    return (
      <>
        <h3 className="text-sm font-semibold text-slate-900">Inbox</h3>
        {renderCategorySection("New messages", newMessageCategories, newMessagesTotal)}
        {renderCategorySection("All messages", allMessageCategories)}
      </>
    );
  };

  const renderCategoryChat = () => {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className="inline-flex items-center gap-2 rounded-xl px-2 py-1 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <HiOutlineChevronLeft className="h-4 w-4" />
              {activeCategory}
            </button>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="shrink-0 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close notifications"
            >
              <HiOutlineXMark className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-4">
          <div className="space-y-5">
            {activeCategoryItems.map((item) => (
              <div
                key={item?._id || `${item?.title}-${item?.createdAt}`}
                className="flex flex-col"
              >
                <p className="mb-2 text-center text-[11px] font-medium text-slate-400">
                  {formatDateLabel(item?.createdAt)}
                </p>

                <div className="max-w-[75%] self-start overflow-hidden rounded-[1.4rem] rounded-tl-md bg-blue-50 px-4 py-3 shadow-sm">
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-semibold text-slate-900">
                      {item?.title || "Notification"}
                    </h4>

                    <p className="mt-1 break-words text-xs leading-6 text-slate-700">
                      {item?.message || "No message available."}
                    </p>
                  </div>

                  {item?.image ? (
                    <img
                      src={item.image}
                      alt={item?.title || "Notification image"}
                      className="mt-3 h-36 w-full rounded-xl object-cover"
                    />
                  ) : null}
                </div>

                <p className="mt-2 pl-2 text-[11px] text-slate-400">
                  {formatTimeLabel(item?.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={async () => {
            setOpen(true);
            await fetchNotifications();
          }}
          className="relative rounded-full p-2 text-white transition hover:bg-white/10"
          aria-label="Open notifications"
        >
          <FaBell className="h-5 w-5" />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
              {unreadCount}
            </span>
          ) : null}
        </button>
      </div>

      <div
        className={`fixed inset-0 z-[100] transition ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-slate-950/25 transition-opacity duration-200 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          className={`hidden md:flex absolute right-0 top-0 h-full w-[430px] max-w-[92vw] flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-200 will-change-transform ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {!activeCategory ? (
            <>
              <div className="border-b border-slate-200 px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Message Centre
                  </h3>

                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="shrink-0 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Close notifications"
                  >
                    <HiOutlineXMark className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                {renderInboxList()}
              </div>
            </>
          ) : (
            renderCategoryChat()
          )}
        </div>

        <div
          className={`absolute right-4 top-16 z-[110] w-[92vw] max-w-sm rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all duration-200 md:hidden ${
            open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
          }`}
        >
          {!activeCategory ? (
            <div className="p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  Message Centre
                </h3>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="shrink-0 rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100"
                  aria-label="Close notifications"
                >
                  <HiOutlineXMark className="h-5 w-5" />
                </button>
              </div>

              <div className="max-h-[420px] overflow-y-auto">
                {renderInboxList()}
              </div>
            </div>
          ) : (
            <div className="flex max-h-[75vh] flex-col">
              <div className="border-b border-slate-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveCategory(null)}
                    className="inline-flex items-center gap-2 rounded-xl px-2 py-1 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    <HiOutlineChevronLeft className="h-4 w-4" />
                    {activeCategory}
                  </button>

                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="shrink-0 rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100"
                    aria-label="Close notifications"
                  >
                    <HiOutlineXMark className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto bg-slate-50 p-3">
                <div className="space-y-5">
                  {activeCategoryItems.map((item) => (
                    <div
                      key={item?._id || `${item?.title}-${item?.createdAt}`}
                      className="flex flex-col"
                    >
                      <p className="mb-2 text-center text-[11px] font-medium text-slate-400">
                        {formatDateLabel(item?.createdAt)}
                      </p>

                      <div className="max-w-[75%] self-start overflow-hidden rounded-[1.4rem] rounded-tl-md bg-blue-50 px-4 py-3 shadow-sm">
                        <h4 className="truncate text-sm font-semibold text-slate-900">
                          {item?.title || "Notification"}
                        </h4>

                        <p className="mt-1 break-words text-xs leading-6 text-slate-700">
                          {item?.message || "No message available."}
                        </p>

                        {item?.image ? (
                          <img
                            src={item.image}
                            alt={item?.title || "Notification image"}
                            className="mt-3 h-32 w-full rounded-xl object-cover"
                          />
                        ) : null}
                      </div>

                      <p className="mt-2 pl-2 text-[11px] text-slate-400">
                        {formatTimeLabel(item?.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationBell;