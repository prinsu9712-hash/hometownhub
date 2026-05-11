import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import API, { getApiErrorMessage } from "../api";
import { AuthContext } from "../context/AuthContext";
import HeroBanner from "../components/HeroBanner";
import {
  ArrowUpRightIcon,
  CheckCircleIcon,
  ClipboardIcon,
  CommunityIcon,
  FilterIcon,
  GlobeIcon,
  MailIcon,
  MapPinIcon,
  PulseIcon,
  SearchIcon,
  ShieldIcon,
  SparkIcon,
  UserIcon,
  UsersIcon,
  XCircleIcon
} from "../components/Icons";

const INDIAN_STATES = [
  { name: "Andhra Pradesh", cities: ["Visakhapatnam", "Vijayawada", "Tirupati"] },
  { name: "Arunachal Pradesh", cities: ["Itanagar", "Naharlagun", "Ziro"] },
  { name: "Assam", cities: ["Guwahati", "Jorhat", "Silchar"] },
  { name: "Bihar", cities: ["Patna", "Gaya", "Muzaffarpur"] },
  { name: "Chhattisgarh", cities: ["Raipur", "Bhilai", "Bilaspur"] },
  { name: "Goa", cities: ["Panaji", "Margao", "Vasco da Gama"] },
  { name: "Gujarat", cities: ["Ahmedabad", "Surat", "Vadodara"] },
  { name: "Haryana", cities: ["Gurugram", "Faridabad", "Panipat"] },
  { name: "Himachal Pradesh", cities: ["Shimla", "Dharamshala", "Solan"] },
  { name: "Jharkhand", cities: ["Ranchi", "Jamshedpur", "Dhanbad"] },
  { name: "Karnataka", cities: ["Bengaluru", "Mysuru", "Hubli"] },
  { name: "Kerala", cities: ["Thiruvananthapuram", "Kochi", "Kozhikode"] },
  { name: "Madhya Pradesh", cities: ["Bhopal", "Indore", "Gwalior"] },
  { name: "Maharashtra", cities: ["Mumbai", "Pune", "Nagpur"] },
  { name: "Manipur", cities: ["Imphal", "Thoubal", "Churachandpur"] },
  { name: "Meghalaya", cities: ["Shillong", "Tura", "Nongpoh"] },
  { name: "Mizoram", cities: ["Aizawl", "Lunglei", "Champhai"] },
  { name: "Nagaland", cities: ["Kohima", "Dimapur", "Mokokchung"] },
  { name: "Odisha", cities: ["Bhubaneswar", "Cuttack", "Rourkela"] },
  { name: "Punjab", cities: ["Chandigarh", "Amritsar", "Ludhiana"] },
  { name: "Rajasthan", cities: ["Jaipur", "Jodhpur", "Udaipur"] },
  { name: "Sikkim", cities: ["Gangtok", "Namchi", "Mangan"] },
  { name: "Tamil Nadu", cities: ["Chennai", "Coimbatore", "Madurai"] },
  { name: "Telangana", cities: ["Hyderabad", "Warangal", "Nizamabad"] },
  { name: "Tripura", cities: ["Agartala", "Udaipur", "Kailasahar"] },
  { name: "Uttar Pradesh", cities: ["Lucknow", "Kanpur", "Varanasi"] },
  { name: "Uttarakhand", cities: ["Dehradun", "Haridwar", "Rishikesh"] },
  { name: "West Bengal", cities: ["Kolkata", "Siliguri", "Durgapur"] }
];

const getCommunityState = (community) => {
  const state = String(community?.state || "").trim();
  if (state) return state;

  const parts = String(community?.city || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return parts.length > 1 ? parts[parts.length - 1] : "";
};

const getCommunityCity = (community) => {
  const parts = String(community?.city || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return parts.length > 0 ? parts[0] : "";
};

const getMemberCount = (community) => community?.members?.length || 0;
const getPendingCount = (community) => community?.pendingMembers?.length || 0;

function Communities() {
  const { user } = useContext(AuthContext);
  const [communities, setCommunities] = useState([]);
  const [pageError, setPageError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");
  const [isCreating, setIsCreating] = useState(false);
  const [membershipLoadingId, setMembershipLoadingId] = useState("");
  const [membershipMessage, setMembershipMessage] = useState({});
  const [policyDrafts, setPolicyDrafts] = useState({});
  const [createError, setCreateError] = useState("");
  const [form, setForm] = useState({
    name: "",
    state: "",
    city: "",
    description: "",
    rules: "",
    guidelines: ""
  });
  const navigate = useNavigate();
  const formRef = useRef(null);

  const fetchCommunities = useCallback(async () => {
    try {
      setPageError("");
      const { data } = await API.get("/communities");
      setCommunities(Array.isArray(data) ? data : []);
    } catch (error) {
      setCommunities([]);
      setPageError(getApiErrorMessage(error, "Failed to load communities."));
    }
  }, []);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return communities;

    return communities.filter((community) => {
      const name = (community.name || "").toLowerCase();
      const city = (community.city || "").toLowerCase();
      const state = getCommunityState(community).toLowerCase();
      const description = (community.description || "").toLowerCase();
      return (
        name.includes(query) ||
        city.includes(query) ||
        state.includes(query) ||
        description.includes(query)
      );
    });
  }, [communities, search]);

  const selectedState = useMemo(() => {
    if (stateFilter === "All") return null;
    return INDIAN_STATES.find((state) => state.name === stateFilter) || null;
  }, [stateFilter]);

  const derivedCitiesForState = useMemo(() => {
    if (!selectedState) return [];

    const known = selectedState.cities;
    const dynamic = communities
      .filter((community) => getCommunityState(community) === selectedState.name)
      .map(getCommunityCity)
      .filter(Boolean);

    return Array.from(new Set([...known, ...dynamic]));
  }, [communities, selectedState]);

  const formCitySuggestions = useMemo(() => {
    if (!form.state) return [];
    const match = INDIAN_STATES.find((state) => state.name === form.state);
    return match?.cities || [];
  }, [form.state]);

  const stateFilteredCommunities = useMemo(() => {
    let results = filtered;

    if (stateFilter !== "All") {
      const normalizedState = stateFilter.toLowerCase();
      results = results.filter((community) => {
        const state = getCommunityState(community).toLowerCase();
        const city = (community.city || "").toLowerCase();
        return state === normalizedState || city.includes(normalizedState);
      });
    }

    if (cityFilter !== "All") {
      const normalizedCity = cityFilter.toLowerCase();
      results = results.filter((community) => {
        const city = getCommunityCity(community).toLowerCase();
        return city === normalizedCity || (community.city || "").toLowerCase().includes(normalizedCity);
      });
    }

    return results;
  }, [filtered, stateFilter, cityFilter]);

  const dashboardStats = useMemo(() => {
    const totalMembers = communities.reduce((sum, community) => sum + getMemberCount(community), 0);
    const totalPending = communities.reduce((sum, community) => sum + getPendingCount(community), 0);
    const activeStates = new Set(
      communities
        .map((community) => getCommunityState(community))
        .filter(Boolean)
    ).size;

    return [
      { label: "Live communities", value: communities.length, icon: CommunityIcon },
      { label: "Members connected", value: totalMembers, icon: UsersIcon },
      { label: "Pending joins", value: totalPending, icon: PulseIcon },
      { label: "States active", value: activeStates, icon: GlobeIcon }
    ];
  }, [communities]);

  const showcasedStates = useMemo(() => {
    if (selectedState) return [selectedState];
    return INDIAN_STATES.slice(0, 6);
  }, [selectedState]);

  const isMember = useCallback(
    (community) =>
      Boolean(
        user?._id &&
          (community.members || []).some((member) =>
            String(member?._id || member) === String(user._id)
          )
      ),
    [user?._id]
  );

  const isPendingMember = useCallback(
    (community) =>
      Boolean(
        user?._id &&
          (community.pendingMembers || []).some(
            (member) => String(member?._id || member) === String(user._id)
          )
      ),
    [user?._id]
  );

  const canModerateCommunity = useCallback(
    (community) =>
      user?.role === "ADMIN" ||
      user?.role === "MODERATOR" ||
      String(community?.createdBy?._id || community?.createdBy) === String(user?._id),
    [user?._id, user?.role]
  );

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setCreateError("");
    setStatusMessage("");
  };

  const createCommunity = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError("");
    setStatusMessage("");

    try {
      if (!form.name.trim() || !form.state.trim() || !form.city.trim()) {
        setCreateError("Community name, state and city are required.");
        setIsCreating(false);
        return;
      }

      await API.post("/communities", {
        name: form.name.trim(),
        state: form.state.trim(),
        city: form.city.trim(),
        description: form.description.trim(),
        rules: form.rules.trim(),
        guidelines: form.guidelines.trim()
      });

      setForm({ name: "", state: "", city: "", description: "", rules: "", guidelines: "" });
      setStatusMessage(
        user?.role === "ADMIN"
          ? "Community created successfully."
          : "Community request submitted for admin approval."
      );
      await fetchCommunities();
    } catch (error) {
      setCreateError(getApiErrorMessage(error, "Failed to create community."));
    } finally {
      setIsCreating(false);
    }
  };

  const toggleMembership = async (community) => {
    if (!user?._id) return;

    const joined = isMember(community);
    setMembershipLoadingId(community._id);
    setMembershipMessage((prev) => ({ ...prev, [community._id]: "" }));

    try {
      const { data } = await API.post(`/communities/${community._id}/${joined ? "leave" : "join"}`);
      setMembershipMessage((prev) => ({
        ...prev,
        [community._id]: data?.message || (joined ? "You left the community." : "Membership updated.")
      }));
      await fetchCommunities();
    } catch (error) {
      setMembershipMessage((prev) => ({
        ...prev,
        [community._id]: getApiErrorMessage(error, "Membership update failed")
      }));
    } finally {
      setMembershipLoadingId("");
    }
  };

  const updatePolicy = async (communityId) => {
    const draft = policyDrafts[communityId] || {};

    try {
      setPageError("");
      await API.put(`/communities/${communityId}/policy`, {
        rules: draft.rules || "",
        guidelines: draft.guidelines || ""
      });
      setStatusMessage("Community policy updated.");
      await fetchCommunities();
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Failed to update community rules."));
    }
  };

  const handleRequestAction = async (communityId, requestUserId, action) => {
    try {
      setPageError("");
      await API.post(`/communities/${communityId}/requests/${requestUserId}/${action}`);
      await fetchCommunities();
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Failed to update the membership request."));
    }
  };

  return (
    <Layout>
      <section className="aurora-shell p-8 sm:p-10">
        <HeroBanner
          tag="Local Network"
          title="Discover Hometown Communities"
          sub="Join your city or village community, share updates, and participate in events across India."
          chips={["City and village discovery", "Rules and moderation", "Pending approvals"]}
        />

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardStats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className="stat-card"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-stone-500">
                    {item.label}
                  </p>
                  <Icon className="h-5 w-5 text-brand" />
                </div>
                <p className="text-3xl font-bold text-stone-900">{item.value}</p>
                <div className="progress-bar mt-3">
                  <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(6, Number(item.value) * 8))}%` }} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {pageError && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {pageError}
          </div>
        )}

        {statusMessage && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {statusMessage}
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-kicker">Explore</p>
            <h2 className="section-title">Communities</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="metric-pill">
              <SearchIcon className="h-4 w-4 text-brand" />
              Results
              <span className="metric-value">{stateFilteredCommunities.length}</span>
            </span>
            <span className="metric-pill">
              <FilterIcon className="h-4 w-4 text-brand" />
              Filter
              <span className="metric-value">{stateFilter === "All" ? "All states" : stateFilter}</span>
            </span>
          </div>
        </div>

        <div className="section-frame subtle-grid mb-8">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-stone-500">
              Statewise communities
            </p>
            <span className="metric-pill">
              <GlobeIcon className="h-4 w-4 text-brand" />
              Showing {stateFilter === "All" ? "all states" : stateFilter}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {showcasedStates.map((state) => {
              const count = communities.filter(
                (community) => getCommunityState(community).toLowerCase() === state.name.toLowerCase()
              ).length;

              return (
                <article key={state.name} className="feature-card">
                  <div className="flex items-start justify-between gap-3">
                    <span className="icon-surface bg-gradient-to-br from-amber-100 via-orange-50 to-white text-brand">
                      <GlobeIcon className="h-6 w-6" />
                    </span>
                    <span className="metric-pill">
                      <SparkIcon className="h-3.5 w-3.5 text-brand" />
                      {count || "New"}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-stone-900">{state.name}</h3>
                  <p className="mt-2 text-sm text-stone-500">{state.cities.join(", ")} and nearby towns</p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                    {count ? `${count} live communities` : "Ready for a first community"}
                  </p>
                  <button
                    type="button"
                    className="primary-btn mt-5"
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        state: state.name,
                        city: prev.city || state.cities[0] || ""
                      }));
                      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  >
                    Create community for {state.name}
                  </button>
                </article>
              );
            })}
          </div>
        </div>

        <div className="section-frame mb-7 grid gap-3 md:grid-cols-3">
          <div className="input-shell md:col-span-3">
            <label className="input-label">
              <SearchIcon className="h-4 w-4" />
              Search communities
            </label>
            <input
              className="soft-input"
              placeholder="Search by community, city, state, or description"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="input-shell">
            <label className="input-label">
              <GlobeIcon className="h-4 w-4" />
              State filter
            </label>
            <select
              className="soft-input"
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
                setCityFilter("All");
              }}
            >
              <option value="All">All States</option>
              {INDIAN_STATES.map((state) => (
                <option key={state.name} value={state.name}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>
          <div className="input-shell">
            <label className="input-label">
              <MapPinIcon className="h-4 w-4" />
              City filter
            </label>
            <select
              className="soft-input"
              value={cityFilter}
              disabled={stateFilter === "All"}
              onChange={(e) => setCityFilter(e.target.value)}
            >
              <option value="All">All Cities</option>
              {derivedCitiesForState.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <div className="input-shell flex items-end">
            <button
              type="button"
              className="muted-btn w-full"
              onClick={() => {
                setStateFilter("All");
                setCityFilter("All");
              }}
            >
              Reset filters
            </button>
          </div>
        </div>

        {user && (
          <form
            ref={formRef}
            onSubmit={createCommunity}
            className="section-frame mb-8"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="section-kicker">
                  {user?.role === "ADMIN" ? "Direct creation" : "Approval request"}
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-stone-900">
                  {user?.role === "ADMIN" ? "Create Community" : "Request Community"}
                </h3>
              </div>
              <span className="metric-pill">
                <ShieldIcon className="h-4 w-4 text-brand" />
                {user?.role === "ADMIN" ? "Create Community" : "Request Community"}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="input-shell">
                <label className="input-label">
                  <CommunityIcon className="h-4 w-4" />
                  Community name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleCreateChange}
                  className="soft-input"
                  placeholder="Community name"
                  required
                />
              </div>
              <div className="input-shell">
                <label className="input-label">
                  <GlobeIcon className="h-4 w-4" />
                  State
                </label>
                <select
                  name="state"
                  value={form.state}
                  onChange={(e) => {
                    handleCreateChange(e);
                    setForm((prev) => ({ ...prev, city: "" }));
                  }}
                  className="soft-input"
                  required
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state.name} value={state.name}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-shell">
                <label className="input-label">
                  <MapPinIcon className="h-4 w-4" />
                  City or village
                </label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleCreateChange}
                  className="soft-input"
                  placeholder="City or village"
                  list="community-city-options"
                  required
                />
              </div>
              <datalist id="community-city-options">
                {formCitySuggestions.map((city) => (
                  <option key={city} value={city} />
                ))}
              </datalist>
              <div className="input-shell md:col-span-2">
                <label className="input-label">
                  <SparkIcon className="h-4 w-4" />
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleCreateChange}
                  className="soft-input min-h-[96px]"
                  placeholder="Community description"
                />
              </div>
              <div className="input-shell">
                <label className="input-label">
                  <ShieldIcon className="h-4 w-4" />
                  Rules
                </label>
                <textarea
                  name="rules"
                  value={form.rules}
                  onChange={handleCreateChange}
                  className="soft-input min-h-[96px]"
                  placeholder="Posting, privacy, and safety rules"
                />
              </div>
              <div className="input-shell">
                <label className="input-label">
                  <ClipboardIcon className="h-4 w-4" />
                  Guidelines
                </label>
                <textarea
                  name="guidelines"
                  value={form.guidelines}
                  onChange={handleCreateChange}
                  className="soft-input min-h-[96px]"
                  placeholder="Helpful conduct and event guidelines"
                />
              </div>
            </div>

            {createError && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {createError}
              </p>
            )}

            <button type="submit" disabled={isCreating} className="primary-btn mt-4">
              {isCreating
                ? user?.role === "ADMIN"
                  ? "Creating..."
                  : "Submitting..."
                : user?.role === "ADMIN"
                  ? "Create Community"
                  : "Submit Request"}
            </button>
          </form>
        )}

        {stateFilteredCommunities.length === 0 && (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/80 p-8 text-center text-stone-600">
            No approved communities available for this filter yet.
          </div>
        )}

        <div className="grid gap-5 xl:grid-cols-2">
          {stateFilteredCommunities.map((community, idx) => (
            <motion.div
              key={community._id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.04 }}
              className="feature-card"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-4">
                  <span className="icon-surface bg-gradient-to-br from-amber-100 via-orange-50 to-white text-brand">
                    <CommunityIcon className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold text-stone-900">{community.name}</h3>
                    <p className="mt-1 flex items-center gap-2 text-sm font-medium text-brand">
                      <MapPinIcon className="h-4 w-4" />
                      {getCommunityCity(community)}{getCommunityState(community) ? `, ${getCommunityState(community)}` : ""}
                    </p>
                  </div>
                </div>
                <span className="metric-pill">
                  <SparkIcon className="h-4 w-4 text-brand" />
                  Community Hub
                </span>
              </div>
              <p className="mt-3 text-sm text-stone-600">{community.description || "No description yet."}</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-stone-200 bg-stone-50/85 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">
                    Rules
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-700">
                    {community.rules || "No rules posted yet."}
                  </p>
                </div>
                <div className="rounded-2xl border border-stone-200 bg-stone-50/85 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">
                    Guidelines
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-700">
                    {community.guidelines || "No guidelines posted yet."}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="tool-chip">
                  <UsersIcon className="h-4 w-4 text-brand" />
                  Members: {getMemberCount(community)}
                </span>
                <span className="tool-chip">
                  <PulseIcon className="h-4 w-4 text-brand" />
                  Pending: {getPendingCount(community)}
                </span>
                {community.rules && (
                  <span className="tool-chip">
                    <ShieldIcon className="h-4 w-4 text-brand" />
                    Rules ready
                  </span>
                )}
              </div>

              {membershipMessage[community._id] && (
                <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                  {membershipMessage[community._id]}
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  onClick={() => navigate(`/events/${community._id}`)}
                  className="primary-btn"
                  type="button"
                >
                  <ArrowUpRightIcon className="mr-2 h-4 w-4" />
                  Open Community Hub
                </button>
                <button
                  type="button"
                  onClick={() => toggleMembership(community)}
                  disabled={membershipLoadingId === community._id || isPendingMember(community)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    isMember(community)
                      ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                      : isPendingMember(community)
                        ? "bg-amber-100 text-amber-700"
                        : "bg-sky-100 text-sky-700 hover:bg-sky-200"
                  }`}
                >
                  {membershipLoadingId === community._id
                    ? "Updating..."
                    : isMember(community)
                      ? "Leave"
                      : isPendingMember(community)
                        ? "Pending"
                        : "Join"}
                </button>
              </div>

              {canModerateCommunity(community) && (
                <div className="section-frame mt-5 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-stone-800">Community Rules and Guidelines</p>
                    <span className="metric-pill">
                      <ShieldIcon className="h-4 w-4 text-brand" />
                      Moderator tools
                    </span>
                  </div>
                  <div className="grid gap-3">
                    <div className="input-shell">
                      <label className="input-label">
                        <ShieldIcon className="h-4 w-4" />
                        Rules
                      </label>
                      <textarea
                        className="soft-input min-h-[72px]"
                        placeholder="Rules"
                        value={policyDrafts[community._id]?.rules ?? community.rules ?? ""}
                        onChange={(e) =>
                          setPolicyDrafts((prev) => ({
                            ...prev,
                            [community._id]: {
                              ...(prev[community._id] || {}),
                              rules: e.target.value,
                              guidelines:
                                prev[community._id]?.guidelines ?? community.guidelines ?? ""
                            }
                          }))
                        }
                      />
                    </div>
                    <div className="input-shell">
                      <label className="input-label">
                        <ClipboardIcon className="h-4 w-4" />
                        Guidelines
                      </label>
                      <textarea
                        className="soft-input min-h-[72px]"
                        placeholder="Guidelines"
                        value={policyDrafts[community._id]?.guidelines ?? community.guidelines ?? ""}
                        onChange={(e) =>
                          setPolicyDrafts((prev) => ({
                            ...prev,
                            [community._id]: {
                              ...(prev[community._id] || {}),
                              guidelines: e.target.value,
                              rules: prev[community._id]?.rules ?? community.rules ?? ""
                            }
                          }))
                        }
                      />
                    </div>
                    <button
                      type="button"
                      className="muted-btn"
                      onClick={() => updatePolicy(community._id)}
                    >
                      Save Rules
                    </button>
                  </div>

                  {(community.pendingMembers || []).length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-semibold text-stone-800">Pending Member Requests</p>
                      {(community.pendingMembers || []).map((pendingUser) => (
                        <div
                          key={pendingUser._id}
                          className="rounded-2xl border border-stone-200/75 bg-stone-50/90 px-3 py-3 text-sm"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="flex items-center gap-2 font-medium text-stone-700">
                                <UserIcon className="h-4 w-4 text-brand" />
                                {pendingUser.name}
                              </p>
                              <p className="mt-1 flex items-center gap-2 text-xs text-stone-500">
                                <MailIcon className="h-4 w-4 text-brand" />
                                {pendingUser.email}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-100 px-3 py-1 font-semibold text-emerald-700"
                                onClick={() =>
                                  handleRequestAction(community._id, pendingUser._id, "approve")
                                }
                              >
                                <CheckCircleIcon className="h-4 w-4" />
                                Approve
                              </button>
                              <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-lg bg-rose-100 px-3 py-1 font-semibold text-rose-700"
                                onClick={() =>
                                  handleRequestAction(community._id, pendingUser._id, "reject")
                                }
                              >
                                <XCircleIcon className="h-4 w-4" />
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>
    </Layout>
  );
}

export default Communities;
