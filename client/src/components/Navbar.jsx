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

const Navbar = () => {
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Hotels", path: "/rooms" },
    { name: "Wishlist", path: "/wishlist" }, // ⭐ ADDED
    { name: "Experience", path: "/" },
    { name: "About", path: "/" },
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
    !isHomePage || isOwnerPage || isScrolled
      ? "bg-white shadow-sm text-black"
      : "bg-transparent text-white";

  // ✅ Active link style
  const isActive = (path) => location.pathname === path;

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
              !isHomePage || isOwnerPage || isScrolled
                ? "invert opacity-80"
                : ""
            }`}
          />
        </Link>

        {/* ✅ Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`transition hover:text-gray-500 ${
                isActive(link.path) ? "font-semibold" : ""
              }`}
            >
              {link.name}
            </Link>
          ))}

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

                {/* ⭐ Wishlist inside Clerk menu */}
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
              !isHomePage || isOwnerPage || isScrolled ? "invert" : ""
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
              className={`text-lg ${
                isActive(link.path) ? "font-semibold" : ""
              }`}
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