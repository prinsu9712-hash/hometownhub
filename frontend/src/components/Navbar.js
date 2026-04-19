import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isHomePage = location.pathname === "/";
  const isGuestPage = !user && !isHomePage;

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const userLinkStyle = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition ${
      isActive
        ? "bg-white text-[#2c1810] shadow-sm"
        : "text-[#f5e7d3]/82 hover:bg-white/12 hover:text-white"
    }`;

  const publicTextLinkClass =
    "rounded-full px-3 py-2 text-sm font-semibold text-[#2c1810]/72 transition hover:text-[#c4622d]";
  const publicButtonClass =
    "inline-flex min-h-10 items-center justify-center rounded-full px-4 text-sm font-semibold transition";

  const userLinks = useMemo(() => {
    const links = [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/communities", label: "Communities" },
      { to: "/profile", label: "Profile" },
      { to: "/notifications", label: "Notifications" },
      { to: "/onboarding", label: "Onboarding" }
    ];

    if (user?.role === "ADMIN") {
      links.push({ to: "/admin", label: "Admin" });
    }

    return links;
  }, [user?.role]);

  const guestLinks = isHomePage
    ? [
        { href: "#features", label: "Features" },
        { href: "#communities", label: "Communities" },
        { href: "#feed", label: "Live feed" },
        { href: "#how-it-works", label: "How it works" }
      ]
    : [{ to: "/", label: "Home" }];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMobileMenu();
    navigate("/", { replace: true });
  };

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl ${
        user
          ? "border-white/10 bg-[#2c1810]/88"
          : isHomePage
            ? "border-[#c4622d]/14 bg-[#faf3e8]/88"
            : "border-[#c4622d]/12 bg-[#fffaf5]/94"
      }`}
    >
      <div className="mx-auto w-full max-w-[1180px] px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            to={user ? "/dashboard" : "/"}
            className="inline-flex items-center gap-3"
            onClick={closeMobileMenu}
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-extrabold tracking-[0.18em] ${
                user
                  ? "bg-gradient-to-br from-[#c4622d] to-[#ff7a35] text-white"
                  : "bg-gradient-to-br from-[#c4622d]/15 to-[#e8a838]/20 text-[#c4622d]"
              }`}
            >
              HH
            </span>
            <span
              className={`font-['Playfair_Display'] text-xl font-black tracking-tight ${
                user ? "text-[#faf3e8]" : "text-[#c4622d]"
              }`}
              style={{ fontFamily: '"Playfair Display", "Outfit", serif' }}
            >
              Hometown Hub
            </span>
          </Link>

          {user ? (
            <>
              <div className="hidden items-center justify-end gap-2 md:flex">
                <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-[#f5e7d3]">
                  {user.name}
                </span>
                {userLinks.map((item) => (
                  <NavLink key={item.to} className={userLinkStyle} to={item.to}>
                    {item.label}
                  </NavLink>
                ))}
                <button
                  className="rounded-full border border-white/16 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/16"
                  onClick={handleLogout}
                  type="button"
                >
                  Logout
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 text-white md:hidden"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? "Close" : "Menu"}
              </button>
            </>
          ) : (
            <>
              <div className="hidden items-center gap-2 md:flex">
                {isHomePage &&
                  guestLinks.map((item) => (
                    <a key={item.href} className={publicTextLinkClass} href={item.href}>
                      {item.label}
                    </a>
                  ))}
                {!isHomePage && (
                  <Link className={publicTextLinkClass} to="/">
                    Home
                  </Link>
                )}
              </div>

              <div className="hidden items-center gap-2 sm:flex">
                {isGuestPage && (
                  <Link className={publicTextLinkClass} to="/" onClick={closeMobileMenu}>
                    Home
                  </Link>
                )}
                <Link
                  className={`${publicButtonClass} border border-[#2c1810]/12 bg-white text-[#2c1810] hover:border-[#c4622d]/22 hover:text-[#c4622d]`}
                  to="/login"
                >
                  Login
                </Link>
                <Link
                  className={`${publicButtonClass} bg-[#c4622d] text-white hover:bg-[#ff7a35]`}
                  to="/register"
                >
                  Register
                </Link>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#c4622d]/25 text-[#2c1810] sm:hidden"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? "Close" : "Menu"}
              </button>
            </>
          )}
        </div>

        {isMobileMenuOpen && (
          <div
            className={`mt-3 rounded-2xl border p-3 shadow-lg md:hidden ${
              user
                ? "border-white/10 bg-[#2f1c13]/95"
                : "border-[#c4622d]/20 bg-white/95"
            }`}
          >
            {user ? (
              <div className="space-y-2">
                <p className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-[#f5e7d3]">
                  {user.name}
                </p>
                {userLinks.map((item) => (
                  <NavLink
                    key={item.to}
                    className={userLinkStyle}
                    to={item.to}
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </NavLink>
                ))}
                <button
                  className="mt-1 w-full rounded-full border border-white/16 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/16"
                  onClick={handleLogout}
                  type="button"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {isHomePage
                  ? guestLinks.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className={`${publicTextLinkClass} block`}
                        onClick={closeMobileMenu}
                      >
                        {item.label}
                      </a>
                    ))
                  : guestLinks.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`${publicTextLinkClass} block`}
                        onClick={closeMobileMenu}
                      >
                        {item.label}
                      </Link>
                    ))}
                <Link
                  to="/login"
                  className={`${publicButtonClass} w-full border border-[#2c1810]/12 bg-white text-[#2c1810] hover:border-[#c4622d]/22 hover:text-[#c4622d]`}
                  onClick={closeMobileMenu}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`${publicButtonClass} w-full bg-[#c4622d] text-white hover:bg-[#ff7a35]`}
                  onClick={closeMobileMenu}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
