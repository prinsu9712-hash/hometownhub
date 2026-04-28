import { useCallback, useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import API, { getApiErrorMessage } from "../api";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import HeroBanner from "../components/HeroBanner";
import AnimatedCounter from "../components/AnimatedCounter";
import {
  ActivityIcon,
  CalendarIcon,
  ChartIcon,
  CheckCircleIcon,
  ClipboardIcon,
  CommunityIcon,
  FlagIcon,
  GlobeIcon,
  SparkIcon,
  UserIcon,
  UsersIcon,
  XCircleIcon
} from "../components/Icons";

function Admin() {
  const { user } = useContext(AuthContext);
  const [tab, setTab] = useState("kpi");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [onboarding, setOnboarding] = useState([]);
  const [communityRequests, setCommunityRequests] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    const [
      statsResult,
      usersResult,
      eventsResult,
      reportsResult,
      categoriesResult,
      onboardingResult,
      communityRequestsResult
    ] = await Promise.allSettled([
      API.get("/admin/dashboard"),
      API.get("/admin/users"),
      API.get("/events/admin/all"),
      API.get("/reports"),
      API.get("/categories"),
      API.get("/onboarding"),
      API.get("/communities/requests/all")
    ]);

    if (statsResult.status === "fulfilled") setStats(statsResult.value.data);
    if (usersResult.status === "fulfilled") setUsers(usersResult.value.data);
    if (eventsResult.status === "fulfilled") setEvents(eventsResult.value.data);
    if (reportsResult.status === "fulfilled") setReports(reportsResult.value.data);
    if (categoriesResult.status === "fulfilled") setCategories(categoriesResult.value.data);
    if (onboardingResult.status === "fulfilled") setOnboarding(onboardingResult.value.data);
    if (communityRequestsResult.status === "fulfilled") setCommunityRequests(communityRequestsResult.value.data);

    const firstFailure = [
      statsResult,
      usersResult,
      eventsResult,
      reportsResult,
      categoriesResult,
      onboardingResult,
      communityRequestsResult
    ].find((result) => result.status === "rejected");

    if (firstFailure?.status === "rejected") {
      setLoadError(getApiErrorMessage(firstFailure.reason, "Some admin data could not be loaded."));
    }

    setIsLoading(false);
  }, []);

  const runAdminAction = useCallback(async (action, fallbackMessage) => {
    setActionError("");
    try {
      await action();
      await loadAdminData();
    } catch (error) {
      setActionError(getApiErrorMessage(error, fallbackMessage));
    }
  }, [loadAdminData]);

  useEffect(() => {
    if (user?.role !== "ADMIN") return;
    loadAdminData();
  }, [loadAdminData, user?.role]);

  const deleteEvent = async (id) => {
    await runAdminAction(() => API.put(`/events/${id}/delete`), "Failed to archive the event.");
  };

  const restoreEvent = async (id) => {
    await runAdminAction(() => API.put(`/events/${id}/restore`), "Failed to restore the event.");
  };

  const updateRole = async (id, role) => {
    await runAdminAction(() => API.put(`/admin/users/${id}/role`, { role }), "Failed to update the user role.");
  };

  const toggleBlock = async (id) => {
    await runAdminAction(() => API.put(`/admin/users/${id}/block`), "Failed to update the block status.");
  };

  const resolveReport = async (id, status) => {
    const resolutionNote = window.prompt("Resolution note (optional):") || "";
    await runAdminAction(
      () => API.put(`/reports/${id}/resolve`, { status, resolutionNote }),
      "Failed to resolve the report."
    );
  };

  const addCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;
    await runAdminAction(async () => {
      await API.post("/categories", newCategory);
      setNewCategory({ name: "", description: "" });
    }, "Failed to add the category.");
  };

  const archiveCategory = async (id) => {
    await runAdminAction(() => API.delete(`/categories/${id}`), "Failed to archive the category.");
  };

  const updateOnboardingStatus = async (id, status) => {
    await runAdminAction(
      () => API.put(`/onboarding/${id}/status`, { status }),
      "Failed to update onboarding status."
    );
  };

  const updateCommunityRequestStatus = async (id, status) => {
    const approvalNote = window.prompt("Approval note (optional):") || "";
    await runAdminAction(
      () => API.put(`/communities/requests/${id}/status`, { status, approvalNote }),
      "Failed to update community request status."
    );
  };

  if (user?.role !== "ADMIN") {
    return (
      <Layout>
        <section className="aurora-shell p-8 sm:p-10">
          <p className="section-kicker">Restricted</p>
          <h2 className="section-title">Admin Access Required</h2>
          <p className="mt-4 text-stone-600">This module is only available for platform administrators.</p>
        </section>
      </Layout>
    );
  }

  const tabs = [
    { id: "kpi", label: "KPI", icon: ChartIcon },
    { id: "users", label: "Users", icon: UsersIcon },
    { id: "events", label: "Events", icon: CalendarIcon },
    { id: "reports", label: "Reports", icon: FlagIcon },
    { id: "categories", label: "Categories", icon: SparkIcon },
    { id: "onboarding", label: "Onboarding", icon: ClipboardIcon },
    { id: "communityRequests", label: "Requests", icon: CommunityIcon }
  ];

  const topStats = stats
    ? [
        { label: "Total Users", value: stats.totalUsers, icon: UsersIcon, color: "text-[#ef9f27]" },
        { label: "Daily Active Users", value: stats.dailyActiveUsers, icon: ActivityIcon, color: "text-[#22c55e]" },
        { label: "Communities", value: stats.totalCommunities, icon: GlobeIcon, color: "text-[#c8782a]" },
        { label: "Open Reports", value: stats.openReports, icon: FlagIcon, color: "text-[#ef4444]" }
      ]
    : [];

  const tabButton = (id, label, Icon) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={`tab-pill ${tab === id ? "tab-pill-active" : ""}`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );

  return (
    <Layout>
      <section className="aurora-shell p-8 sm:p-10">
        <HeroBanner
          tag="Platform Admin"
          title="Control Center"
          sub="Monitor KPIs, users, events, abuse reports, and content categories from one powerful dashboard."
          chips={["Role management", "Report moderation", "Approval workflows"]}
        />

        {topStats.length > 0 && (
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {topStats.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                  className="stat-card"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-stone-500">{item.label}</p>
                    <Icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div className="text-3xl font-bold text-stone-900">
                    <AnimatedCounter value={item.value} />
                  </div>
                  <div className="progress-bar mt-3">
                    <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(8, Number(item.value) * 9))}%` }} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {loadError && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {loadError}
          </div>
        )}

        {actionError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {actionError}
          </div>
        )}

        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((item) => tabButton(item.id, item.label, item.icon))}
        </div>

        {isLoading && (
          <div className="mb-6 rounded-xl border border-stone-200 bg-white/70 px-4 py-3 text-sm font-medium text-stone-600">
            Loading admin data...
          </div>
        )}

        {tab === "kpi" && stats && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Total Users", stats.totalUsers],
              ["Daily Active Users", stats.dailyActiveUsers],
              ["New Users (7d)", stats.newUsers7d],
              ["Communities", stats.totalCommunities],
              ["Posts", stats.totalPosts],
              ["Events", stats.totalEvents],
              ["Participants", stats.totalParticipants],
              ["Open Reports", stats.openReports]
            ].map(([label, value]) => (
              <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="feature-card p-4">
                <p className="section-kicker">{label}</p>
                <p className="mt-2 text-2xl font-bold text-stone-900">{value}</p>
              </motion.div>
            ))}
          </div>
        )}

        {tab === "users" && (
          <div className="space-y-3">
            {users.map((member) => (
              <div key={member._id} className="feed-card flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="flex items-center gap-2 font-semibold text-stone-900">
                    <UserIcon className="h-4 w-4 text-brand" />
                    {member.name}
                  </p>
                  <p className="text-sm text-stone-600">{member.email} | {member.hometown || "No hometown"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select className="soft-input !w-auto !py-2" value={member.role} onChange={(e) => updateRole(member._id, e.target.value)}>
                    <option value="USER">USER</option>
                    <option value="MODERATOR">MODERATOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                  <button type="button" onClick={() => toggleBlock(member._id)} className={`rounded-lg px-3 py-2 text-sm font-semibold ${member.isBlocked ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                    {member.isBlocked ? "Unblock" : "Block"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "events" && (
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event._id} className={`feed-card ${event.isDeleted ? "border-red-200 bg-red-50/85" : ""}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 font-semibold text-stone-900">
                      <CalendarIcon className="h-4 w-4 text-brand" />
                      {event.title}
                    </p>
                    <p className="text-sm text-stone-600">{event.community?.name || "Unknown"} | {event.createdBy?.name || "Unknown"}</p>
                  </div>
                  {!event.isDeleted ? (
                    <button type="button" onClick={() => deleteEvent(event._id)} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white">Soft Delete</button>
                  ) : (
                    <button type="button" onClick={() => restoreEvent(event._id)} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Restore</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "reports" && (
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report._id} className="feed-card">
                <p className="flex items-center gap-2 font-semibold text-stone-900">
                  <FlagIcon className="h-4 w-4 text-brand" />
                  {report.targetType} | {report.reason}
                </p>
                <p className="mt-1 text-sm text-stone-600">By: {report.reporter?.name || "Unknown"} | Status: {report.status}</p>
                {report.details && <p className="mt-2 text-sm text-stone-700">{report.details}</p>}
                {report.status === "OPEN" && (
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => resolveReport(report._id, "RESOLVED")} className="rounded-lg bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-700">Resolve</button>
                    <button type="button" onClick={() => resolveReport(report._id, "REJECTED")} className="rounded-lg bg-rose-100 px-3 py-1.5 text-sm font-semibold text-rose-700">Reject</button>
                  </div>
                )}
              </div>
            ))}
            {reports.length === 0 && <p className="text-sm text-stone-600">No reports available.</p>}
          </div>
        )}

        {tab === "categories" && (
          <div>
            <form onSubmit={addCategory} className="mb-4 grid gap-3 md:grid-cols-3">
              <input className="soft-input" placeholder="Category name" value={newCategory.name} onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))} />
              <input className="soft-input" placeholder="Description" value={newCategory.description} onChange={(e) => setNewCategory((prev) => ({ ...prev, description: e.target.value }))} />
              <button type="submit" className="primary-btn">Add Category</button>
            </form>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category._id} className="feed-card flex items-center justify-between p-4">
                  <div>
                    <p className="font-semibold text-stone-900">{category.name}</p>
                    <p className="text-sm text-stone-600">{category.description || "No description"}</p>
                  </div>
                  <button type="button" onClick={() => archiveCategory(category._id)} className="rounded-lg bg-rose-100 px-3 py-1.5 text-sm font-semibold text-rose-700">Archive</button>
                </div>
              ))}
              {categories.length === 0 && <p className="text-sm text-stone-600">No categories yet.</p>}
            </div>
          </div>
        )}

        {tab === "onboarding" && (
          <div className="space-y-3">
            {onboarding.map((item) => (
              <article key={item._id} className="feed-card">
                <p className="flex items-center gap-2 font-semibold text-stone-900">
                  <ClipboardIcon className="h-4 w-4 text-brand" />
                  {item.communityName} ({item.cityVillage})
                </p>
                <p className="mt-1 text-sm text-stone-600">Contact: {item.contactName} | {item.contactEmail}</p>
                <p className="mt-1 text-sm text-stone-600">Status: {item.status}</p>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => updateOnboardingStatus(item._id, "APPROVED")} className="inline-flex items-center gap-2 rounded-lg bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-700"><CheckCircleIcon className="h-4 w-4" />Approve</button>
                  <button type="button" onClick={() => updateOnboardingStatus(item._id, "REJECTED")} className="inline-flex items-center gap-2 rounded-lg bg-rose-100 px-3 py-1.5 text-sm font-semibold text-rose-700"><XCircleIcon className="h-4 w-4" />Reject</button>
                </div>
              </article>
            ))}
            {onboarding.length === 0 && <p className="text-sm text-stone-600">No onboarding requests.</p>}
          </div>
        )}

        {tab === "communityRequests" && (
          <div className="space-y-3">
            {communityRequests.map((request) => (
              <article key={request._id} className="feed-card">
                <p className="flex items-center gap-2 font-semibold text-stone-900">
                  <CommunityIcon className="h-4 w-4 text-brand" />
                  {request.name}
                </p>
                <p className="mt-1 text-sm text-stone-600">
                  {request.city} | Requested by {request.createdBy?.name || "Unknown"}
                </p>
                <p className="mt-2 text-sm text-stone-700">{request.description || "No description"}</p>
                <p className="mt-2 text-sm text-stone-600">Status: {request.status}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => updateCommunityRequestStatus(request._id, "APPROVED")}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-700"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => updateCommunityRequestStatus(request._id, "REJECTED")}
                    className="inline-flex items-center gap-2 rounded-lg bg-rose-100 px-3 py-1.5 text-sm font-semibold text-rose-700"
                  >
                    <XCircleIcon className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              </article>
            ))}
            {communityRequests.length === 0 && (
              <p className="text-sm text-stone-600">No community creation requests.</p>
            )}
          </div>
        )}
      </section>
    </Layout>
  );
}

export default Admin;
