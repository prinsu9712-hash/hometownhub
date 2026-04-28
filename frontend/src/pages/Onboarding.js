import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import API, { getApiErrorMessage } from "../api";
import {
  CheckCircleIcon,
  ClipboardIcon,
  CommunityIcon,
  MailIcon,
  MapPinIcon,
  PulseIcon,
  SparkIcon,
  UserIcon,
  UsersIcon,
  XCircleIcon
} from "../components/Icons";

const getStatusClass = (status) => {
  switch (status) {
    case "APPROVED":
      return "status-chip status-chip-approved";
    case "REJECTED":
      return "status-chip status-chip-rejected";
    case "PENDING":
      return "status-chip status-chip-pending";
    default:
      return "status-chip status-chip-neutral";
  }
};

function Onboarding() {
  const [records, setRecords] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    communityName: "",
    cityVillage: "",
    description: "",
    memberCount: "",
    contactName: "",
    contactEmail: ""
  });

  const fetchRecords = useCallback(async () => {
    try {
      setLoadError("");
      const { data } = await API.get("/onboarding");
      setRecords(data);
    } catch (error) {
      setRecords([]);
      setLoadError(getApiErrorMessage(error, "Failed to load onboarding records."));
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const submit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    try {
      await API.post("/onboarding", {
        ...form,
        memberCount: Number(form.memberCount) || 0
      });
      setForm({
        communityName: "",
        cityVillage: "",
        description: "",
        memberCount: "",
        contactName: "",
        contactEmail: ""
      });
      await fetchRecords();
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Failed to submit onboarding request."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onboardingStats = useMemo(() => {
    const approved = records.filter((record) => record.status === "APPROVED").length;
    const pending = records.filter((record) => record.status === "PENDING").length;
    const totalMembers = records.reduce((sum, record) => sum + (Number(record.memberCount) || 0), 0);

    return [
      { label: "Requests", value: records.length, icon: ClipboardIcon },
      { label: "Approved", value: approved, icon: CheckCircleIcon },
      { label: "Pending", value: pending, icon: PulseIcon },
      { label: "Estimated members", value: totalMembers, icon: UsersIcon }
    ];
  }, [records]);

  return (
    <Layout>
      <section className="aurora-shell p-8 sm:p-10">
        <div className="hero-banner mb-6">
          <div className="hero-content grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.9fr)] lg:items-center">
            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="hero-chip">
                  <ClipboardIcon className="h-4 w-4" />
                  Onboarding
                </span>
                <span className="hero-chip">
                  <SparkIcon className="h-4 w-4" />
                  Review-ready flow
                </span>
              </div>
              <h2 className="text-3xl font-bold sm:text-5xl">Community and pandit onboarding with a clearer, guided flow</h2>
              <p className="mt-3 max-w-3xl text-sm text-white/90 sm:text-base">
                Submit local community details, route requests for approval, and keep status updates visible in one polished workflow.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <span className="hero-chip">
                  <CommunityIcon className="h-4 w-4" />
                  Community requests
                </span>
                <span className="hero-chip">
                  <UserIcon className="h-4 w-4" />
                  Contact validation
                </span>
                <span className="hero-chip">
                  <CheckCircleIcon className="h-4 w-4" />
                  Approval tracking
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
              {onboardingStats.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.06 }}
                    className="hero-stat"
                  >
                    <div className="flex items-center gap-3">
                      <span className="icon-badge h-10 w-10 rounded-xl">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/72">{item.label}</p>
                        <p className="mt-1 text-xl font-bold text-white">{item.value}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {loadError && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {loadError}
          </div>
        )}

        <form onSubmit={submit} className="section-frame mb-6 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="section-kicker">Submission form</p>
              <h3 className="mt-2 text-2xl font-semibold text-stone-900">Launch a new onboarding request</h3>
            </div>
            <span className="metric-pill">
              <SparkIcon className="h-4 w-4 text-brand" />
              Review queue
            </span>
          </div>

          <div className="input-shell">
            <label className="input-label">
              <CommunityIcon className="h-4 w-4" />
              Community Name
            </label>
            <input
              className="soft-input"
              placeholder="Ex. Surat Cultural Circle"
              value={form.communityName}
              onChange={(e) => setForm((prev) => ({ ...prev, communityName: e.target.value }))}
              required
            />
          </div>

          <div className="input-shell">
            <label className="input-label">
              <MapPinIcon className="h-4 w-4" />
              City or Village
            </label>
            <input
              className="soft-input"
              placeholder="Ex. Surat, Gujarat"
              value={form.cityVillage}
              onChange={(e) => setForm((prev) => ({ ...prev, cityVillage: e.target.value }))}
              required
            />
          </div>

          <div className="input-shell md:col-span-2">
            <label className="input-label">
              <SparkIcon className="h-4 w-4" />
              Description
            </label>
            <textarea
              className="soft-input min-h-[110px]"
              placeholder="Describe the purpose, culture, and local activities for this onboarding request."
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="input-shell">
            <label className="input-label">
              <UsersIcon className="h-4 w-4" />
              Member Count
            </label>
            <input
              type="number"
              className="soft-input"
              placeholder="Approximate member count"
              value={form.memberCount}
              onChange={(e) => setForm((prev) => ({ ...prev, memberCount: e.target.value }))}
            />
          </div>

          <div className="input-shell">
            <label className="input-label">
              <UserIcon className="h-4 w-4" />
              Contact Name
            </label>
            <input
              className="soft-input"
              placeholder="Primary contact"
              value={form.contactName}
              onChange={(e) => setForm((prev) => ({ ...prev, contactName: e.target.value }))}
              required
            />
          </div>

          <div className="input-shell md:col-span-2">
            <label className="input-label">
              <MailIcon className="h-4 w-4" />
              Contact Email
            </label>
            <input
              type="email"
              className="soft-input"
              placeholder="contact@example.com"
              value={form.contactEmail}
              onChange={(e) => setForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
              required
            />
          </div>

          {submitError && (
            <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {submitError}
            </div>
          )}

          <button className="primary-btn md:col-span-2" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Onboarding"}
          </button>
        </form>

        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="section-kicker">Request history</p>
            <h3 className="mt-2 text-2xl font-semibold text-stone-900">Track approvals and follow-ups</h3>
          </div>
          <span className="metric-pill">
            <PulseIcon className="h-4 w-4 text-emerald-600" />
            {records.length} active records
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {records.map((record, idx) => (
            <motion.article
              key={record._id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              className="feed-card"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-stone-900">
                    {record.communityName} ({record.cityVillage})
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-sm text-stone-600">
                    <UserIcon className="h-4 w-4 text-brand" />
                    {record.contactName}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-stone-600">
                    <MailIcon className="h-4 w-4 text-brand" />
                    {record.contactEmail}
                  </p>
                </div>
                <span className={getStatusClass(record.status)}>
                  {record.status === "APPROVED" && <CheckCircleIcon className="h-4 w-4" />}
                  {record.status === "REJECTED" && <XCircleIcon className="h-4 w-4" />}
                  {record.status === "PENDING" && <PulseIcon className="h-4 w-4" />}
                  {!["APPROVED", "REJECTED", "PENDING"].includes(record.status) && (
                    <SparkIcon className="h-4 w-4" />
                  )}
                  {record.status}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="tool-chip">
                  <UsersIcon className="h-4 w-4 text-brand" />
                  {Number(record.memberCount) || 0} members
                </span>
                <span className="tool-chip">
                  <MapPinIcon className="h-4 w-4 text-brand" />
                  {record.cityVillage}
                </span>
              </div>
              {record.description && (
                <p className="mt-4 text-sm leading-6 text-stone-600">{record.description}</p>
              )}
            </motion.article>
          ))}
          {records.length === 0 && (
            <div className="section-frame text-center text-stone-600 lg:col-span-2">
              No onboarding requests yet.
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

export default Onboarding;
