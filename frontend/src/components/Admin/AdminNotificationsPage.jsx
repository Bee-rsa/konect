import { useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

const NOTIFICATION_CATEGORIES = [
  "Cargo Konect Updates",
  "Vessel Berthing Updates",
  "Latest Case Study Updates",
  "Notifications",
];

const AdminNotificationsPage = () => {
  const [category, setCategory] = useState("Notifications");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState("");
  const [imageFileName, setImageFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);

  const { user } = useSelector((state) => state.auth);

  const API_BASE_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const token = localStorage.getItem("userToken") || "";

  const handleUploadImage = async (file) => {
    if (!file) return;

    if (!token) {
      alert("You are not authenticated. Please sign in again.");
      return;
    }

    try {
      setUploading(true);
      setImageFileName(file.name);

      const formData = new FormData();
      formData.append("image", file);

      const { data } = await axios.post(
        `${API_BASE_URL}/api/upload`,
        formData,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setImage(data.imageUrl || "");
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Failed to upload image");
      setImage("");
      setImageFileName("");
    } finally {
      setUploading(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) {
      alert("Please enter a message.");
      return;
    }

    if (!token) {
      alert("You are not authenticated. Please sign in again.");
      return;
    }

    try {
      setSending(true);

      await axios.post(
        `${API_BASE_URL}/api/notifications`,
        {
          category,
          title: title.trim() || category,
          message: message.trim(),
          image,
        },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Notification sent successfully.");
      setCategory("Notifications");
      setTitle("");
      setMessage("");
      setImage("");
      setImageFileName("");
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Failed to send notification.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-custom-blue">
          Admin
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          Send Notification
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Send a categorized message to all users.
        </p>

        <div className="mt-1 text-xs text-slate-500">
          Signed in as: {user?.name || user?.email || "Admin"}
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-custom-blue"
            >
              {NOTIFICATION_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Optional title"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-custom-blue"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              Message
            </label>
            <textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your notification here..."
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-custom-blue"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleUploadImage(e.target.files?.[0])}
              className="block w-full text-sm"
            />
            <p className="mt-2 text-xs text-slate-500">
              {uploading
                ? "Uploading image..."
                : imageFileName
                ? `Uploaded: ${imageFileName}`
                : "Optional image for the notification"}
            </p>

            {image ? (
              <img
                src={image}
                alt="Notification preview"
                className="mt-3 h-32 w-full max-w-sm rounded-2xl border border-slate-200 object-cover"
              />
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleSend}
            disabled={sending || uploading}
            className="rounded-2xl bg-custom-blue px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send Notification"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationsPage;