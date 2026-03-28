import { useContext, useEffect, useState } from "react";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import { getApiErrorMessage } from "../api";

function Profile() {
  const { user, refreshProfile, updateProfile } = useContext(AuthContext);
  const [form, setForm] = useState({
    name: user?.name || "",
    hometown: user?.hometown || ""
  });
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setForm({
      name: user?.name || "",
      hometown: user?.hometown || ""
    });
  }, [user?.hometown, user?.name]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoadError("");
        await refreshProfile();
      } catch (error) {
        setLoadError(getApiErrorMessage(error, "Failed to load profile."));
      }
    };

    loadProfile();
  }, [refreshProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError("");
    setSaveMessage("");

    try {
      await updateProfile(form);
      setSaveMessage("Profile updated successfully.");
    } catch (error) {
      setSaveError(getApiErrorMessage(error, "Failed to update profile."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <section className="hero-glass p-8 sm:p-10">
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#8d5a34] via-[#b78656] to-[#e39d58] p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/85">Profile</p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Your hometown identity</h2>
          <p className="mt-2 text-sm text-white/90">Manage your account details and hometown profile information.</p>
        </div>

        {loadError && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {loadError}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <form onSubmit={handleSubmit} className="glass-tile p-6">
            <h3 className="text-lg font-semibold text-stone-900">Edit Profile</h3>
            <div className="mt-4 grid gap-4">
              <input
                className="soft-input"
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
              <input
                className="soft-input"
                placeholder="Hometown"
                value={form.hometown}
                onChange={(e) => setForm((prev) => ({ ...prev, hometown: e.target.value }))}
              />
              <input className="soft-input bg-stone-100" value={user?.email || ""} disabled />
            </div>

            {saveError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {saveError}
              </div>
            )}

            {saveMessage && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {saveMessage}
              </div>
            )}

            <button type="submit" className="primary-btn mt-4" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
          </form>

          <div className="glass-tile p-6">
            <h3 className="text-lg font-semibold text-stone-900">Profile Snapshot</h3>
            <div className="mt-4 space-y-3 text-sm text-stone-700">
              <p><span className="font-semibold text-stone-900">Name:</span> {user?.name || "Not set"}</p>
              <p><span className="font-semibold text-stone-900">Email:</span> {user?.email || "Not set"}</p>
              <p><span className="font-semibold text-stone-900">Role:</span> {user?.role || "USER"}</p>
              <p><span className="font-semibold text-stone-900">Hometown:</span> {user?.hometown || "Add your hometown to help communities find you."}</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default Profile;
