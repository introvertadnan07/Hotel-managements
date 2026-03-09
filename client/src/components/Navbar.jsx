import React from "react";
import { Link, useLocation } from "react-router-dom";
import { assets } from "../assets/assets";
import { useClerk, UserButton } from "@clerk/clerk-react";
import { useAppContext } from "../context/AppContext";

const BookIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
    <path
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 19V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v13H7a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h12M9 3v14m7 0v4"
    />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 21s-6.716-4.35-9.193-7.364C.84 11.29 1.13 7.9 3.514 6.1c2.07-1.56 4.927-1.12 6.486.97C11.559 4.98 14.416 4.54 16.486 6.1c2.385 1.8 2.674 5.19.707 7.536C18.716 16.65 12 21 12 21Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SunIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const Navbar = () => {
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Hotels", path: "/rooms" },
    { name: "Wishlist", path: "/wishlist" },
    { name: "Experience", path: "/experience" },
    { name: "About", path: "/about" },
  ];

  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const location = useLocation();
  const isOwnerPage = location.pathname.startsWith("/owner");
  const isHomePage = location.pathname === "/";

  const { openSignIn } = useClerk();
  const {
    user,
    navigate,
    isOwner,
    isCheckingOwner,
    setShowHotelReg,
    darkMode,
    toggleDarkMode,
  } = useAppContext();

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isMenuOpen]);

  const navStyle =
    !isHomePage || isOwnerPage || isScrolled
      ? "bg-white dark:bg-gray-900 shadow-sm text-black dark:text-white"
      : "bg-transparent text-white";

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${navStyle}`}>
      <div className="h-20 px-6 md:px-16 lg:px-24 xl:px-32 flex items-center justify-between">

        {/* ✅ Text-only Logo */}
        <Link to="/">
          <span
            className={`text-xl font-playfair font-semibold tracking-wide transition ${
              !isHomePage || isOwnerPage || isScrolled
                ? "text-black dark:text-white"
                : "text-white"
            }`}
          >
            AnumiflyStay
          </span>
        </Link>

        {/* ✅ Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`relative transition hover:text-gray-500 dark:hover:text-gray-300 ${
                isActive(link.path) ? "font-semibold" : ""
              }`}
            >
              {link.name}
              {isActive(link.path) && (
                <span className="absolute left-0 -bottom-1 w-full h-[2px] bg-black dark:bg-white rounded-full" />
              )}
            </Link>
          ))}

          {user && (
            <button
              disabled={isCheckingOwner}
              onClick={() => {
                if (isOwner) navigate("/owner");
                else setShowHotelReg(true);
              }}
              className={`border px-4 py-1 rounded-full transition dark:border-gray-600 ${
                isCheckingOwner
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
              }`}
            >
              {isCheckingOwner ? "Loading..." : isOwner ? "Dashboard" : "List Your Hotel"}
            </button>
          )}
        </div>

        {/* ✅ Right Side */}
        <div className="hidden md:flex items-center gap-4">

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>

          {user ? (
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Action
                  label="My Bookings"
                  labelIcon={<BookIcon />}
                  onClick={() => navigate("/my-bookings")}
                />
                <UserButton.Action
                  label="Wishlist"
                  labelIcon={<HeartIcon />}
                  onClick={() => navigate("/wishlist")}
                />
              </UserButton.MenuItems>
            </UserButton>
          ) : (
            <button
              onClick={openSignIn}
              className="bg-black dark:bg-white dark:text-black text-white px-8 py-2.5 rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition"
            >
              Login
            </button>
          )}
        </div>

        {/* ✅ Mobile Right */}
        <div className="md:hidden flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>

          <img
            src={assets.menuIcon}
            alt="menu"
            onClick={() => setIsMenuOpen(true)}
            className={`h-4 cursor-pointer ${
              !isHomePage || isOwnerPage || isScrolled ? "invert dark:invert-0" : ""
            }`}
          />
        </div>
      </div>

      {/* ✅ Mobile Menu */}
      <div
        className={`fixed inset-0 bg-white dark:bg-gray-900 z-[999] md:hidden transform transition-transform duration-300 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <img
          src={assets.closeIcon}
          alt="close"
          className="absolute top-6 right-6 h-5 cursor-pointer dark:invert"
          onClick={() => setIsMenuOpen(false)}
        />

        <div className="flex flex-col items-center gap-6 mt-24">
          <span className="text-2xl font-playfair font-semibold text-black dark:text-white mb-2">
            AnumiflyStay
          </span>

          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsMenuOpen(false)}
              className={`text-lg dark:text-white ${isActive(link.path) ? "font-semibold" : ""}`}
            >
              {link.name}
            </Link>
          ))}

          {user && (
            <button
              disabled={isCheckingOwner}
              onClick={() => {
                setIsMenuOpen(false);
                if (isOwner) navigate("/owner");
                else setShowHotelReg(true);
              }}
              className={`border px-6 py-2 rounded-full transition dark:border-gray-600 dark:text-white ${
                isCheckingOwner
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-black hover:text-white"
              }`}
            >
              {isCheckingOwner ? "Loading..." : isOwner ? "Dashboard" : "List Your Hotel"}
            </button>
          )}

          {!user && (
            <button
              onClick={openSignIn}
              className="bg-black dark:bg-white dark:text-black text-white px-8 py-2 rounded-full"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;