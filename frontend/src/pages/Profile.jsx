import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { logout } from "../redux/slices/authSlice";
import {
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlineBell,
  HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle,
  HiOutlineShieldCheck,
  HiOutlineTrash,
  HiOutlineMoon,
  HiOutlineGlobeAlt,
  HiOutlineClock,
  HiOutlineCheckCircle,
} from "react-icons/hi2";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const getSavedPreferences = () => {
  try {
    return JSON.parse(localStorage.getItem("profilePreferences")) || {};
  } catch {
    return {};
  }
};

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const savedPreferences = useMemo(() => getSavedPreferences(), []);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    emailUpdates: savedPreferences.emailUpdates ?? true,
    caseStudyAlerts: savedPreferences.caseStudyAlerts ?? true,
    terminalAlerts: savedPreferences.terminalAlerts ?? false,
    productNews: savedPreferences.productNews ?? false,
  });

  const [preferences, setPreferences] = useState({
    theme: savedPreferences.theme || "light",
    language: savedPreferences.language || "English",
    timezone: savedPreferences.timezone || "Africa/Johannesburg",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [preferencesMessage, setPreferencesMessage] = useState("");
  const [dangerMessage, setDangerMessage] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    setProfileForm({
      name: user?.name || "",
      email: user?.email || "",
    });
  }, [user, navigate]);

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const token = localStorage.getItem("userToken");

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileMessage("");
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordMessage("");
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotificationToggle = (key) => {
    setPreferencesMessage("");
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    setPreferencesMessage("");
    setPreferences((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage("");

    try {
      // Backend route to add on your side:
      // PATCH /api/users/profile
      await axios.patch(
        `${API_BASE_URL}/api/users/profile`,
        {
          name: profileForm.name,
          email: profileForm.email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedUser = {
        ...user,
        name: profileForm.name,
        email: profileForm.email,
      };

      localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      setProfileMessage("Profile updated successfully.");
      window.location.reload();
    } catch (error) {
      setProfileMessage(
        error.response?.data?.message ||
          "Could not save profile yet. Add the backend profile update route."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordMessage("");

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordMessage("Please complete all password fields.");
      setSavingPassword(false);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage("New password and confirm password do not match.");
      setSavingPassword(false);
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordMessage("New password must be at least 8 characters.");
      setSavingPassword(false);
      return;
    }

    try {
      // Backend route to add on your side:
      // PATCH /api/users/change-password
      await axios.patch(
        `${API_BASE_URL}/api/users/change-password`,
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setPasswordMessage("Password changed successfully.");
    } catch (error) {
      setPasswordMessage(
        error.response?.data?.message ||
          "Could not change password yet. Add the backend password route."
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSavingPreferences(true);
    setPreferencesMessage("");

    try {
      const combined = {
        ...notifications,
        ...preferences,
      };

      localStorage.setItem("profilePreferences", JSON.stringify(combined));

      // Optional backend route if you want persistence in DB:
      // PATCH /api/users/preferences
      try {
        await axios.patch(
          `${API_BASE_URL}/api/users/preferences`,
          combined,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch {
        // silently allow local fallback
      }

      setPreferencesMessage("Preferences saved successfully.");
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleDeactivateAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate your account?"
    );

    if (!confirmed) return;

    setDeletingAccount(true);
    setDangerMessage("");

    try {
      // Backend route to add:
      // PATCH /api/users/deactivate
      await axios.patch(
        `${API_BASE_URL}/api/users/deactivate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      dispatch(logout());
      navigate("/login");
    } catch (error) {
      setDangerMessage(
        error.response?.data?.message ||
          "Could not deactivate account yet. Add the backend deactivate route."
      );
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "This will permanently delete your account. Continue?"
    );

    if (!confirmed) return;

    setDeletingAccount(true);
    setDangerMessage("");

    try {
      // Backend route to add:
      // DELETE /api/users/profile
      await axios.delete(`${API_BASE_URL}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      dispatch(logout());
      navigate("/register");
    } catch (error) {
      setDangerMessage(
        error.response?.data?.message ||
          "Could not delete account yet. Add the backend delete route."
      );
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Account
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Profile Settings
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Manage your account details, security, notifications, and personal preferences.
          </p>
        </div>

<div className="grid gap-5 lg:grid-cols-12">
  <div className="lg:col-span-4">
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-custom-blue text-lg font-bold text-white">
          {initials}
        </div>

        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-slate-900">
            {user?.name || "User"}
          </h2>
          <p className="mt-1 truncate text-sm text-slate-500">
            {user?.email || "No email"}
          </p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
            {user?.role === "admin" ? "Administrator" : "Standard User"}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <HiOutlineShieldCheck className="h-4 w-4 text-custom-blue" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Terms
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {user?.hasAcceptedTerms ? "Accepted" : "Pending"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <HiOutlineClock className="h-4 w-4 text-custom-blue" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Welcome Flow
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {user?.hasSeenWelcome ? "Completed" : "Pending"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <HiOutlineCheckCircle className="h-4 w-4 text-custom-blue" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Session
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-slate-800">Active</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold text-slate-900">Logout</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          End your current session securely.
        </p>

        <button
          onClick={handleLogout}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
        >
          <HiOutlineArrowRightOnRectangle className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
          </div>

          {/* Right Settings Panels */}
          <div className="lg:col-span-8">
            <div className="grid gap-5 xl:grid-cols-2">
              {/* Editable Profile */}
              <form
                onSubmit={handleSaveProfile}
                className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-slate-100 p-2.5">
                    <HiOutlineUser className="h-5 w-5 text-slate-700" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      Editable Profile
                    </h3>
                    <p className="text-xs text-slate-500">
                      Update your account details.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Full Name
                    </label>
                    <input
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-custom-blue focus:bg-white"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Email Address
                    </label>
                    <div className="relative">
                      <HiOutlineEnvelope className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        name="email"
                        type="email"
                        value={profileForm.email}
                        onChange={handleProfileChange}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-custom-blue focus:bg-white"
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>
                </div>

                {profileMessage && (
                  <p className="mt-4 text-sm text-slate-600">{profileMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="mt-5 rounded-2xl bg-custom-blue px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                >
                  {savingProfile ? "Saving..." : "Save Profile"}
                </button>
              </form>

              {/* Change Password */}
              <form
                onSubmit={handleChangePassword}
                className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-slate-100 p-2.5">
                    <HiOutlineShieldCheck className="h-5 w-5 text-slate-700" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      Change Password
                    </h3>
                    <p className="text-xs text-slate-500">
                      Keep your account secure.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-custom-blue focus:bg-white"
                    placeholder="Current password"
                  />
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-custom-blue focus:bg-white"
                    placeholder="New password"
                  />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-custom-blue focus:bg-white"
                    placeholder="Confirm new password"
                  />
                </div>

                {passwordMessage && (
                  <p className="mt-4 text-sm text-slate-600">{passwordMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={savingPassword}
                  className="mt-5 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {savingPassword ? "Updating..." : "Update Password"}
                </button>
              </form>

              {/* Notification Settings */}
              <form
                onSubmit={handleSavePreferences}
                className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm xl:col-span-1"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-slate-100 p-2.5">
                    <HiOutlineBell className="h-5 w-5 text-slate-700" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      Notification Settings
                    </h3>
                    <p className="text-xs text-slate-500">
                      Control what you receive.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    { key: "emailUpdates", label: "Email updates" },
                    { key: "caseStudyAlerts", label: "Case study alerts" },
                    { key: "terminalAlerts", label: "Terminal alerts" },
                    { key: "productNews", label: "Platform news" },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <span className="text-sm font-medium text-slate-800">
                        {item.label}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleNotificationToggle(item.key)}
                        className={`relative h-6 w-11 rounded-full transition ${
                          notifications[item.key] ? "bg-custom-blue" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                            notifications[item.key] ? "left-5" : "left-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                {preferencesMessage && (
                  <p className="mt-4 text-sm text-slate-600">{preferencesMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={savingPreferences}
                  className="mt-5 rounded-2xl bg-custom-blue px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                >
                  {savingPreferences ? "Saving..." : "Save Notifications"}
                </button>
              </form>

              {/* User Preferences */}
              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm xl:col-span-1">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-slate-100 p-2.5">
                    <HiOutlineCog6Tooth className="h-5 w-5 text-slate-700" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      User Preferences
                    </h3>
                    <p className="text-xs text-slate-500">
                      Theme, language, and timezone.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <HiOutlineMoon className="h-4 w-4" />
                      Theme
                    </label>
                    <select
                      name="theme"
                      value={preferences.theme}
                      onChange={handlePreferenceChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-custom-blue focus:bg-white"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <HiOutlineGlobeAlt className="h-4 w-4" />
                      Language
                    </label>
                    <select
                      name="language"
                      value={preferences.language}
                      onChange={handlePreferenceChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-custom-blue focus:bg-white"
                    >
                      <option value="English">English</option>
                      <option value="Zulu">Zulu</option>
                      <option value="Afrikaans">Afrikaans</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <HiOutlineClock className="h-4 w-4" />
                      Timezone
                    </label>
                    <select
                      name="timezone"
                      value={preferences.timezone}
                      onChange={handlePreferenceChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-custom-blue focus:bg-white"
                    >
                      <option value="Africa/Johannesburg">Africa/Johannesburg</option>
                      <option value="UTC">UTC</option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="America/New_York">America/New_York</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSavePreferences}
                  disabled={savingPreferences}
                  className="mt-5 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {savingPreferences ? "Saving..." : "Save Preferences"}
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="mt-5 rounded-[1.75rem] border border-red-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-red-50 p-2.5">
                  <HiOutlineTrash className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Deactivate / Delete Account
                  </h3>
                  <p className="text-xs text-slate-500">
                    These actions affect access to your account.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h4 className="text-sm font-semibold text-slate-900">
                    Deactivate Account
                  </h4>
                  <p className="mt-1 text-xs leading-6 text-slate-500">
                    Temporarily disable your account and sign out.
                  </p>
                  <button
                    type="button"
                    onClick={handleDeactivateAccount}
                    disabled={deletingAccount}
                    className="mt-4 rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 disabled:opacity-60"
                  >
                    {deletingAccount ? "Processing..." : "Deactivate"}
                  </button>
                </div>

                <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                  <h4 className="text-sm font-semibold text-red-700">
                    Delete Account
                  </h4>
                  <p className="mt-1 text-xs leading-6 text-red-600">
                    Permanently remove your account and all access.
                  </p>
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={deletingAccount}
                    className="mt-4 rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
                  >
                    {deletingAccount ? "Processing..." : "Delete Account"}
                  </button>
                </div>
              </div>

              {dangerMessage && (
                <p className="mt-4 text-sm text-slate-600">{dangerMessage}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;