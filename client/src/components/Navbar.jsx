import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const Navbar = () => {
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Hotels", path: "/room" },
    { name: "Experience", path: "/" },
    { name: "About", path: "/" },
  ];

  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 transition-all duration-500
        ${
          isScrolled
            ? "bg-white/80 shadow-md backdrop-blur-lg text-gray-700 py-3 md:py-4"
            : "py-4 md:py-6"
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
        <button
          className={`border px-4 py-1 text-sm rounded-full transition-all ${
            isScrolled ? "text-black" : "text-white"
          }`}
        >
          Dashboard
        </button>
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
        <button className="bg-black text-white px-8 py-2.5 rounded-full ml-4 transition-all duration-500">
          Login
        </button>
      </div>

      {/* Mobile Menu Button */}
      <div className="flex items-center gap-3 md:hidden">
        <img onClick={() => setIsMenuOpen(!isMenuOpen)} src={assets.menuIcon} alt="" className= {`&{isScrolled && "invert"} h-4`}/>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 h-screen w-full bg-white flex flex-col items-center justify-center gap-6 text-gray-800 transition-transform duration-500 md:hidden
          ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsMenuOpen(false)}>
            <img src={assets.closeIcon} alt = "close-menu" className="h-6.5" />
          ✕
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

        <button className="border px-4 py-1 rounded-full">
          Dashboard
        </button>

        <button className="bg-black text-white px-8 py-2.5 rounded-full">
          Login
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
