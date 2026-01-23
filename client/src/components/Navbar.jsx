import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useClerk, useUser, UserButton } from "@clerk/clerk-react";

/* Book icon for Clerk menu */
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
    { name: "Hotels", path: "/room" },
    { name: "Experience", path: "/" },
    { name: "About", path: "/" },
  ];

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { openSignIn } = useClerk();
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {

    if(location.pathname !== '/'){
      setIsScrolled(true);
      return;

    }else {
      setIsScrolled(false)
    }
    setIsScrolled(prev => location.pathname !== '/' ? true : prev);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 transition-all duration-500
        ${
          isScrolled
            ? "bg-white/80 shadow-md backdrop-blur-lg text-gray-700 py-3 md:py-4"
            : "text-white py-4 md:py-6"
        }`}
    >
      {/* Logo */}
      <Link to="/">
        <img
          src={assets.logo}
          alt="logo"
          className={`h-9 transition-all ${
            isScrolled ? "invert opacity-80" : ""
          }`}
        />
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-4 lg:gap-8">
        {navLinks.map((link, i) => (
          <Link
            key={i}
            to={link.path}
            className={`group flex flex-col gap-0.5 ${
              isScrolled ? "text-gray-700" : "text-white"
            }`}
          >
            {link.name}
            <span
              className={`h-0.5 w-0 group-hover:w-full transition-all duration-300 ${
                isScrolled ? "bg-gray-700" : "bg-white"
              }`}
            />
          </Link>
        ))}

        {/* Dashboard (only when logged in) */}
        {user && (
          <button
            onClick={() => navigate("/owner")}
            className={`border px-4 py-1 text-sm rounded-full transition-all ${
              isScrolled ? "text-black" : "text-white"
            }`}
          >
            Dashboard
          </button>
        )}
      </div>

      {/* Desktop Right */}
      <div className="hidden md:flex items-center gap-4">
        <img
          src={assets.searchIcon}
          alt="search"
          className={`h-7 transition-all duration-500 ${
            isScrolled ? "invert" : ""
          }`}
        />

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
            className="bg-black text-white px-8 py-2.5 rounded-full ml-4 transition-all duration-500"
          >
            Login
          </button>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="flex items-center gap-3 md:hidden">
        <img
          src={assets.menuIcon}
          alt="menu"
          onClick={() => setIsMenuOpen(true)}
          className={`h-4 cursor-pointer ${
            isScrolled ? "invert" : ""
          }`}
        />
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 h-screen w-full bg-white flex flex-col items-center justify-center gap-6 text-gray-800 transition-transform duration-500 md:hidden
          ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <button
          onClick={() => setIsMenuOpen(false)}
          className="absolute top-6 right-6"
        >
          <img src={assets.closeIcon} alt="close" className="h-6" />
        </button>

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
              navigate("/owner");
              setIsMenuOpen(false);
            }}
            className="border px-4 py-1 rounded-full"
          >
            Dashboard
          </button>
        )}

        {!user && (
          <button
            onClick={openSignIn}
            className="bg-black text-white px-8 py-2.5 rounded-full"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
