import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useContext } from "react";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import {
  ArrowUpRightIcon,
  BellIcon,
  ChartIcon,
  ClipboardIcon,
  CommunityIcon,
  PulseIcon,
  ShieldIcon,
  SparkIcon,
  UserIcon
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
    { label: "Live tools", value: visibleCards.length, icon: SparkIcon },
    { label: "Member role", value: user?.role || "USER", icon: ShieldIcon },
    { label: "Always-on flow", value: "24/7", icon: PulseIcon }
  ];

  return (
    <Layout>
      <section className="aurora-shell p-8 sm:p-10">
        <div className="hero-banner mb-8">
          <div className="hero-content grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)] lg:items-center">
            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="hero-chip">
                  <SparkIcon className="h-4 w-4" />
                  Hometown Hub
                </span>
                <span className="hero-chip">
                  <CommunityIcon className="h-4 w-4" />
                  Local-first network
                </span>
              </div>
              <h1 className="text-3xl font-bold sm:text-5xl">
                A living hometown dashboard that feels active, social, and real
              </h1>
              <p className="mt-4 max-w-3xl text-sm text-white/90 sm:text-base">
                Reconnect with your hometown, coordinate local events, and keep every community update, request, and conversation in one animated space.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <span className="hero-chip">
                  <BellIcon className="h-4 w-4" />
                  Event alerts
                </span>
                <span className="hero-chip">
                  <ClipboardIcon className="h-4 w-4" />
                  Onboarding workflow
                </span>
                <span className="hero-chip">
                  <ChartIcon className="h-4 w-4" />
                  Community control
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {topStats.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: idx * 0.08 }}
                    className="hero-stat"
                  >
                    <div className="flex items-center gap-3">
                      <span className="icon-badge h-10 w-10 rounded-xl">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/72">
                          {item.label}
                        </p>
                        <p className="mt-1 text-xl font-bold text-white">{item.value}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

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
