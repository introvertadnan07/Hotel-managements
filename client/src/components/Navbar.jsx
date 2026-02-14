import React from "react";
import { Link, useLocation } from "react-router-dom";
import { assets } from "../assets/assets";
import { useClerk, UserButton } from "@clerk/clerk-react";
import { useAppContext } from "../context/AppContext";

const BookIcon = () => (
  <svg
    className="w-4 h-4 text-gray-700"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
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
  const { user, navigate, isOwner, setShowHotelReg } = useAppContext();

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isMenuOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isOwnerPage || isScrolled
          ? "bg-white shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="h-20 px-4 md:px-16 lg:px-24 xl:px-32 flex items-center justify-between">

        {/* Logo */}
        <Link to="/">
          <img
            src={assets.logo}
            alt="logo"
            className={`h-9 ${
              isOwnerPage || isScrolled ? "invert opacity-80" : ""
            }`}
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link, i) => (
            <Link
              key={i}
              to={link.path}
              className={
                isOwnerPage || isScrolled
                  ? "text-gray-700"
                  : "text-white"
              }
            >
              {link.name}
            </Link>
          ))}

          {user && (
            <button
              onClick={() =>
                isOwner ? navigate("/owner") : setShowHotelReg(true)
              }
              className={`border px-4 py-1 rounded-full ${
                isOwnerPage || isScrolled
                  ? "text-black"
                  : "text-white"
              }`}
            >
              {isOwner ? "Dashboard" : "List Your Hotel"}
            </button>
          )}
        </div>

        {/* Right Side */}
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
              className="bg-black text-white px-8 py-2.5 rounded-full"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile */}
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

      {/* Mobile Menu */}
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
          {navLinks.map((link, i) => (
            <Link
              key={i}
              to={link.path}
              onClick={() => setIsMenuOpen(false)}
              className="text-lg"
            >
              {link.name}
            </Link>
          ))}

          {user && (
            <button
              onClick={() => {
                setIsMenuOpen(false);
                isOwner ? navigate("/owner") : setShowHotelReg(true);
              }}
              className="border px-6 py-2 rounded-full"
            >
              {isOwner ? "Dashboard" : "List Your Hotel"}
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
