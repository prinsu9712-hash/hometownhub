import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useContext } from "react";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import HeroBanner from "../components/HeroBanner";
import AnimatedCounter from "../components/AnimatedCounter";
import {
  ActivityIcon,
  ArrowUpRightIcon,
  BellIcon,
  ClipboardIcon,
  CommunityIcon,
  GlobeIcon,
  RadioIcon,
  ShieldIcon,
  SparkIcon,
  UserIcon,
  UsersIcon
} from "../components/Icons";

function Dashboard() {
  const { user } = useContext(AuthContext);
  const cards = [
    {
      title: "Communities",
      desc: "Create, join, and manage city or village communities.",
      to: "/communities",
      badge: "Explore",
      icon: CommunityIcon,
      surface: "from-amber-100 via-orange-50 to-white text-amber-700",
      tools: ["Join circles", "Discover cities"]
    },
    {
      title: "Notifications",
      desc: "Track announcements, event alerts, and moderation updates.",
      to: "/notifications",
      badge: "Inbox",
      icon: BellIcon,
      surface: "from-sky-100 via-cyan-50 to-white text-sky-700",
      tools: ["Alerts", "Realtime updates"]
    },
    {
      title: "Profile",
      desc: "Manage your hometown details and member identity.",
      to: "/profile",
      badge: "Me",
      icon: UserIcon,
      surface: "from-rose-100 via-pink-50 to-white text-rose-700",
      tools: ["Identity", "Hometown info"]
    },
    {
      title: "Admin",
      desc: "Moderate events, users, and platform activities.",
      to: "/admin",
      badge: "Control",
      icon: ShieldIcon,
      surface: "from-violet-100 via-indigo-50 to-white text-violet-700",
      tools: ["Reports", "Approvals"]
    },
    {
      title: "Onboarding",
      desc: "Submit and track community or pandit onboarding requests.",
      to: "/onboarding",
      badge: "Submit",
      icon: ClipboardIcon,
      surface: "from-emerald-100 via-teal-50 to-white text-emerald-700",
      tools: ["Requests", "Review flow"]
    },
  ];
  const visibleCards = cards.filter((card) => card.title !== "Admin" || user?.role === "ADMIN");
  const topStats = [
    { label: "Total Users", value: 20, icon: UsersIcon, color: "text-[#fac775]" },
    { label: "Active Today", value: 1, icon: ActivityIcon, color: "text-[#ef9f27]" },
    { label: "Communities", value: 6, icon: GlobeIcon, color: "text-[#c8782a]" },
    { label: "Events Live", value: 1, icon: RadioIcon, color: "text-[#854f0b]" }
  ];

  return (
    <Layout>
      <section className="aurora-shell p-8 sm:p-10">
        <HeroBanner
          tag="Hometown Hub"
          title="Digital Community Platform for Local Connection"
          sub="Reconnect with your hometown, participate in local events, and keep your community informed in one vibrant space."
          chips={["Local-first network", "Event alerts", "Onboarding workflow"]}
        />

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="section-kicker">Dashboard</p>
          <h1 className="section-title">Community Operations Center</h1>
          <p className="mt-4 max-w-2xl text-stone-600">
            Manage communities, posts, announcements, discussions, events, and notifications from a single place.
          </p>
        </motion.div>

        <div className="mt-6 flex flex-wrap gap-3">
          <span className="metric-pill">
            <SparkIcon className="h-4 w-4 text-amber-600" />
            Experience
            <span className="metric-value">Animated</span>
          </span>
          <span className="metric-pill">
            <CommunityIcon className="h-4 w-4 text-brand" />
            Communities
            <span className="metric-value">Hyperlocal</span>
          </span>
          <span className="metric-pill">
            <ShieldIcon className="h-4 w-4 text-emerald-600" />
            Access
            <span className="metric-value">{user?.role || "User"}</span>
          </span>
          <span className="metric-pill">
            <span className="live-dot" />
            Platform
            <span className="metric-value">Live</span>
          </span>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {topStats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                className="stat-card"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-stone-500">
                    {item.label}
                  </span>
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div className="text-3xl font-bold text-stone-900">
                  <AnimatedCounter value={item.value} />
                </div>
                <div className="progress-bar mt-3">
                  <div className="progress-fill" style={{ width: `${Math.min(100, item.value * 12)}%` }} />
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleCards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
            >
              <Link
                to={card.to}
                className="feature-card block h-full"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className={`icon-surface bg-gradient-to-br ${card.surface}`}>
                    <card.icon className="h-7 w-7" />
                  </span>
                  <span className="metric-pill">{card.badge}</span>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-stone-900">{card.title}</h3>
                <p className="mt-2 text-sm text-stone-600">{card.desc}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {card.tools.map((tool) => (
                    <span key={tool} className="tool-chip">
                      <SparkIcon className="h-3.5 w-3.5 text-brand" />
                      {tool}
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-brand">
                  Open tool
                  <ArrowUpRightIcon className="h-4 w-4" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </Layout>
  );
}

export default Dashboard;
