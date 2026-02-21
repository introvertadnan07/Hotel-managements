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

const Navbar = () => {
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Hotels", path: "/rooms" },
    { name: "Experience", path: "/" },
    { name: "About", path: "/" },
  ];

  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const location = useLocation();
  const isOwnerPage = location.pathname.startsWith("/owner");

  const { openSignIn } = useClerk();
  const {
    user,
    navigate,
    isOwner,
    isCheckingOwner,
    setShowHotelReg,
  } = useAppContext();

  // ✅ Scroll detection
  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Lock body scroll when mobile menu open
  React.useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isMenuOpen]);

  const navStyle =
    isOwnerPage || isScrolled
      ? "bg-white shadow-sm text-gray-700"
      : "bg-transparent text-white drop-shadow-sm";

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${navStyle}`}
    >
      <div className="h-20 px-6 md:px-16 lg:px-24 xl:px-32 flex items-center justify-between">

        {/* ✅ Logo */}
        <Link to="/">
          <img
            src={assets.logo}
            alt="logo"
            className={`h-9 ${
              isOwnerPage || isScrolled ? "invert opacity-80" : ""
            }`}
          />
        </Link>

        {/* ✅ Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;

            return (
              <Link
                key={link.name}
                to={link.path}
                className={`transition ${
                  isActive
                    ? "text-purple-500 font-medium"
                    : "text-inherit hover:text-purple-400"
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          {/* ✅ Owner Button */}
          {user && (
            <button
              disabled={isCheckingOwner}
              onClick={() => {
                if (isOwner) {
                  navigate("/owner");
                } else {
                  setShowHotelReg(true);
                }
              }}
              className={`border px-4 py-1 rounded-full transition ${
                isCheckingOwner
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-black hover:text-white"
              }`}
            >
              {isCheckingOwner
                ? "Loading..."
                : isOwner
                ? "Dashboard"
                : "List Your Hotel"}
            </button>
          )}
        </div>

        {/* ✅ Right Side */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Action
                  label="My Bookings"
                  labelIcon={<BookIcon />}
                  onClick={() => navigate("/my-bookings")}
                />
              </UserButton.MenuItems>
            </UserButton>
          ) : (
            <button
              onClick={openSignIn}
              className="bg-black text-white px-8 py-2.5 rounded-full hover:bg-gray-800 transition"
            >
              Login
            </button>
          )}
        </div>

        {/* ✅ Mobile Menu Icon */}
        <div className="md:hidden">
          <img
            src={assets.menuIcon}
            alt="menu"
            onClick={() => setIsMenuOpen(true)}
            className={`h-4 cursor-pointer ${
              isOwnerPage || isScrolled ? "invert" : ""
            }`}
          />
        </div>
      </div>

      {/* ✅ Mobile Menu */}
      <div
        className={`fixed inset-0 bg-white z-[999] md:hidden transform transition-transform duration-300 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <img
          src={assets.closeIcon}
          alt="close"
          className="absolute top-6 right-6 h-5 cursor-pointer"
          onClick={() => setIsMenuOpen(false)}
        />

        <div className="flex flex-col items-center gap-6 mt-24">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsMenuOpen(false)}
              className="text-lg text-gray-700 hover:text-purple-500 transition"
            >
              {link.name}
            </Link>
          ))}

          {user && (
            <button
              disabled={isCheckingOwner}
              onClick={() => {
                setIsMenuOpen(false);

                if (isOwner) {
                  navigate("/owner");
                } else {
                  setShowHotelReg(true);
                }
              }}
              className={`border px-6 py-2 rounded-full transition ${
                isCheckingOwner
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-black hover:text-white"
              }`}
            >
              {isCheckingOwner
                ? "Loading..."
                : isOwner
                ? "Dashboard"
                : "List Your Hotel"}
            </button>
          )}

          {!user && (
            <button
              onClick={openSignIn}
              className="bg-black text-white px-8 py-2 rounded-full"
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