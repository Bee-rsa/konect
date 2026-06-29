import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const getDeviceType = () => {
  const ua = navigator.userAgent.toLowerCase();

  if (/tablet|ipad/.test(ua)) return "tablet";
  if (/mobi|android|iphone/.test(ua)) return "mobile";
  return "desktop";
};

export const getSessionId = () => {
  let sessionId = sessionStorage.getItem("analyticsSessionId");

  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 11)}`;
    sessionStorage.setItem("analyticsSessionId", sessionId);
  }

  return sessionId;
};

export const trackAnalyticsEvent = async (payload) => {
  try {
    await axios.post(
      `${API_BASE_URL}/api/analytics/track`,
      {
        ...payload,
        sessionId: getSessionId(),
        deviceType: getDeviceType(),
      },
      {
        timeout: 3000, // 🔥 prevents hanging requests
      }
    );
  } catch (error) {
    // 🔥 Do NOT spam console heavily in production
    if (import.meta.env.DEV) {
      console.error("trackAnalyticsEvent error:", error.message);
    }
  }
};